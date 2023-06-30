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
  informantTemplates,
  sendSMSClickatell,
  sendSMSInfobip
} from './sms-service'
import {
  EmailTemplateType,
  TemplateVariables,
  sendEmail
} from './email-service'
import {
  SMS_PROVIDER,
  USER_NOTIFICATION_DELIVERY_METHOD,
  COUNTRY_LOGO_URL,
  LOGIN_URL
} from './constant'
import { logger } from '@countryconfig/logger'
import { getApplicationConfig } from '../utils'

type NotificationPayload = {
  templateName: {
    sms: SMSTemplateType
    email?: EmailTemplateType
  }
  recipient: {
    sms?: string
    email?: string
  }
  locale: string
  variables: TemplateVariables
  convertUnicode?: boolean
}

export const notificationScheme = Joi.object({
  templateName: Joi.object({
    email: Joi.string().allow('').optional(),
    sms: Joi.string().required()
  }),
  recipient: Joi.object({
    email: Joi.string().allow('').optional(),
    sms: Joi.string()
  })
}).unknown(true)

export async function notificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { templateName, variables, recipient, locale, convertUnicode } =
    request.payload as NotificationPayload

  if (process.env.NODE_ENV !== 'production') {
    logger.info(
      `Ignoring notification due to NODE_ENV not being 'production'. Params: ${JSON.stringify(
        {
          templateName,
          recipient,
          convertUnicode
        }
      )}`
    )
    return h.response().code(200)
  }

  const isInformantNotification =
    !templateName?.email && templateName.sms in informantTemplates
  const notificationMethod = isInformantNotification
    ? 'sms'
    : USER_NOTIFICATION_DELIVERY_METHOD
  logger.info(
    `Notification method is ${notificationMethod} and recipient ${
      notificationMethod === 'email' ? recipient.email : recipient.sms
    }`
  )
  const applicationName = (await getApplicationConfig()).APPLICATION_NAME
  const countryLogo = COUNTRY_LOGO_URL
  const loginURL = LOGIN_URL
  switch (notificationMethod) {
    case 'email':
      await sendEmail(
        templateName.email as EmailTemplateType,
        { ...variables, applicationName, countryLogo, loginURL },
        recipient.email as string
      )
      break
    case 'sms':
      if (SMS_PROVIDER === 'infobip') {
        await sendSMSInfobip(
          templateName.sms as SMSTemplateType,
          { ...variables, applicationName, countryLogo },
          recipient.sms as string,
          locale
        )
      } else if (SMS_PROVIDER === 'clickatell') {
        await sendSMSClickatell(
          templateName.sms as SMSTemplateType,
          { ...variables, applicationName, countryLogo },
          recipient.sms as string,
          locale,
          convertUnicode
        )
      }
      break
  }
  return h.response().code(200)
}
