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
require('dotenv').config({
  path: `${process.cwd()}/.env`
})
// tslint:enable no-var-requires
import * as Hapi from 'hapi'
import { HOST, PORT } from '@ocrvs-chatbot/constants'
import chatbotHandler from '@ocrvs-chatbot/features/agecheck/handler'
import getPlugins from '@ocrvs-chatbot/config/plugins'

export async function createServer() {
  const server = new Hapi.Server({
    host: HOST,
    port: PORT,
    routes: {
      cors: { origin: ['*'] },
      payload: { maxBytes: 52428800 }
    }
  })

  /* add ping route by default for health check */
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
    method: 'POST',
    path: '/chatbot',
    handler: chatbotHandler,
    options: {
      tags: ['api'],
      description: 'OpenCRVS Chatbot service'
    }
  })

  await server.register(getPlugins())
  server.ext({
    type: 'onRequest',
    method(request: Hapi.Request & { sentryScope: any }, h) {
      request.sentryScope.setExtra('payload', request.payload)
      return h.continue
    }
  })

  async function stop() {
    await server.stop()
    server.log('info', 'server stopped')
  }

  async function start() {
    await server.start()
    server.log('info', `server started on ${HOST}:${PORT}`)
  }

  return { server, start, stop }
}

if (require.main === module) {
  createServer().then(server => server.start())
}
