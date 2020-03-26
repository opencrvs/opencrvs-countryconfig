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
import * as fetchMock from 'jest-fetch-mock'
jest.mock('node-telegram-bot-api')
import * as TelegramBot from 'node-telegram-bot-api'
import * as chatService from '@ocrvs-chatbot/utils/chat'
import * as authService from '@ocrvs-chatbot/utils/auth'
import * as searchService from '@ocrvs-chatbot/utils/search'
import {
  mockUsernameMessage,
  mockPasswordMessage,
  mockStartMessage,
  mockExitMessage,
  mockRequestPasswordChatPosition,
  mockSuccessfulSearchResults,
  mockMothersNameMessage
} from '@ocrvs-chatbot/test/utils'
import {
  LOGIN_PROMPT,
  WELCOME_MESSAGE,
  LAST_NAME,
  GENDER,
  DISTRICT,
  MOTHER,
  UNKNOWN_MESSAGE,
  RESULT
} from '@ocrvs-chatbot/features/agecheck/chat'
import {
  advanceChatFlow,
  getNextStageMessage
} from '@ocrvs-chatbot/features/agecheck/service'
import { Database } from '@ocrvs-chatbot/database'

describe('Chatbot service handler', () => {
  let bot: TelegramBot
  let fetch: fetchMock.FetchMock
  beforeEach(async () => {
    fetch = fetchMock as fetchMock.FetchMock
    bot = new TelegramBot('test-key', { polling: true })
  })
  it('advanceChatFlow should send a specific message if messageId passed', async () => {
    const chatPositionSpy = jest.spyOn(chatService, 'storeChatPosition')
    await advanceChatFlow(bot, mockPasswordMessage, LOGIN_PROMPT)
    expect(chatPositionSpy).toHaveBeenCalledWith(1106601995, LOGIN_PROMPT)
    expect(bot.sendMessage).toHaveBeenCalledWith(
      1106601995,
      'Hello. I am an automated age verification service for Zambia. 🤖 To access this service,' +
        ' you first need to login. Please tell me your username.'
    )
  })
  it('advanceChatFlow should select the next appropriate message', async () => {
    jest
      .spyOn(chatService, 'getChatPosition')
      .mockReturnValue(Promise.resolve(mockRequestPasswordChatPosition))
    const chatPositionSpy = jest.spyOn(chatService, 'storeChatPosition')
    await advanceChatFlow(bot, mockUsernameMessage)
    expect(chatPositionSpy).toHaveBeenCalledWith(1106601995, WELCOME_MESSAGE)
    expect(bot.sendMessage).toHaveBeenCalledWith(
      1106601995,
      "Welcome to the Zambian Age Verification service. 😃 You will need the individual's first name, last name, sex and mother's first name." +
        ' That should be enough, but we might need some more information, such as district of birth.' +
        ' First, enter their first name.'
    )
  })
  it('advanceChatFlow should return the chat to the beginning when the word start is sent', async () => {
    const chatPositionSpy = jest.spyOn(chatService, 'storeChatPosition')
    await advanceChatFlow(bot, mockStartMessage)
    expect(chatPositionSpy).toHaveBeenCalledWith(1106601995, WELCOME_MESSAGE)
    expect(bot.sendMessage).toHaveBeenCalledWith(
      1106601995,
      "Welcome to the Zambian Age Verification service. 😃 You will need the individual's first name, last name, sex and mother's first name." +
        ' That should be enough, but we might need some more information, such as district of birth.' +
        ' First, enter their first name.'
    )
  })
  it('advanceChatFlow should logout the user when the word exit is sent', async () => {
    const logOutSpy = jest.spyOn(authService, 'invalidateUser')
    const databaseSpy = jest
      .spyOn(Database, 'get')
      .mockReturnValue(Promise.resolve(JSON.stringify({ token: 'xyz' })))
    jest
      .spyOn(authService, 'clearAllDetails')
      .mockReturnValue(Promise.resolve(true))
    fetch.mockResponses([JSON.stringify({}), { status: 200 }])
    await advanceChatFlow(bot, mockExitMessage)
    expect(logOutSpy).toHaveBeenCalled()
    expect(bot.sendMessage).toHaveBeenCalledWith(
      1106601995,
      'Logging you out.  Good bye! 👋'
    )
    databaseSpy.mockClear()
  })
  it('getNextStageMessage should store the childs first name and request the last name', async () => {
    const searchParamsSpy = jest.spyOn(searchService, 'storeSearchParams')
    const response = await getNextStageMessage(
      WELCOME_MESSAGE,
      'euan',
      1106601995
    )
    expect(searchParamsSpy).toHaveBeenCalledWith(
      1106601995,
      'child.firstName',
      'euan'
    )
    expect(response).toEqual({
      id: LAST_NAME,
      response: 'Thank you.  Now, enter their last name.'
    })
    searchParamsSpy.mockClear()
  })
  it('getNextStageMessage should store the childs and mothers last name and request the gender', async () => {
    const searchParamsSpy = jest.spyOn(searchService, 'storeSearchParams')
    const response = await getNextStageMessage(LAST_NAME, 'millar', 1106601995)
    expect(searchParamsSpy).toHaveBeenCalledTimes(2)
    expect(searchParamsSpy).toHaveBeenNthCalledWith(
      1,
      1106601995,
      'child.lastName',
      'millar'
    )
    expect(searchParamsSpy).toHaveBeenNthCalledWith(
      2,
      1106601995,
      'mother.lastName',
      'millar'
    )
    expect(response).toEqual({
      id: GENDER,
      response: 'Sex? Text 1 for female, 2 for male and 3 for third sex.'
    })
    searchParamsSpy.mockClear()
  })
  it('getNextStageMessage should store the male gender request the district', async () => {
    const searchParamsSpy = jest.spyOn(searchService, 'storeSearchParams')
    const response = await getNextStageMessage(GENDER, '2', 1106601995)
    expect(searchParamsSpy).toHaveBeenCalledWith(
      1106601995,
      'child.gender',
      'male'
    )
    expect(response).toEqual({
      id: DISTRICT,
      response: 'What district where they born in?'
    })
    searchParamsSpy.mockClear()
  })

  it('getNextStageMessage should return an unknown response for an unknown gender', async () => {
    const searchParamsSpy = jest.spyOn(searchService, 'storeSearchParams')
    const response = await getNextStageMessage(GENDER, 'unknown', 1106601995)
    expect(searchParamsSpy).not.toHaveBeenCalled()
    expect(response).toEqual({
      id: UNKNOWN_MESSAGE,
      response:
        'I\'m sorry. 😞 I dont understand. At any time, you can send "start" to start the service again, or "exit" to log out.'
    })
    searchParamsSpy.mockClear()
  })

  it('getNextStageMessage should store the district and request the mothers first name', async () => {
    const searchParamsSpy = jest.spyOn(searchService, 'storeSearchParams')
    const response = await getNextStageMessage(DISTRICT, 'Chembe', 1106601995)
    expect(searchParamsSpy).toHaveBeenCalledWith(
      1106601995,
      'eventLocation.name',
      'Chembe'
    )
    expect(response).toEqual({
      id: MOTHER,
      response: "Mother's first name"
    })
    searchParamsSpy.mockClear()
  })
  it('getNextStageMessage should store the mothers first name, request and format successful search results', async () => {
    const searchParamsSpy = jest.spyOn(searchService, 'storeSearchParams')

    jest
      .spyOn(authService, 'getLoggedInUser')
      .mockReturnValue(Promise.resolve({ token: 'xyz' }))

    jest
      .spyOn(Database, 'get')
      .mockReturnValueOnce(Promise.resolve(JSON.stringify({ token: 'xyz' })))
    jest.spyOn(Database, 'get').mockReturnValueOnce(
      Promise.resolve(
        JSON.stringify({
          child: {
            firstName: 'euan',
            lastName: 'millar',
            gender: 'male'
          },
          mother: {
            firstName: 'habiba',
            lastName: 'millar'
          },
          eventLocation: {
            name: 'Chembe'
          }
        })
      )
    )
    fetch.mockResponses([mockSuccessfulSearchResults, { status: 200 }])

    const response = await getNextStageMessage(
      MOTHER,
      'Habiba',
      1106601995,
      mockMothersNameMessage
    )
    expect(searchParamsSpy).toHaveBeenCalledWith(
      1106601995,
      'mother.firstName',
      'Habiba'
    )
    expect(response).toEqual({
      id: RESULT,
      response:
        ' Euan Millar, born  Oct 22 1994. He is old enough to be married.  Send "start" to start the service again, or "exit" to log out.'
    })
    searchParamsSpy.mockClear()
  })
})
