import * as TelegramBot from 'node-telegram-bot-api'
import {
  chat,
  WELCOME_MESSAGE,
  UNKNOWN_MESSAGE
} from '@ocrvs-chatbot/features/agecheck/chat'
import {
  getStage,
  storeChatPosition,
  getChatPosition,
  IChatPosition,
  IChatStage
} from '@ocrvs-chatbot/utils/chat'

export async function advanceChatFlow(
  bot: TelegramBot,
  msg: TelegramBot.Message,
  id?: string
) {
  if (id) {
    await storeChatPosition(msg.chat.id, id)
    bot.sendMessage(msg.chat.id, getStage(chat, id).response)
  } else {
    const chatPosition = await getChatPosition(msg.chat.id)
    bot.sendMessage(msg.chat.id, await getMessage(msg, chatPosition))
  }
}

async function getMessage(
  msg: TelegramBot.Message,
  chatPosition: IChatPosition
) {
  const nextStage: IChatStage = getNextStageMessage(
    chatPosition.messageId,
    msg.text?.toString()
  )
  if (nextStage.id !== UNKNOWN_MESSAGE) {
    await storeChatPosition(msg.chat.id, nextStage.id)
  }
  return nextStage.response
}

function getNextStageMessage(messageId: string, userInput?: string) {
  switch (messageId) {
    case 'REQUEST_PASSWORD':
      // user has successfully authenticated, start bot
      return getStage(chat, WELCOME_MESSAGE)
    default:
      return getStage(chat, UNKNOWN_MESSAGE)
  }
}
