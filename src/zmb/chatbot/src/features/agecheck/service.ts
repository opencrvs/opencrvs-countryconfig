import * as TelegramBot from 'node-telegram-bot-api'
import {
  ageCheckChat,
  WELCOME_MESSAGE,
  UNKNOWN_MESSAGE,
  LOGOUT
} from '@ocrvs-chatbot/features/agecheck/chat'
import {
  getStage,
  storeChatPosition,
  getChatPosition,
  IChatStage
} from '@ocrvs-chatbot/utils/chat'
import { AUTH_URL } from '@ocrvs-chatbot/constants'
import { invalidateUser } from '@ocrvs-chatbot/utils/auth'

export async function advanceChatFlow(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  id?: string
) {
  if (id) {
    await storeChatPosition(msg.chat.id, id)
    bot.sendMessage(msg.chat.id, getStage(ageCheckChat, id).response)
  } else {
    if (msg.text?.toString() === '1') {
      // user wishes to start again
      const nextStage: IChatStage = getNextStageMessage(
        'START_AGAIN',
        msg.text?.toString()
      )
      await storeChatPosition(msg.chat.id, nextStage.id)
      bot.sendMessage(msg.chat.id, nextStage.response)
    } else if (msg.text?.toString() === '2') {
      // user wishes to logout
      await invalidateUser(msg, AUTH_URL)
      bot.sendMessage(msg.chat.id, getStage(ageCheckChat, LOGOUT).response)
    } else {
      // proceed with chat
      const chatPosition = await getChatPosition(msg.chat.id)
      const nextStage: IChatStage = getNextStageMessage(
        chatPosition.messageId,
        msg.text?.toString()
      )
      if (nextStage.id !== UNKNOWN_MESSAGE) {
        await storeChatPosition(msg.chat.id, nextStage.id)
      }
      bot.sendMessage(msg.chat.id, nextStage.response)
    }
  }
}

function getNextStageMessage(messageId: string, userInput?: string) {
  switch (messageId) {
    case 'REQUEST_PASSWORD':
      // user has successfully authenticated, start bot
      return getStage(ageCheckChat, WELCOME_MESSAGE)
    case 'START_AGAIN':
      // user has successfully authenticated, start bot
      return getStage(ageCheckChat, WELCOME_MESSAGE)
    default:
      return getStage(ageCheckChat, UNKNOWN_MESSAGE)
  }
}
