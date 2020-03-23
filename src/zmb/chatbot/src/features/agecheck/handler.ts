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
import * as TelegramBot from 'node-telegram-bot-api'
import {
  getLoggedInUser,
  validateFunc,
  storeAccessDetails,
  checkAccessDetails,
  storeLoggedInUser,
  authenticateUser,
  clearAllDetails
} from '@ocrvs-chatbot/utils/auth'
import { AUTH_URL } from '@ocrvs-chatbot/constants'
import {
  LOGIN_AGAIN_PROMPT,
  LOGIN_PROMPT,
  REQUEST_PASSWORD,
  INVALID_LOGIN_DETAILS,
  EXPIRED_AUTHENTICATION_PROCESS
} from '@ocrvs-chatbot/features/agecheck/chat'
import { advanceChatFlow } from '@ocrvs-chatbot/features/agecheck/service'

export async function chatbotHandler(
  bot: TelegramBot,
  msg: TelegramBot.Message
) {
  const chatbotUser = await getLoggedInUser(msg)
  // check if the user chat is stored in database
  if (chatbotUser) {
    // if user chat exists in the database check if token is valid before continuing
    const isValid = await validateFunc(chatbotUser.token, true, AUTH_URL)
    if (isValid.token) {
      await advanceChatFlow(bot, msg)
    } else {
      // token is invalid, login again
      await clearAllDetails(msg)
      await storeAccessDetails(msg.chat.id)
      await advanceChatFlow(bot, msg, LOGIN_AGAIN_PROMPT)
    }
  } else {
    // authentication sequence
    const accessDetails = await checkAccessDetails(msg.chat.id)
    if (accessDetails && accessDetails.username && msg.text) {
      // user has already submitted the username, expect password in message
      const token = await authenticateUser(
        accessDetails.username,
        msg.text,
        AUTH_URL
      )
      if (token) {
        await storeLoggedInUser(msg, token)
        await advanceChatFlow(bot, msg)
      } else {
        await clearAllDetails(msg)
        await advanceChatFlow(bot, msg, INVALID_LOGIN_DETAILS)
      }
    } else if (
      accessDetails &&
      !accessDetails.expired &&
      !accessDetails.username &&
      msg.text
    ) {
      // store username & request password
      await storeAccessDetails(msg.chat.id, msg.text)
      await advanceChatFlow(bot, msg, REQUEST_PASSWORD)
    } else if (accessDetails && accessDetails.expired) {
      await clearAllDetails(msg)
      await advanceChatFlow(bot, msg, EXPIRED_AUTHENTICATION_PROCESS)
    } else {
      // new user, request username
      await storeAccessDetails(msg.chat.id)
      await advanceChatFlow(bot, msg, LOGIN_PROMPT)
    }
  }
}
