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
import { logger, maskEmail, maskSms } from '@countryconfig/logger'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { IApplicationConfig, getApplicationConfig } from '../../utils'
import {
  COUNTRY_LOGO_URL,
  SENDER_EMAIL_ADDRESS,
  USER_NOTIFICATION_DELIVERY_METHOD
} from './constant'
import { sendEmail } from './email-service'
import { SMSTemplateType, sendSMS } from './sms-service'
import {
  AllUserNotificationVariables,
  EmailTemplateType,
  TemplateVariables,
  TriggerToTemplate,
  TriggerVariable,
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

import {
  TriggerEvent,
  TriggerPayload,
  FullName,
  Recipient
} from '@opencrvs/toolkit/notification'
import { LOGIN_URL } from '@countryconfig/constants'

type EmailNotificationPayload = {
  templateName: {
    email: EmailTemplateType
  }
  recipient: {
    email: string
    bcc?: string[]
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
    sms: Joi.string().allow(null, '').optional(),
    bcc: Joi.array().items(Joi.string().required()).optional()
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
    if ('sms' in recipient) {
      recipient.sms = maskSms(recipient.sms)
    } else {
      recipient.email = maskEmail(recipient.email)
      recipient.bcc = Array.isArray(recipient.bcc)
        ? recipient.bcc.map(maskEmail)
        : undefined
    }
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
    logger.info(
      `Notification method is email and recipient ${maskEmail(recipient.email)}`
    )

    const template = getTemplate(templateName.email)
    const emailSubject =
      template.type === 'allUserNotification'
        ? (variables as AllUserNotificationVariables).subject
        : template.subject

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
      to: recipient.email,
      bcc: recipient.bcc
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
        { ...payload, from: maskEmail(payload.from), to: maskEmail(payload.to) }
      )}`
    )
    return h.response().code(200)
  }

  await sendEmail(payload)

  return h.response().code(200)
}

export async function userCreatedNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { payload: maybePayload } = request

  const payloadValidation =
    TriggerPayload['user-created'].safeParse(maybePayload)

  if (!payloadValidation.success) {
    return h
      .response({ error: 'Invalid payload', details: payloadValidation.error })
      .code(400)
  }

  const payload = payloadValidation.data

  await sendNotification('user-created', payload)

  return h.response().code(200)
}

function stringifyV1Name(name: FullName) {
  return name.given[0] + ' ' + name.family
}

function generateFailureLog({
  contact,
  name,
  event,
  reason
}: {
  contact: { mobile?: string; email?: string }
  name: string
  event: TriggerEvent
  reason: string
}) {
  contact.mobile &&= maskSms(contact.mobile)
  contact.email &&= maskEmail(contact.email)
  logger.info(
    `Ignoring notification due to ${reason}. Params: ${JSON.stringify({
      event,
      recipient: {
        ...contact,
        name
      }
    })}`
  )
  return
}

export async function sendNotification<T extends TriggerEvent>(
  event: T,
  payload: TriggerPayload[T]
) {
  const variables = convertPayloadToVariable({
    event,
    payload
  } as TriggerEventPayloadPair)

  const { name: nameV1, ...contact } = payload.recipient
  const name = stringifyV1Name(nameV1[0])

  if (process.env.NODE_ENV !== 'production') {
    generateFailureLog({
      contact,
      name,
      event,
      reason: "NODE_ENV not being 'production'"
    })
    return
  }
  const applicationConfig = await getApplicationConfig()
  const applicationName = applicationConfig.APPLICATION_NAME

  if (USER_NOTIFICATION_DELIVERY_METHOD === 'email') {
    if (!payload.recipient.email) {
      generateFailureLog({
        contact,
        name,
        event,
        reason:
          "Not having recipient email when USER_NOTIFICATION_DELIVERY_METHOD is 'email'"
      })
      return
    }

    const template = getTemplate(TriggerToTemplate['user-created'])

    const emailBody = renderTemplate(template, {
      ...variables,
      applicationName,
      countryLogo: COUNTRY_LOGO_URL
    })

    console.log(JSON.stringify({ emailBody }))

    await sendEmail({
      subject: template.subject,
      html: emailBody,
      from: SENDER_EMAIL_ADDRESS,
      to: payload.recipient.email
    })
  } else if (USER_NOTIFICATION_DELIVERY_METHOD === 'sms') {
    if (!contact.mobile) {
      generateFailureLog({
        contact,
        name,
        event,
        reason:
          "Not having recipient mobile when USER_NOTIFICATION_DELIVERY_METHOD is 'sms'"
      })
      return
    }
  } else {
    generateFailureLog({
      contact,
      name,
      event,
      reason: `Invalid USER_NOTIFICATION_DELIVERY_METHOD. Options are 'emai' or 'sms'. Found ${USER_NOTIFICATION_DELIVERY_METHOD}`
    })
    return
  }
}

type TriggerEventPayloadPair<T extends TriggerEvent = TriggerEvent> = {
  [K in T]: {
    event: K
    payload: TriggerPayload[K]
  }
}[T]

function convertPayloadToVariable({
  event,
  payload
}: TriggerEventPayloadPair): TriggerVariable[typeof event] {
  const firstNames = payload.recipient.name[0].given[0]
  switch (event) {
    case TriggerEvent.USER_CREATED:
      return {
        firstNames: payload.recipient.name[0].given[0],
        username: payload.username,
        password: payload.temporaryPassword,
        completeSetupUrl: LOGIN_URL,
        loginURL: LOGIN_URL
      }

    case TriggerEvent.USER_UPDATED:
      return {
        firstNames,
        username: payload.username
      }

    case TriggerEvent.USERNAME_REMINDER:
      return {
        firstNames,
        username: payload.username
      }

    case TriggerEvent.RESET_PASSWORD:
      return {
        firstNames,
        authCode: payload.temporaryPassword
      }

    case TriggerEvent.RESET_PASSWORD_BY_ADMIN:
      return {
        firstNames,
        password: payload.temporaryPassword
      }

    case TriggerEvent.TWO_FA:
      return {
        firstNames,
        authCode: payload.code
      }

    default:
      throw new Error(`Unknown event: ${event}`)
  }
}
