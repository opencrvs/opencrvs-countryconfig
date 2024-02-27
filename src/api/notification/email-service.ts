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
import * as Handlebars from 'handlebars'
import * as nodemailer from 'nodemailer'
import {
  ALERT_EMAIL,
  SENDER_EMAIL_ADDRESS,
  SMTP_HOST,
  SMTP_PASSWORD,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USERNAME
} from './constant'
import { DOMAIN } from '@countryconfig/constants'

export const sendEmail = async (params: {
  subject: string
  html: string
  from: string
  to: string
}) => {
  if (params.to.endsWith('@example.com')) {
    logger.info(`Example email detected: ${params.to}. Not sending the email.`)
    return
  }

  logger.info(`Sending email to ${params.to}`)

  const emailTransport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD
    }
  })

  const replaceVariables = (text: string) =>
    Handlebars.compile(text)({
      /*
       * Any handlebar variable that is used in the email template
       * should be defined here.
       */
      DOMAIN: DOMAIN,
      ALERT_EMAIL: ALERT_EMAIL,
      SENDER_EMAIL_ADDRESS: SENDER_EMAIL_ADDRESS
    })

  try {
    await emailTransport.sendMail({
      from: replaceVariables(params.from),
      to: replaceVariables(params.to),
      subject: replaceVariables(params.subject),
      html: replaceVariables(params.html)
    })
  } catch (error) {
    logger.error(`Unable to send email to ${params.to} for error : ${error}`)

    if (error.response) {
      logger.error(error.response.body)
    }
    throw error
  }
}
