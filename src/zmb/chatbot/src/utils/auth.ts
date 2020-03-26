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
import { Database } from '@ocrvs-chatbot/database'
import * as TelegramBot from 'node-telegram-bot-api'
import fetch from 'node-fetch'

interface ITokenValidity {
  isValid: boolean
  token: string
}

export const verifyToken = async (token: string, authUrl: string) => {
  const res = await fetch(`${authUrl}/verifyToken`, {
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const body = await res.json()

  if (body.valid === true) {
    return true
  }

  return false
}

export const validateFunc = async (
  payload: string,
  checkInvalidToken: boolean,
  authUrl: string
): Promise<ITokenValidity> => {
  let valid
  if (checkInvalidToken) {
    valid = await verifyToken(payload, authUrl)
  }

  if (valid === true || !checkInvalidToken) {
    return {
      isValid: true,
      token: payload
    }
  }
  return {
    isValid: false,
    token: ''
  }
}

export const authenticateUser = async (
  username: string,
  password: string,
  authUrl: string
): Promise<string | false> => {
  const res = await fetch(`${authUrl}/authenticate`, {
    method: 'POST',
    body: JSON.stringify({ username, password })
  })

  const body = await res.json()

  if (body.status === 'active' && body.token) {
    return body.token
  }
  return false
}

export const invalidateUser = async (
  msg: TelegramBot.Message,
  authUrl: string
): Promise<string | false> => {
  try {
    const chatbotUser = await getLoggedInUser(msg)
    if (chatbotUser && chatbotUser.token) {
      await fetch(`${authUrl}/invalidateToken`, {
        method: 'POST',
        body: JSON.stringify({ token: chatbotUser.token })
      })
      await clearAllDetails(msg)
    } else {
      throw new Error('Chatbot user could not be found')
    }
  } catch (err) {
    throw new Error('Could not invalidate token on logout')
  }
  return false
}

export interface IChatbotUser {
  token: string
}

interface IAccessDetails {
  username?: string
  createdAt: number
  expired?: boolean
}

export async function getLoggedInUser(
  msg: TelegramBot.Message
): Promise<IChatbotUser | false> {
  if (msg.from && msg.from.id) {
    const record = await Database.get(`chatbot_user_${msg.from.id}`)
    if (record === null) {
      return false
    }
    return JSON.parse(record)
  } else {
    throw new Error('Telegram msg has no user id')
  }
}

export async function storeLoggedInUser(
  msg: TelegramBot.Message,
  token: string
): Promise<boolean> {
  if (msg.from && msg.from.id) {
    const chatUser: IChatbotUser = {
      token
    }
    await Database.set(`chatbot_user_${msg.from.id}`, JSON.stringify(chatUser))
    return true
  } else {
    throw new Error('Telegram msg has no user id')
  }
}

export async function storeAccessDetails(id: number, username?: string) {
  const accessDetails: IAccessDetails = {
    createdAt: Date.now(),
    username
  }

  await Database.set(`verification_${id}`, JSON.stringify(accessDetails))
}

export async function getAccessDetails(id: number): Promise<IAccessDetails> {
  const accessDetails = await Database.get(`verification_${id}`)
  return JSON.parse(accessDetails) as IAccessDetails
}

export async function checkAccessDetails(
  id: number
): Promise<IAccessDetails | false> {
  const accessDetails: IAccessDetails = await getAccessDetails(id)

  if (!accessDetails) {
    return false
  }

  const expired = (Date.now() - accessDetails.createdAt) / 1000 >= 1200

  if (expired) {
    accessDetails.expired = true
  }

  return accessDetails
}

export async function clearAllDetails(msg: TelegramBot.Message) {
  if (msg.from && msg.from.id) {
    if (await Database.get(`verification_${msg.from.id}`)) {
      await Database.del(`verification_${msg.from.id}`)
    }
    if (await Database.get(`chatbot_user_${msg.from.id}`)) {
      await Database.del(`chatbot_user_${msg.from.id}`)
    }
    if (await Database.get(`chat_position_${msg.chat.id}`)) {
      await Database.del(`chat_position_${msg.chat.id}`)
    }
    if (await Database.get(`search_params_${msg.chat.id}`)) {
      await Database.del(`search_params_${msg.chat.id}`)
    }
    return true
  } else {
    throw new Error('Telegram msg has no user id')
  }
}
