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
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import {
  SMSTemplateType,
  sendSMSClickatell,
  sendSMSInfobip
} from './sms-service'
import {
  EmailTemplateType,
  TemplateVariables,
  sendEmail
} from './email-service'
import { SMS_PROVIDER } from './constant'
import { APPLICATION_CONFIG_URL } from '@countryconfig/constants'
import fetch from 'node-fetch'
import { URL } from 'url'
import { logger } from '@countryconfig/logger'

type NotificationPayload = {
  type: 'email' | 'sms'
  templateName: EmailTemplateType | SMSTemplateType
  recipient: string
  locale: string
  variables: TemplateVariables
  convertUnicode?: boolean
}

interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
}
interface ICountryLogo {
  fileName: string
  file: string
}
interface IApplicationConfig {
  APPLICATION_NAME: string
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  SENTRY: string
  LOGROCKET: string
  LOGIN_BACKGROUND: ILoginBackground
}
interface IApplicationConfigResponse {
  config: IApplicationConfig
}

export const notificationScheme = Joi.object({
  type: Joi.string().valid('sms', 'email')
}).unknown(true)

export async function notificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as NotificationPayload
  const applicationName = await getApplicationName()
  payload.variables = { ...payload.variables, applicationName }
  switch (payload.type) {
    case 'email':
      sendEmail(
        payload.templateName as EmailTemplateType,
        payload.variables,
        payload.recipient
      )
      break
    case 'sms':
      if (SMS_PROVIDER === 'infobip') {
        await sendSMSInfobip(
          payload.templateName as SMSTemplateType,
          payload.variables,
          payload.recipient,
          payload.locale
        )
      } else if (SMS_PROVIDER === 'clickatell') {
        await sendSMSClickatell(
          payload.templateName as SMSTemplateType,
          payload.variables,
          payload.recipient,
          payload.locale,
          payload.convertUnicode
        )
      }
      break
  }
  return h.response().code(200)
}

async function getApplicationName() {
  try {
    const configURL = new URL('publicConfig', APPLICATION_CONFIG_URL).toString()
    const res = await fetch(configURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const configData = (await res.json()) as IApplicationConfigResponse
    return configData.config.APPLICATION_NAME
  } catch (err) {
    logger.error(`Unable to get public application config for error : ${err}`)
    throw err
  }
}
