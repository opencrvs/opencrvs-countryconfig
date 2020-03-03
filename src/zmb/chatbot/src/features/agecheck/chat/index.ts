export const LOGIN_PROMPT = 'LOGIN_PROMPT'
export const LOGIN_AGAIN_PROMPT = 'LOGIN_AGAIN_PROMPT'
export const REQUEST_PASSWORD = 'REQUEST_PASSWORD'
export const INVALID_LOGIN_DETAILS = 'INVALID_LOGIN_DETAILS'
export const EXPIRED_AUTHENTICATION_PROCESS = 'EXPIRED_AUTHENTICATION_PROCESS'
export const WELCOME_MESSAGE = 'WELCOME_MESSAGE'
export const UNKNOWN_MESSAGE = 'UNKNOWN_MESSAGE'

import { IChatStage } from '@ocrvs-chatbot/utils/chat'

export const chat: IChatStage[] = [
  {
    id: LOGIN_PROMPT,
    response:
      'I am an automated age verification service for Zambia.  To access this service,' +
      ' you first need to login. Please tell me your username.'
  },
  {
    id: LOGIN_AGAIN_PROMPT,
    response:
      "Hello! It's nice to see you back. It's been a while, and I am really careful with our citizen data," +
      ' so I need to ask you to login again.  Just to make sure that you, ... are you! ;-).  Please tell me your username.'
  },
  {
    id: REQUEST_PASSWORD,
    response: 'Thank you.  Now, please tell me your password.'
  },
  {
    id: INVALID_LOGIN_DETAILS,
    response:
      "I'm sorry. Something went wrong when I used those details, so unfortunately we have to start again."
  },
  {
    id: EXPIRED_AUTHENTICATION_PROCESS,
    response:
      "I'm sorry. You took a little too long. I have to complete the login process within 2 minutes, " +
      'so unfortunately we have to start again.'
  },
  {
    id: WELCOME_MESSAGE,
    response:
      "Welcome to the Zambian Age Verification service. You will need the individual's first name," +
      " last name, sex, district of birth and mother's first name."
  },
  {
    id: UNKNOWN_MESSAGE,
    response: "I'm sorry. I dont understand.  "
  }
]
