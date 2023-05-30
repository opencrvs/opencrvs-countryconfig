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
import {
  CLICKATELL_API_ID,
  CLICKATELL_PASSWORD,
  CLICKATELL_USER,
  INFOBIP_API_KEY,
  INFOBIP_GATEWAY_ENDPOINT,
  INFOBIP_SENDER_ID
} from './constant'
import { Iconv } from 'iconv'
import { logger } from '@countryconfig/logger'
import { stringify } from 'querystring'
import fetch from 'node-fetch'
import { readFileSync } from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'
import { internal } from '@hapi/boom'

const templates = {
  birthInProgressNotification: 'birthInProgressNotification',
  birthDeclarationNotification: 'birthDeclarationNotification',
  birthRegistrationNotification: 'birthRegistrationNotification',
  birthRejectionNotification: 'birthRejectionNotification',
  deathInProgressNotification: 'deathInProgressNotification',
  deathDeclarationNotification: 'deathDeclarationNotification',
  deathRegistrationNotification: 'deathRegistrationNotification',
  deathRejectionNotification: 'deathRejectionNotification',
  authenticationCodeNotification: 'authenticationCodeNotification',
  userCredentialsNotification: 'userCredentialsNotification',
  retieveUserNameNotification: 'retieveUserNameNotification',
  updateUserNameNotification: 'updateUserNameNotification',
  resetUserPasswordNotification: 'resetUserPasswordNotification'
}

export type SMSTemplateType = keyof typeof templates

interface ISMSNotificationTemplate {
  lang: string
  displayName: string
  messages: Record<SMSTemplateType, string>
}

export async function sendSMSClickatell(
  type: SMSTemplateType,
  variables: Record<string, string>,
  recipient: string,
  locale: string,
  convertUnicode?: boolean
) {
  const message = compileMessages(type, variables, locale)
  let params = {
    user: CLICKATELL_USER,
    password: CLICKATELL_PASSWORD,
    api_id: CLICKATELL_API_ID,
    to: recipient,
    text: message,
    unicode: 0
  }
  /* character limit for unicoded sms is 70 otherwise 160 */
  if (convertUnicode) {
    params = {
      ...params,
      text: new Iconv('UTF-8', 'UCS-2BE').convert(message).toString('hex'),
      unicode: 1
    }
  }
  logger.info(`Sending an sms: ${JSON.stringify(params)}`)

  const url = `https://api.clickatell.com/http/sendmsg?${stringify(params)}`

  let res
  try {
    res = await fetch(url)
  } catch (err) {
    logger.error(err)
    throw err
  }

  const body = await res.text()
  if (body.includes('ERR')) {
    logger.error(`Failed to send sms to ${recipient}. Error: ${body}`)
    throw internal('Failed to send notification', body)
  }
  logger.info('Received success response from Clickatell: Success')
}

export async function sendSMSInfobip(
  type: SMSTemplateType,
  variables: Record<string, string>,
  recipient: string,
  locale: string
) {
  const message = compileMessages(type, variables, locale)
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
  logger.info(`Response from Infobip: ${JSON.stringify(responseBody)}`)
  if (!response.ok) {
    logger.error(
      `Failed to send sms to ${recipient}. Reason: ${response.text()}`
    )
    throw internal(
      `Failed to send notification to ${recipient}. Reason: ${response.text()}`
    )
  }
}

function compileMessages(
  templateName: SMSTemplateType,
  variables: Record<string, string>,
  locale: string
): string {
  const smsNotificationTemplate = JSON.parse(
    readFileSync(
      join(__dirname, '../languages/content/notification/notification.json')
    ).toString()
  ).data as ISMSNotificationTemplate[]

  const language = smsNotificationTemplate.filter((obj) => {
    return obj.lang === locale
  })[0]

  const template = Handlebars.compile(language.messages[templateName])
  return template(variables)
}
