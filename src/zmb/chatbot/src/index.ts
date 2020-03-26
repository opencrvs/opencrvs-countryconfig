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
import { TELEGRAM_API_KEY } from '@ocrvs-chatbot/constants'
import { chatbotHandler } from '@ocrvs-chatbot/features/agecheck/handler'
import * as TelegramBot from 'node-telegram-bot-api'
import { logger } from '@ocrvs-chatbot/logger'
import { Database } from '@ocrvs-chatbot/database'

export async function createChatbot() {
  const bot = new TelegramBot(TELEGRAM_API_KEY, { polling: true })
  logger.info(`Chatbot started`)

  bot.on('message', msg => {
    chatbotHandler(bot, msg)
  })

  async function stop() {
    await Database.stop()
    logger.info(`Database started`)
  }

  async function start() {
    await Database.start()
    logger.info(`Database started`)
  }

  return { bot, start, stop }
}

if (require.main === module) {
  createChatbot().then(server => server.start())
}
