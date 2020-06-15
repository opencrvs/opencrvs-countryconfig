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
  ageCheckChat,
  WELCOME_MESSAGE,
  UNKNOWN_MESSAGE,
  REQUEST_PASSWORD,
  START_AGAIN,
  LOGOUT,
  LAST_NAME,
  GENDER,
  DISTRICT,
  MOTHER,
  RESULT,
  GOOD_RESULT_16,
  GOOD_RESULT_21,
  BAD_RESULT,
  BORN,
  SERVER_PROBLEM,
  AUTH_PROBLEM,
  NO_RESULTS,
  GOOD_RESULT_PREFIX
} from '@ocrvs-chatbot/features/agecheck/chat'
import {
  getStage,
  storeChatPosition,
  getChatPosition,
  IChatStage
} from '@ocrvs-chatbot/utils/chat'
import { search, storeSearchParams } from '@ocrvs-chatbot/utils/search'
import { AUTH_URL } from '@ocrvs-chatbot/constants'
import { invalidateUser } from '@ocrvs-chatbot/utils/auth'
import * as moment from 'moment'

export async function advanceChatFlow(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  messageId?: string
) {
  if (messageId) {
    await storeChatPosition(msg.chat.id, messageId)
    bot.sendMessage(msg.chat.id, getStage(ageCheckChat, messageId).response)
  } else {
    if (msg.text?.toString() === 'start') {
      // user wishes to start again
      const nextStage: IChatStage = await getNextStageMessage(
        START_AGAIN,
        msg.text?.toString()
      )
      await storeChatPosition(msg.chat.id, nextStage.id)
      bot.sendMessage(msg.chat.id, nextStage.response)
    } else if (
      msg.text?.toString() === 'exit' ||
      msg.text?.toString() === '/start'
    ) {
      // user wishes to logout
      await invalidateUser(msg, AUTH_URL)
      bot.sendMessage(msg.chat.id, getStage(ageCheckChat, LOGOUT).response)
    } else {
      // proceed with chat
      const chatPosition = await getChatPosition(msg.chat.id)
      const nextStage: IChatStage = await getNextStageMessage(
        chatPosition.messageId,
        msg.text?.toString(),
        msg.chat.id,
        msg
      )
      if (nextStage.id !== UNKNOWN_MESSAGE) {
        await storeChatPosition(msg.chat.id, nextStage.id)
      }
      bot.sendMessage(msg.chat.id, nextStage.response)
    }
  }
}

export async function getNextStageMessage(
  messageId: string,
  userInput?: string,
  chatId?: number,
  msg?: TelegramBot.Message
) {
  switch (messageId) {
    case REQUEST_PASSWORD:
      // user has successfully authenticated, start bot
      return getStage(ageCheckChat, WELCOME_MESSAGE)
    case START_AGAIN:
      return getStage(ageCheckChat, WELCOME_MESSAGE)
    case WELCOME_MESSAGE:
      await storeSearchParams(
        chatId as number,
        'child.firstName',
        userInput as string
      )
      return getStage(ageCheckChat, LAST_NAME)
    case LAST_NAME:
      await storeSearchParams(
        chatId as number,
        'child.lastName',
        userInput as string
      )
      await storeSearchParams(
        chatId as number,
        'mother.lastName',
        userInput as string
      )
      return getStage(ageCheckChat, GENDER)
    case GENDER:
      const gender = getSex(userInput as string)
      if (gender === 'error') {
        return getStage(ageCheckChat, UNKNOWN_MESSAGE)
      } else {
        await storeSearchParams(chatId as number, 'child.gender', gender)
        return getStage(ageCheckChat, DISTRICT)
      }
    case DISTRICT:
      await storeSearchParams(
        chatId as number,
        'eventLocation.name',
        userInput as string
      )
      return getStage(ageCheckChat, MOTHER)
    case MOTHER:
      await storeSearchParams(
        chatId as number,
        'mother.firstName',
        userInput as string
      )
      const result = await search(msg as TelegramBot.Message, chatId as number)
      if (result.statusCode === 401) {
        await invalidateUser(msg as TelegramBot.Message, AUTH_URL)
        return getStage(ageCheckChat, AUTH_PROBLEM)
      } else if (result.statusCode === 500) {
        await invalidateUser(msg as TelegramBot.Message, AUTH_URL)
        return getStage(ageCheckChat, SERVER_PROBLEM)
      } else if (result.results.length === 0) {
        return getStage(ageCheckChat, NO_RESULTS)
      } else if (result.results.length > 1) {
        const successMessage = formatResult(result.results[0]._source, true)
        const nextStage: IChatStage = {
          id: RESULT,
          response: successMessage
        }
        return nextStage
      } else {
        const successMessage = formatResult(result.results[0]._source)
        const nextStage: IChatStage = {
          id: RESULT,
          response: successMessage
        }
        return nextStage
      }
    default:
      return getStage(ageCheckChat, UNKNOWN_MESSAGE)
  }
}

function getSex(key: string): string {
  switch (key) {
    case '1':
      return 'female'
    case '2':
      return 'male'
    case '3':
      return 'unknown'
    default:
      return 'error'
  }
}

interface IBirthRecord {
  event: string
  createdAt: string
  operationHistories: any[]
  childFirstNames: string
  childFamilyName: string
  childDoB: string // '2018-02-15'
  gender: string
  eventLocationId: string
  motherFirstNames: string
  motherFamilyName: string
  motherIdentifier: string
  informantFirstNames: string
  informantFamilyName: string
  contactNumber: string
  type: string
  dateOfApplication: string
  trackingId: string
  applicationLocationId: string
  compositionType: string
  createdBy: string
  updatedBy: string
  modifiedAt: string
  registrationNumber: string
}

function formatResult(record: IBirthRecord, tooMany?: boolean): string {
  const now = moment(new Date())
  const duration = moment.duration(now.diff(record.childDoB))
  const years = duration.asYears()
  let legal = 0
  if (years > 16 && years < 21) {
    legal = 1
  } else if (years > 21) {
    legal = 2
  }
  let gender = 'He'

  if (record.gender === 'female') {
    gender = 'She'
  }
  let multipleResults = ''
  if (tooMany) {
    multipleResults =
      'I received multiple results.  I am a prototype and duplication is a possibility. Here is the first entry I could find:'
  }
  if (legal === 0) {
    return `${GOOD_RESULT_PREFIX}\n\n${multipleResults}${
      record.childFirstNames
    } ${record.childFamilyName}${BORN} ${moment(
      record.childDoB,
      'YYYY-MM-DD'
    ).format('MMM, D YYYY')}. ${BAD_RESULT}`
  } else if (legal === 1) {
    return `${GOOD_RESULT_PREFIX}\n\n${multipleResults}${
      record.childFirstNames
    } ${record.childFamilyName}${BORN} ${moment(
      record.childDoB,
      'YYYY-MM-DD'
    ).format('MMM, D YYYY')}.\n\n${gender} ${GOOD_RESULT_16}`
  } else {
    return `${GOOD_RESULT_PREFIX}\n\n${multipleResults}${
      record.childFirstNames
    } ${record.childFamilyName}${BORN} ${moment(
      record.childDoB,
      'YYYY-MM-DD'
    ).format('MMM, D YYYY')}.\n\n${gender} ${GOOD_RESULT_21}`
  }
}
