/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
require('app-module-path').addPath(require('path').join(__dirname))
require('dotenv').config()

import fetch from 'node-fetch'
import path from 'path'
import Handlebars from 'handlebars'
import * as Hapi from '@hapi/hapi'
import * as Pino from 'hapi-pino'
import * as JWT from 'hapi-auth-jwt2'
import * as inert from '@hapi/inert'
import * as Sentry from 'hapi-sentry'
import * as H2o2 from '@hapi/h2o2'
import {
  CLIENT_APP_URL,
  DOMAIN,
  GATEWAY_URL,
  LOGIN_URL,
  SENTRY_DSN
} from '@countryconfig/constants'
import {
  COUNTRY_CONFIG_HOST,
  COUNTRY_CONFIG_PORT,
  CHECK_INVALID_TOKEN,
  AUTH_URL,
  DEFAULT_TIMEOUT
} from '@countryconfig/constants'
import { statisticsHandler } from '@countryconfig/api/data-generator/handler'
import {
  contentHandler,
  countryLogoHandler
} from '@countryconfig/api/content/handler'
import { eventRegistrationHandler } from '@countryconfig/api/event-registration/handler'
import decode from 'jwt-decode'
import { join } from 'path'
import { logger } from '@countryconfig/logger'
import {
  emailHandler,
  emailSchema,
  notificationHandler,
  notificationSchema
} from './api/notification/handler'
import { ErrorContext } from 'hapi-auth-jwt2'
import { mapGeojsonHandler } from '@countryconfig/api/dashboards/handler'
import { formHandler } from '@countryconfig/form'
import { locationsHandler } from './data-seeding/locations/handler'
import { certificateHandler } from './api/certificates/handler'
import { rolesHandler } from './data-seeding/roles/handler'
import { usersHandler } from './data-seeding/employees/handler'
import { applicationConfigHandler } from './api/application/handler'
import { validatorsHandler } from './form/common/custom-validation-conditionals/validators-handler'
import { conditionalsHandler } from './form/common/custom-validation-conditionals/conditionals-handler'
import { COUNTRY_WIDE_CRUDE_DEATH_RATE } from './api/application/application-config'
import { handlebarsHandler } from './form/common/certificate/handlebars/handler'
import { trackingIDHandler } from './api/tracking-id/handler'
import { dashboardQueriesHandler } from './api/dashboards/handler'
import { fontsHandler } from './api/fonts/handler'
import { recordNotificationHandler } from './api/record-notification/handler'
import {
  getCustomEventsHandler,
  onAnyActionHandler,
  onRegisterHandler
} from '@countryconfig/api/custom-event/handler'
import { readFileSync } from 'fs'

export interface ITokenPayload {
  sub: string
  exp: string
  algorithm: string
  scope: string[]
}

export default function getPlugins() {
  const plugins: any[] = [inert, JWT, H2o2]

  if (process.env.NODE_ENV === 'production') {
    plugins.push({
      plugin: Pino,
      options: {
        prettyPrint: false,
        logPayload: false,
        instance: logger
      }
    })
  }

  if (SENTRY_DSN) {
    plugins.push({
      plugin: Sentry,
      options: {
        client: {
          environment: process.env.NODE_ENV,
          dsn: SENTRY_DSN
        },
        catchLogErrors: true
      }
    })
  }

  return plugins
}

const getTokenPayload = (token: string): ITokenPayload => {
  let decoded: ITokenPayload
  try {
    decoded = decode(token)
  } catch (err) {
    throw new Error(
      `getTokenPayload: Error occurred during token decode : ${err}`
    )
  }
  return decoded
}

export function hasScope(token: string, scope: string) {
  const tokenPayload = getTokenPayload(token)
  return (tokenPayload.scope && tokenPayload.scope.indexOf(scope) > -1) || false
}

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
  checkInvalidToken: boolean,
  authUrl: string
) => {
  let valid
  if (checkInvalidToken) {
    valid = await verifyToken(
      request.headers.authorization.replace('Bearer ', ''),
      authUrl
    )
  }

  if (valid === true || !checkInvalidToken) {
    return {
      isValid: true,
      credentials: payload
    }
  }

  return {
    isValid: false
  }
}

