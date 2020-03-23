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
import { chatbotHandler } from '@ocrvs-chatbot/features/agecheck/handler'
jest.mock('node-telegram-bot-api')
import { Database } from '@ocrvs-chatbot/database'
import * as TelegramBot from 'node-telegram-bot-api'
import * as ageCheckService from '@ocrvs-chatbot/features/agecheck/service'
import * as authService from '@ocrvs-chatbot/utils/auth'
import {
  mockStartMessage,
  mockUsernameMessage,
  mockValidTokenResponse,
  mockInvalidTokenResponse,
  mockValidAccessDetails,
  mockExpiredAccessDetails,
  mockPartialAccessDetails,
  mockPasswordMessage
} from '@ocrvs-chatbot/test/utils'
import {
  LOGIN_PROMPT,
  REQUEST_PASSWORD,
  INVALID_LOGIN_DETAILS
} from '@ocrvs-chatbot/features/agecheck/chat'

describe('Chatbot handler', () => {
  let bot: TelegramBot
  beforeEach(async () => {
    bot = new TelegramBot('test-key', { polling: true })
  })
  it('Logged in user with valid token sending start should advance the chat', async () => {
    const databaseSpy = jest
      .spyOn(Database, 'get')
      .mockReturnValue(Promise.resolve(JSON.stringify({ token: 'xyz' })))
    jest
      .spyOn(authService, 'verifyToken')
      .mockReturnValue(Promise.resolve(true))
    const validateFuncSpy = jest
      .spyOn(authService, 'validateFunc')
      .mockReturnValue(Promise.resolve(mockValidTokenResponse))
    const logOutServiceSpy = jest.spyOn(authService, 'clearAllDetails')
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    await chatbotHandler(bot, mockStartMessage)
    expect(validateFuncSpy).toHaveBeenCalled()
    expect(logOutServiceSpy).not.toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalled()
    databaseSpy.mockClear()
  })
  it('Logged in user with invalid token sending start should be logged out', async () => {
    const databaseSpy = jest
      .spyOn(Database, 'get')
      .mockReturnValue(Promise.resolve(JSON.stringify({ token: 'xyz' })))
    jest
      .spyOn(authService, 'verifyToken')
      .mockReturnValue(Promise.resolve(false))
    const validateFuncSpy = jest
      .spyOn(authService, 'validateFunc')
      .mockReturnValue(Promise.resolve(mockInvalidTokenResponse))
    const logOutServiceSpy = jest.spyOn(authService, 'clearAllDetails')
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    await chatbotHandler(bot, mockStartMessage)
    expect(validateFuncSpy).toHaveBeenCalled()
    expect(logOutServiceSpy).toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalled()
    databaseSpy.mockClear()
  })
  it('Expect logged out user, who has previously accessed and now has an expired token to be logged out', async () => {
    const databaseSpy = jest
      .spyOn(Database, 'get')
      .mockReturnValue(Promise.resolve(false))
    jest
      .spyOn(authService, 'getAccessDetails')
      .mockReturnValue(Promise.resolve(mockExpiredAccessDetails))
    const logOutServiceSpy = jest.spyOn(authService, 'clearAllDetails')
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    await chatbotHandler(bot, mockStartMessage)
    expect(logOutServiceSpy).toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalled()
    databaseSpy.mockClear()
  })
  it('New user should be asked for username', async () => {
    const databaseSpy = jest
      .spyOn(Database, 'get')
      .mockReturnValue(Promise.resolve(false))
    jest
      .spyOn(authService, 'checkAccessDetails')
      .mockReturnValue(Promise.resolve(false))
    const storeDetailsServiceSpy = jest.spyOn(authService, 'storeAccessDetails')
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    await chatbotHandler(bot, mockStartMessage)
    expect(storeDetailsServiceSpy).toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalledWith(
      bot,
      mockStartMessage,
      LOGIN_PROMPT
    )
    databaseSpy.mockClear()
  })
  it('New user, who has submitted a username, should be asked for a password', async () => {
    jest
      .spyOn(authService, 'getLoggedInUser')
      .mockReturnValue(Promise.resolve(false))
    jest
      .spyOn(authService, 'checkAccessDetails')
      .mockReturnValue(Promise.resolve(mockPartialAccessDetails))
    const storeDetailsServiceSpy = jest.spyOn(authService, 'storeAccessDetails')
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    await chatbotHandler(bot, mockUsernameMessage)
    expect(storeDetailsServiceSpy).toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalledWith(
      bot,
      mockUsernameMessage,
      REQUEST_PASSWORD
    )
  })
  it('New user, who has submitted a valid username and password, should be allowed to continue', async () => {
    jest
      .spyOn(authService, 'getLoggedInUser')
      .mockReturnValue(Promise.resolve(false))
    jest
      .spyOn(authService, 'checkAccessDetails')
      .mockReturnValue(Promise.resolve(mockValidAccessDetails))
    jest
      .spyOn(authService, 'authenticateUser')
      .mockReturnValue(Promise.resolve('valid_token'))
    const storeDetailsServiceSpy = jest.spyOn(authService, 'storeAccessDetails')
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    await chatbotHandler(bot, mockPasswordMessage)
    expect(storeDetailsServiceSpy).toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalledWith(bot, mockPasswordMessage)
  })

  it('New user, who has submitted an invalid username and password, should be informed and logged out', async () => {
    jest
      .spyOn(authService, 'getLoggedInUser')
      .mockReturnValue(Promise.resolve(false))
    jest
      .spyOn(authService, 'checkAccessDetails')
      .mockReturnValue(Promise.resolve(mockValidAccessDetails))
    jest
      .spyOn(authService, 'authenticateUser')
      .mockReturnValue(Promise.resolve(false))
    const chatServiceSpy = jest.spyOn(ageCheckService, 'advanceChatFlow')
    const logOutServiceSpy = jest.spyOn(authService, 'clearAllDetails')
    await chatbotHandler(bot, mockPasswordMessage)
    expect(logOutServiceSpy).toHaveBeenCalled()
    expect(chatServiceSpy).toHaveBeenCalledWith(
      bot,
      mockPasswordMessage,
      INVALID_LOGIN_DETAILS
    )
  })
})
