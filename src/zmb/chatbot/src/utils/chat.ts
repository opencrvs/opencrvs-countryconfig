import { Database } from '@ocrvs-chatbot/database'

export interface IChatStage {
  id: string
  response: string
}

export interface IChatPosition {
  createdAt: number
  messageId: string
}

export function getStage(chat: IChatStage[], messageId: string): IChatStage {
  return chat.filter(obj => {
    return obj.id === messageId
  })[0]
}

export async function storeChatPosition(userId: number, messageId: string) {
  const chatPosition: IChatPosition = {
    createdAt: Date.now(),
    messageId
  }

  await Database.set(`chat_position_${userId}`, JSON.stringify(chatPosition))
}

export async function getChatPosition(userId: number): Promise<IChatPosition> {
  const chatPosition = await Database.get(`chat_position_${userId}`)
  return JSON.parse(chatPosition) as IChatPosition
}
