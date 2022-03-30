/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
// tslint:disable no-var-requires
require('app-module-path').addPath(require('path').join(__dirname, '../'))

// tslint:enable no-var-requires
import fetch from 'node-fetch'
import * as Hapi from '@hapi/hapi'
import { readFileSync } from 'fs'
import getPlugins from '@countryconfig/config/plugins'
import * as usrMgntDB from '@countryconfig/database'
import {
  COUNTRY_CONFIG_HOST,
  COUNTRY_CONFIG_PORT,
  CERT_PUBLIC_KEY_PATH,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  COUNTRY_WIDE_CRUDE_DEATH_RATE
} from '@countryconfig/constants'
import {
  locationsHandler as farajalandLocationsHandler,
  statisticsHandler as farajalandStatisticsHandler
} from '@countryconfig/farajaland/features/administrative/handler'
import { facilitiesHandler as farajalandFacilitiesHandler } from '@countryconfig/farajaland/features/facilities/handler'
import { contentHandler as farajalandContentHandler } from '@countryconfig/farajaland/features/content/handler'
import { assetHandler as farajalandAssetHandler } from '@countryconfig/farajaland/features/assets/handler'
import {
  generatorHandler as farajalandGeneratorHandler,
  requestSchema as farajalandGeneratorRequestSchema,
  responseSchema as farajalandGeneratorResponseSchema
} from '@countryconfig/farajaland/features/generate/handler'
import { farajalandValidateRegistrationHandler } from '@countryconfig/farajaland/features/validate/handler'

import { join } from 'path'
import { birthNotificationHandler } from './farajaland/features/dhis2/features/notification/birth/handler'

const publicCert = readFileSync(CERT_PUBLIC_KEY_PATH)

export const verifyToken = async (token: string, authUrl: string) => {
  const res = await fetch(`${authUrl}/verifyToken`, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })

  const body = await res.json()

  if (body.valid === true) {
    return true
  }

  return false
}

const validateFunc = async (
  payload: any,
  request: Hapi.Request,
  checkInvalidToken: string,
  authUrl: string
) => {
  let valid
  if (checkInvalidToken === 'true') {
    valid = await verifyToken(
      request.headers.authorization.replace('Bearer ', ''),
      authUrl
    )
  }

  if (valid === true || checkInvalidToken !== 'true') {
    return {
      isValid: true,
      credentials: payload
    }
  }

  return {
    isValid: false
  }
}

export async function createServer() {
  const server = new Hapi.Server({
    host: COUNTRY_CONFIG_HOST,
    port: COUNTRY_CONFIG_PORT,
    routes: {
      cors: { origin: ['*'] }
    }
  })

  await server.register(getPlugins())

  server.auth.strategy('jwt', 'jwt', {
    key: publicCert,
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:countryconfig-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  // add ping route by default for health check

  server.route({
    method: 'GET',
    path: '/ping',
    handler: (request: any, h: any) => {
      // Perform any health checks and return true or false for success prop
      return {
        success: true
      }
    },
    options: {
      auth: false,
      tags: ['api'],
      description: 'Health check endpoint'
    }
  })

  server.route({
    method: 'GET',
    path: '/client-config.js',
    handler: (request, h) => {
      const file =
        process.env.NODE_ENV === 'production'
          ? './farajaland/config/client-config.prod.js'
          : './farajaland/config/client-config.js'
      // @ts-ignore
      return h.file(join(__dirname, file))
    },
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves client configuration as a static file'
    }
  })

  server.route({
    method: 'GET',
    path: '/login-config.js',
    handler: (request, h) => {
      const file =
        process.env.NODE_ENV === 'production'
          ? './farajaland/config/login-config.prod.js'
          : './farajaland/config/login-config.js'
      // @ts-ignore
      return h.file(join(__dirname, file))
    },
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves login client configuration as a static file'
    }
  })

  server.route({
    method: 'GET',
    path: '/locations',
    handler: farajalandLocationsHandler,
    options: {
      tags: ['api'],
      description: 'Returns Farajaland locations.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/facilities',
    handler: farajalandFacilitiesHandler,
    options: {
      tags: ['api'],
      description: 'Returns Farajaland facilities.json'
    }
  })

  server.route({
    method: 'GET',
    path: '/assets/{file}',
    handler: farajalandAssetHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves country specific assets, unprotected'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/{application}',
    handler: farajalandContentHandler,
    options: {
      auth: {
        mode: 'optional'
      },
      tags: ['api'],
      description: 'Serves language content'
    }
  })

  server.route({
    method: 'POST',
    path: '/validate/registration',
    handler: farajalandValidateRegistrationHandler,
    options: {
      tags: ['api'],
      description:
        'Validates a registration and if successful returns a BRN for that record'
    }
  })

  server.route({
    method: 'POST',
    path: '/generate/{type}',
    handler: farajalandGeneratorHandler,
    options: {
      tags: ['api'],
      validate: {
        payload: farajalandGeneratorRequestSchema
      },
      response: {
        schema: farajalandGeneratorResponseSchema
      },
      description:
        'Generates registration numbers based on country specific implementation logic'
    }
  })

  server.route({
    method: 'GET',
    path: '/crude-death-rate',
    handler: () => ({
      crudeDeathRate: COUNTRY_WIDE_CRUDE_DEATH_RATE
    }),
    options: {
      tags: ['api'],
      description: 'Serves country wise crude death rate'
    }
  })

  server.route({
    method: 'GET',
    path: '/pilotLocations',
    handler: () => ({}),
    options: {
      tags: ['api'],
      description: 'Serves current pilot location list'
    }
  })

  server.route({
    method: 'GET',
    path: '/statistics',
    handler: farajalandStatisticsHandler,
    options: {
      tags: ['api'],
      description:
        'Returns population and crude birth rate statistics for each location'
    }
  })

  server.route({
    method: 'POST',
    path: '/dhis2-notification/birth',
    handler: birthNotificationHandler,
    options: {
      tags: ['api'],
      description: 'Handles transformation and submission of birth notification'
    }
  })

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope: any }, h) {
      request.sentryScope.setExtra('payload', request.payload)
      return h.continue
    }
  })

  async function stop() {
    await server.stop()
    await usrMgntDB.disconnect()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    await usrMgntDB.connect()
    server.log(
      'info',
      `server started on ${COUNTRY_CONFIG_HOST}:${COUNTRY_CONFIG_PORT}`
    )
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
