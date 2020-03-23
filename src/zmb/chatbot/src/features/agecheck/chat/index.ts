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
import { IChatStage } from '@ocrvs-chatbot/utils/chat'

export const LOGIN_PROMPT = 'LOGIN_PROMPT'
export const LOGIN_AGAIN_PROMPT = 'LOGIN_AGAIN_PROMPT'
export const REQUEST_PASSWORD = 'REQUEST_PASSWORD'
export const INVALID_LOGIN_DETAILS = 'INVALID_LOGIN_DETAILS'
export const EXPIRED_AUTHENTICATION_PROCESS = 'EXPIRED_AUTHENTICATION_PROCESS'
export const WELCOME_MESSAGE = 'WELCOME_MESSAGE'
export const UNKNOWN_MESSAGE = 'UNKNOWN_MESSAGE'
export const LOGOUT = 'LOGOUT'
export const START_AGAIN = 'START_AGAIN'
export const LAST_NAME = 'LAST_NAME'
export const GENDER = 'GENDER'
export const DISTRICT = 'DISTRICT'
export const MOTHER = 'MOTHER'
export const RESULT = 'RESULT'
export const GOOD_RESULT_16 =
  'is old enough to be married with parental consent.  Send "start" to start the service again, or "exit" to log out.'
export const GOOD_RESULT_21 =
  'is old enough to be married.  Send "start" to start the service again, or "exit" to log out.'
export const BAD_RESULT =
  'is not old enough to be married.  Send "start" to start the service again, or "exit" to log out.'
export const NO_RESULTS = 'NO_RESULTS'
export const BORN = ', born '
export const SERVER_PROBLEM = 'SERVER_PROBLEM'
export const AUTH_PROBLEM = 'AUTH_PROBLEM'

export const ageCheckChat: IChatStage[] = [
  {
    id: LOGIN_PROMPT,
    response:
      'Hello. I am an automated age verification service for Zambia. 🤖 To access this service,' +
      ' you first need to login. Please tell me your username.'
  },
  {
    id: LOGIN_AGAIN_PROMPT,
    response:
      "Hello! It's nice to see you back. 🤖 It's been a while, and I am really careful with our citizen data," +
      ' so I need to ask you to login again.  Just to make sure that you, ... are you! ;-).  Please tell me your username.'
  },
  {
    id: REQUEST_PASSWORD,
    response: 'Thank you.  Now, please tell me your password.'
  },
  {
    id: INVALID_LOGIN_DETAILS,
    response:
      "I'm sorry. 😞 Something went wrong when I used those details, so unfortunately we have to start again."
  },
  {
    id: EXPIRED_AUTHENTICATION_PROCESS,
    response:
      "I'm sorry. 😞 You took a little too long. I have to complete the login process within 2 minutes, " +
      'so unfortunately we have to start again.'
  },
  {
    id: WELCOME_MESSAGE,
    response:
      "Welcome to the Zambian Age Verification service. 😃 You will need the individual's first name, last name, sex and mother's first name." +
      ' That should be enough, but we might need some more information, such as district of birth.' +
      ' First, enter their first name.'
  },
  {
    id: UNKNOWN_MESSAGE,
    response:
      'I\'m sorry. 😞 I dont understand. At any time, you can send "start" to start the service again, or "exit" to log out.'
  },
  {
    id: LOGOUT,
    response: 'Logging you out.  Good bye! 👋'
  },
  {
    id: LAST_NAME,
    response: 'Thank you.  Now, enter their last name.'
  },
  {
    id: GENDER,
    response: 'Sex? Text 1 for female, 2 for male and 3 for third sex.'
  },
  {
    id: DISTRICT,
    response: 'What district where they born in?'
  },
  {
    id: MOTHER,
    response: "Mother's first name"
  },
  {
    id: NO_RESULTS,
    response: 'We could not find a match. Send "start" to try again.'
  },
  {
    id: AUTH_PROBLEM,
    response:
      "I'm sorry, 😞 but I need you to login and start again. Click enter to continue."
  },
  {
    id: SERVER_PROBLEM,
    response:
      "I'm very sorry, 😞 but I dont feel very well. " +
      'I think I need maintenance. Please try again another day.'
  }
]
