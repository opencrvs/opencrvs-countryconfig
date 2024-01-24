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
import { logger } from '@countryconfig/logger'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { IApplicationConfig, getApplicationConfig } from '../../utils'
import { COUNTRY_LOGO_URL, LOGIN_URL, SENDER_EMAIL_ADDRESS } from './constant'
import { sendEmail } from './email-service'
import { SMSTemplateType, sendSMS } from './sms-service'
import {
  EmailTemplateType,
  TemplateVariables,
  getTemplate,
  renderTemplate
} from './email-templates'

function isEmailPayload(
  applicationConfig: IApplicationConfig,
  notificationPayload: NotificationPayload
): notificationPayload is EmailNotificationPayload {
  const recipientType = notificationPayload.type
  const notificationMethod =
    recipientType == 'user'
      ? applicationConfig.USER_NOTIFICATION_DELIVERY_METHOD
      : applicationConfig.INFORMANT_NOTIFICATION_DELIVERY_METHOD
  return notificationMethod === 'email'
}

type EmailNotificationPayload = {
  templateName: {
    email: EmailTemplateType
  }
  recipient: {
    email: string
  }
  type: 'user' | 'informant'
  locale: string
  variables: TemplateVariables
  convertUnicode?: boolean
}

type SMSNotificationPayload = {
  templateName: {
    sms: SMSTemplateType
  }
  recipient: {
    sms: string
  }
  type: 'user' | 'informant'
  locale: string
  variables: TemplateVariables
  convertUnicode?: boolean
}

type NotificationPayload = SMSNotificationPayload | EmailNotificationPayload

export const notificationSchema = Joi.object({
  templateName: Joi.object({
    email: Joi.string().required(),
    sms: Joi.string().required()
  }),
  recipient: Joi.object({
    email: Joi.string().allow(null, '').optional(),
    sms: Joi.string().allow(null, '').optional()
  }),
  type: Joi.string().valid('user', 'informant').required()
}).unknown(true)

export async function notificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as NotificationPayload

  const applicationConfig = await getApplicationConfig()
  const applicationName = applicationConfig.APPLICATION_NAME

  if (process.env.NODE_ENV !== 'production') {
    const { templateName, recipient, convertUnicode, type } = payload
    logger.info(
      `Ignoring notification due to NODE_ENV not being 'production'. Params: ${JSON.stringify(
        {
          templateName,
          recipient,
          convertUnicode,
          type
        }
      )}`
    )
    return h.response().code(200)
  }

  if (isEmailPayload(applicationConfig, payload)) {
    const { templateName, variables, recipient } = payload
    logger.info(`Notification method is email and recipient ${recipient.email}`)

    const template = getTemplate(templateName.email)
    const emailSubject = template.subject

    const emailBody = renderTemplate(template, {
      ...variables,
      applicationName,
      countryLogo: COUNTRY_LOGO_URL,
      loginURL: LOGIN_URL
    })

    await sendEmail({
      subject: emailSubject,
      html: emailBody,
      from: SENDER_EMAIL_ADDRESS,
      to: recipient.email
    })
  } else {
    const { templateName, variables, recipient, locale } = payload
    await sendSMS(
      templateName.sms,
      { ...variables, applicationName, countryLogo: COUNTRY_LOGO_URL },
      recipient.sms,
      locale
    )
  }

  return h.response().code(200)
}

type EmailPayloads = {
  subject: string
  html: string
  from: string
  to: string
}

export const emailSchema = Joi.object({
  subject: Joi.string().required(),
  html: Joi.string().required(),
  from: Joi.string().required(),
  to: Joi.string().required()
})

export async function emailHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as EmailPayloads

  if (process.env.NODE_ENV !== 'production') {
    logger.info(
      `Ignoring email due to NODE_ENV not being 'production'. Params: ${JSON.stringify(
        payload
      )}`
    )
    return h.response().code(200)
  }

  logger.info(`Email is being sent to ${payload.to}`)

  await sendEmail(payload)

  return h.response().code(200)
}