async function getPublicKey(): Promise<string> {
  try {
    const response = await fetch(`${AUTH_URL}/.well-known`)
    return response.text()
  } catch (error) {
    logger.error(
      `Failed to fetch public key from Core. Make sure Core is running, and you are able to connect to ${AUTH_URL}/.well-known.`
    )
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return getPublicKey()
  }
}

export async function createServer() {
  let whitelist: string[] = [DOMAIN]
  if (DOMAIN[0] !== '*') {
    whitelist = [LOGIN_URL, CLIENT_APP_URL]
  }
  logger.info(`Whitelist: ${JSON.stringify(whitelist)}`)
  const server = new Hapi.Server({
    host: COUNTRY_CONFIG_HOST,
    port: COUNTRY_CONFIG_PORT,
    routes: {
      cors: { origin: whitelist },
      payload: { maxBytes: 52428800, timeout: DEFAULT_TIMEOUT }
    }
  })

  await server.register(getPlugins())

  let publicKey = await getPublicKey()
  let publicKeyUpdatedAt = Date.now()

  server.auth.strategy('jwt', 'jwt', {
    key: () => ({ key: publicKey }),
    errorFunc: (errorContext: ErrorContext) => {
      /*
       * If an incoming request fails with a 401 Unauthorized, we need to check if the
       * public key we have is still valid. If it is not, we fetch a new one.
       * This is done only once every minute to avoid invalid tokens spamming the server.
       */

      const moreThanAMinuteFromLatestUpdate =
        publicKeyUpdatedAt < Date.now() - 60000
      if (
        errorContext.errorType === 'unauthorized' &&
        moreThanAMinuteFromLatestUpdate
      ) {
        logger.info(
          'Request failed, fetching a new public key. This might either be a client with an outdated token or the server public key being outdated. Trying to update the server public key...'
        )
        getPublicKey()
          .then((newPublicKey) => {
            logger.info('Key fetched, updating')
            publicKeyUpdatedAt = Date.now()
            publicKey = newPublicKey
          })
          .catch((err) => {
            logger.error('Fetching a new public key failed', err)
          })
      }
      return errorContext
    },
    verifyOptions: {
      algorithms: ['RS256'],
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:countryconfig-user'
    },
    validate: (payload: any, request: Hapi.Request) =>
      validateFunc(payload, request, CHECK_INVALID_TOKEN, AUTH_URL)
  })

  server.auth.default('jwt')

  server.route({
    method: 'GET',
    path: '/certificates/{id}',
    handler: certificateHandler,
    options: {
      tags: ['api', 'certificates'],
      description: 'Returns only one certificate metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/certificates',
    handler: certificateHandler,
    options: {
      tags: ['api', 'certificates'],
      description: 'Returns certificate metadata'
    }
  })

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
    path: '/fonts/{filename}',
    handler: fontsHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves available fonts'
    }
  })

  server.route({
    method: 'GET',
    path: '/client-config.js',
    handler: async (request, h) => {
      const file =
        process.env.NODE_ENV === 'production'
          ? '/client-config.prod.js'
          : '/client-config.js'

      if (process.env.NODE_ENV !== 'production') {
        const template = Handlebars.compile(
          readFileSync(join(__dirname, file), 'utf8')
        )
        const result = template({ V2_EVENTS: process.env.V2_EVENTS || false })
        return h.response(result).type('application/javascript')
      }

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
          ? '/login-config.prod.js'
          : '/login-config.js'
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
    path: '/handlebars.js',
    handler: handlebarsHandler,
    options: {
      auth: false,
      tags: ['api'],
      description:
        'Serves custom handlebar helper functions as JS to be used in certificates'
    }
  })

  server.route({
    method: 'GET',
    path: '/validators.js',
    handler: validatorsHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves validation functions as JS'
    }
  })

  server.route({
    method: 'GET',
    path: '/conditionals.js',
    handler: conditionalsHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves conditionals as JS'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/{application}',
    handler: contentHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves language content'
    }
  })

  server.route({
    method: 'GET',
    path: '/dashboards/queries.json',
    handler: dashboardQueriesHandler,
    options: {
      tags: ['api'],
      auth: false,
      description: 'Serves dashboard view refresher queries'
    }
  })

  server.route({
    method: 'GET',
    path: '/forms',
    handler: formHandler,
    options: {
      tags: ['api'],
      description: 'Serves form configuration'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/map.geojson',
    handler: mapGeojsonHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves map geojson'
    }
  })

  server.route({
    method: 'GET',
    path: '/content/country-logo',
    handler: countryLogoHandler,
    options: {
      auth: false,
      tags: ['api'],
      description: 'Serves country logo'
    }
  })

  server.route({
    method: 'POST',
    path: '/event-registration',
    handler: eventRegistrationHandler,
    options: {
      tags: ['api'],
      description:
        'Opportunity for sychrounous integrations with 3rd party systems as a final step in event registration. If successful returns identifiers for that event.'
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
    path: '/statistics',
    handler: statisticsHandler,
    options: {
      tags: ['api'],
      description:
        'Returns population and crude birth rate statistics for each location'
    }
  })

  server.route({
    method: 'POST',
    path: '/notification',
    handler: notificationHandler,
    options: {
      tags: ['api'],
      auth: false,
      validate: {
        payload: notificationSchema
      },
      description:
        'Handles sending either SMS or email using a predefined template file'
    }
  })

  server.route({
    method: 'POST',
    path: '/email',
    handler: emailHandler,
    options: {
      /*
       * In deployed environments, the email path is blocked by Traefik.
       * See docker-compose.deploy.yml for more details.
       */
      auth: false,
      tags: ['api'],
      validate: {
        payload: emailSchema
      },
      description: 'Handles sending email using a predefined template file'
    }
  })

  server.route({
    method: 'GET',
    path: '/application-config',
    handler: applicationConfigHandler,
    options: {
      auth: false,
      tags: ['api', 'application-config'],
      description: 'Returns default application configuration'
    }
  })

  server.route({
    method: 'GET',
    path: '/locations',
    handler: locationsHandler,
    options: {
      auth: false,
      tags: ['api', 'locations'],
      description: 'Returns the locations metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/roles',
    handler: rolesHandler,
    options: {
      auth: false,
      tags: ['api', 'user-roles'],
      description: 'Returns user roles metadata'
    }
  })

  server.route({
    method: 'GET',
    path: '/users',
    handler: usersHandler,
    options: {
      tags: ['api', 'users'],
      description: 'Returns users metadata'
    }
  })

  server.route({
    method: 'POST',
    path: '/tracking-id',
    handler: trackingIDHandler,
    options: {
      tags: ['api'],
      description: 'Provides a tracking id'
    }
  })

  server.route({
    method: '*',
    path: '/graphql',
    handler: (_, h) =>
      h.proxy({
        uri: `${GATEWAY_URL}/graphql`,
        passThrough: true
      }),
    options: {
      auth: false,
      payload: {
        output: 'data',
        parse: false
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{param*}',
    options: {
      auth: false
    },
    handler: {
      directory: {
        path: 'public',
        index: ['index.html', 'default.html']
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/static/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, 'client-static'),
        redirectToSlash: true,
        index: false
      }
    },
    options: {
      auth: false,
      tags: ['api', 'static'],
      description: 'Server static files for client'
    }
  })

  server.route({
    method: 'GET',
    path: '/record-notification',
    handler: recordNotificationHandler,
    options: {
      tags: ['api'],
      description: 'Checks for enabled notification for record'
    }
  })

  server.route({
    method: 'GET',
    path: '/events',
    handler: getCustomEventsHandler,
    options: {
      tags: ['api', 'custom-event'],
      description: 'Serves custom events'
    }
  })

  server.route({
    method: 'POST',
    path: '/events/TENNIS_CLUB_MEMBERSHIP/actions/REGISTER',
    handler: onRegisterHandler,
    options: {
      tags: ['api', 'custom-event'],
      description: 'Receives notifications on event actions'
    }
  })

  server.route({
    method: 'POST',
    path: '/events/{event}/actions/{action}',
    handler: onAnyActionHandler,
    options: {
      tags: ['api', 'custom-event'],
      description: 'Receives notifications on event actions'
    }
  })

  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope?: any }, h) {
      request.sentryScope?.setExtra('payload', request.payload)
      return h.continue
    }
  })

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    server.log(
      'info',
      `server started on ${COUNTRY_CONFIG_HOST}:${COUNTRY_CONFIG_PORT}`
    )
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then((server) => server.start())
}
