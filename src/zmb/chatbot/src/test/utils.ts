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
import * as TelegramBot from 'node-telegram-bot-api'
import { REQUEST_PASSWORD } from '@ocrvs-chatbot/features/agecheck/chat'

export const mockStartMessage: TelegramBot.Message = {
  message_id: 495,
  from: {
    id: 1106601995,
    is_bot: false,
    first_name: 'Evans',
    last_name: 'Kangwa',
    language_code: 'en'
  },
  chat: {
    id: 1106601995,
    first_name: 'Evans',
    last_name: 'Kangwa',
    type: 'private'
  },
  date: 1584631619,
  text: 'start'
}
export const mockExitMessage: TelegramBot.Message = {
  message_id: 495,
  from: {
    id: 1106601995,
    is_bot: false,
    first_name: 'Evans',
    last_name: 'Kangwa',
    language_code: 'en'
  },
  chat: {
    id: 1106601995,
    first_name: 'Evans',
    last_name: 'Kangwa',
    type: 'private'
  },
  date: 1584631619,
  text: 'exit'
}
export const mockUsernameMessage: TelegramBot.Message = {
  message_id: 495,
  from: {
    id: 1106601995,
    is_bot: false,
    first_name: 'Evans',
    last_name: 'Kangwa',
    language_code: 'en'
  },
  chat: {
    id: 1106601995,
    first_name: 'Evans',
    last_name: 'Kangwa',
    type: 'private'
  },
  date: 1584631619,
  text: 'myUsername'
}

export const mockPasswordMessage: TelegramBot.Message = {
  message_id: 495,
  from: {
    id: 1106601995,
    is_bot: false,
    first_name: 'Evans',
    last_name: 'Kangwa',
    language_code: 'en'
  },
  chat: {
    id: 1106601995,
    first_name: 'Evans',
    last_name: 'Kangwa',
    type: 'private'
  },
  date: 1584631619,
  text: 'myPassword'
}

export const mockMothersNameMessage: TelegramBot.Message = {
  message_id: 495,
  from: {
    id: 1106601995,
    is_bot: false,
    first_name: 'Evans',
    last_name: 'Kangwa',
    language_code: 'en'
  },
  chat: {
    id: 1106601995,
    first_name: 'Evans',
    last_name: 'Kangwa',
    type: 'private'
  },
  date: 1584631619,
  text: 'Agnes'
}
export const mockValidTokenResponse = {
  isValid: true,
  token: 'xyz'
}
export const mockInvalidTokenResponse = {
  isValid: false,
  token: ''
}
export const mockValidAccessDetails = {
  username: '1106601995',
  createdAt: Date.now(),
  expired: false
}

export const mockExpiredAccessDetails = {
  username: '1106601995',
  createdAt: 1551428314,
  expired: true
}

export const mockPartialAccessDetails = {
  username: undefined,
  createdAt: Date.now(),
  expired: false
}
export const mockRequestPasswordChatPosition = {
  createdAt: Date.now(),
  messageId: REQUEST_PASSWORD
}
export const mockSuccessfulSearchResults = JSON.stringify({
  results: [
    {
      _index: 'ocrvs',
      _type: 'compositions',
      _id: '20606a5a-01d1-4561-a220-178ff052beea',
      _score: null,
      _source: {
        event: 'Birth',
        createdAt: '1584983784425',
        operationHistories: [
          {
            operatedOn: '2020-03-23T17:16:24.282Z',
            operatorFirstNames: 'Kalusha',
            operatorFamilyNameLocale: '',
            operatorFamilyName: 'Bwalya',
            operatorFirstNamesLocale: '',
            operatorOfficeName: 'Lusaka DNRPC District Office',
            operatorOfficeAlias: ['Lusaka DNRPC District Office'],
            operationType: 'REGISTERED',
            operatorRole: 'FIELD_AGENT'
          },
          {
            operatedOn: '2020-03-23T17:16:42.650Z',
            operatorFirstNames: 'Kennedy',
            operatorFamilyNameLocale: '',
            operatorFamilyName: 'Mweene',
            operatorFirstNamesLocale: '',
            operatorOfficeName: 'Lusaka DNRPC District Office',
            operatorOfficeAlias: ['Lusaka DNRPC District Office'],
            operationType: 'REGISTERED',
            operatorRole: 'LOCAL_REGISTRAR'
          }
        ],
        childFirstNames: 'Evans',
        childFamilyName: 'Kangwa',
        childDoB: '1994-10-22',
        gender: 'male',
        eventLocationId: '394e6ec9-5db7-4ce7-aa5e-6686f7a74081',
        motherFirstNames: 'Agnes',
        motherFamilyName: 'Kangwa',
        motherDoB: '1971-10-23',
        motherIdentifier: '123456789',
        fatherFirstNames: 'Agnes',
        fatherFamilyName: 'Aktar',
        fatherDoB: '1971-10-23',
        fatherIdentifier: '123456789',
        informantFirstNames: 'Agnes',
        informantFamilyName: 'Kangwa',
        contactNumber: '+260703168939',
        type: 'REGISTERED',
        dateOfApplication: '2020-03-23T17:16:24.282Z',
        trackingId: 'BDDFEVM',
        applicationLocationId: '67e1c701-3087-4905-8fd3-b54096c9ffd1',
        compositionType: 'birth-application',
        createdBy: 'e388ce7b-72bb-4d70-885c-895ed08789da',
        updatedBy: 'c9224259-f13b-4a33-b3c6-9570579e1a3d',
        modifiedAt: '1584983802803'
      },
      sort: [1584983784282]
    }
  ]
})

export const mockFailedSearchResults = JSON.stringify({ results: [] })
