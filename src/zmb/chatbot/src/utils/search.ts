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
import fetch from 'node-fetch'
import { set } from 'lodash'
import { Database } from '@ocrvs-chatbot/database'
import * as TelegramBot from 'node-telegram-bot-api'
import { getLoggedInUser } from '@ocrvs-chatbot/utils/auth'
import { MEDIATOR_URL } from '@ocrvs-chatbot/constants'

export interface ISearchParams {
  child?: {
    firstName?: string
    lastName?: string
    gender?: 'male' | 'female' | 'unknown'
  }
  mother?: {
    firstName?: string
    lastName?: string
  }
  eventLocation?: {
    name: string
  }
}

export async function getSearchParams(chatId: number): Promise<ISearchParams> {
  const searchParams = await Database.get(`search_params_${chatId}`)
  return JSON.parse(searchParams) as ISearchParams
}

export async function storeSearchParams(
  chatId: number,
  path: string,
  value: string
) {
  let searchParams = await getSearchParams(chatId)
  if (!searchParams) {
    searchParams = {}
  }
  set(searchParams, path, value)

  await Database.set(`search_params_${chatId}`, JSON.stringify(searchParams))
}

export async function search(
  msg: TelegramBot.Message,
  chatId: number
): Promise<any> {
  const chatbotUser = await getLoggedInUser(msg)
  const searchParams = await getSearchParams(chatId)
  if (!chatbotUser || !chatbotUser.token) {
    throw new Error('Chatbot user could not be found')
  } else {
    return fetch(`${MEDIATOR_URL}search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${chatbotUser.token}`
      },
      body: JSON.stringify(searchParams)
    })
      .then(response => {
        return response.json()
      })
      .catch(error => {
        return Promise.reject(
          new Error(`Search request failed: ${error.message}`)
        )
      })
  }
}
