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
  GOOD_RESULT
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
      const nextStage: IChatStage = getNextStageMessage(
        START_AGAIN,
        msg.text?.toString()
      )
      await storeChatPosition(msg.chat.id, nextStage.id)
      bot.sendMessage(msg.chat.id, nextStage.response)
    } else if (msg.text?.toString() === 'exit') {
      // user wishes to logout
      await invalidateUser(msg, AUTH_URL)
      bot.sendMessage(msg.chat.id, getStage(ageCheckChat, LOGOUT).response)
    } else {
      // proceed with chat
      const chatPosition = await getChatPosition(msg.chat.id)
      const nextStage: IChatStage = getNextStageMessage(
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

function getNextStageMessage(
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
      storeSearchParams(
        chatId as number,
        'child.firstName',
        userInput as string
      )
      return getStage(ageCheckChat, LAST_NAME)
    case LAST_NAME:
      storeSearchParams(chatId as number, 'child.lastName', userInput as string)
      storeSearchParams(
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
        storeSearchParams(chatId as number, 'child.gender', gender)
        return getStage(ageCheckChat, DISTRICT)
      }
    case DISTRICT:
      storeSearchParams(
        chatId as number,
        'eventLocation.name',
        userInput as string
      )
      return getStage(ageCheckChat, MOTHER)
    case MOTHER:
      storeSearchParams(
        chatId as number,
        'mother.firstName',
        userInput as string
      )
      const result = search(msg as TelegramBot.Message, chatId as number)
      console.log(JSON.stringify(result))
      return getStage(ageCheckChat, GOOD_RESULT)
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
