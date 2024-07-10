/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import {
  INFOBIP_API_KEY,
  INFOBIP_GATEWAY_ENDPOINT,
  INFOBIP_SENDER_ID
} from './constant'
import { logger } from '@countryconfig/logger'
import fetch from 'node-fetch'
import * as Handlebars from 'handlebars'
import { internal } from '@hapi/boom'
import { getLanguages } from '../content/service'

export const informantTemplates = {
  birthInProgressNotification: 'birthInProgressNotification',
  birthDeclarationNotification: 'birthDeclarationNotification',
  birthRegistrationNotification: 'birthRegistrationNotification',
  birthRejectionNotification: 'birthRejectionNotification',
  deathInProgressNotification: 'deathInProgressNotification',
  deathDeclarationNotification: 'deathDeclarationNotification',
  deathRegistrationNotification: 'deathRegistrationNotification',
  deathRejectionNotification: 'deathRejectionNotification'
}

const otherTemplates = {
  authenticationCodeNotification: 'authenticationCodeNotification',
  userCredentialsNotification: 'userCredentialsNotification',
  retieveUserNameNotification: 'retieveUserNameNotification',
  updateUserNameNotification: 'updateUserNameNotification',
  resetUserPasswordNotification: 'resetUserPasswordNotification'
}

export type SMSTemplateType =
  | keyof typeof otherTemplates
  | keyof typeof informantTemplates

export async function sendSMS(
  type: SMSTemplateType,
  variables: Record<string, string>,
  recipient: string,
  locale: string
) {
  const message = await compileMessages(type, variables, locale)
  const body = JSON.stringify({
    messages: [
      {
        destinations: [
          {
            recipient
          }
        ],
        from: INFOBIP_SENDER_ID,
        text: message
      }
    ]
  })
  const headers = {
    Authorization: `App ${INFOBIP_API_KEY}`,
    'Content-Type': 'application/json'
  }

  let response
  try {
    response = await fetch(INFOBIP_GATEWAY_ENDPOINT, {
      method: 'POST',
      body,
      headers
    })
  } catch (error) {
    logger.error(error)
    throw error
  }

  const responseBody = await response.text()
  if (!response.ok) {
    logger.error(`Failed to send sms to ${recipient}. Reason: ${responseBody}`)
    throw internal(
      `Failed to send notification to ${recipient}. Reason: ${responseBody}`
    )
  }
  logger.info(`Response from Infobip: ${JSON.stringify(responseBody)}`)
}

const compileMessages = async (
  templateName: SMSTemplateType,
  variables: Record<string, string>,
  locale: string
) => {
  const languages = await getLanguages('notification')
  const language = languages.find(({ lang }) => lang === locale)

  if (!language) {
    throw new Error(
      `Locale "${locale}" not found while compiling notification messages.`
    )
  }

  const template = Handlebars.compile(language.messages[templateName])
  return template(variables)
}
