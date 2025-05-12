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
import { internal } from '@hapi/boom'
import { getLanguages } from '../content/service'
import {
  AWS_SNS_REGION_NAME,
  AWS_SNS_ACCESS_KEY_ID,
  AWS_SNS_SECRET_ACCESS_KEY,
  AWS_SNS_SENDER_ID,
  SMS_PROVIDER
} from './constant'
import {
  SNSClient,
  PublishCommand,
  PublishCommandOutput
} from '@aws-sdk/client-sns'

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

let awsSnsClient: SNSClient

const getOrCreateAwsSnsClient = () => {
  if (awsSnsClient) {
    return awsSnsClient
  }

  awsSnsClient = new SNSClient({
    region: AWS_SNS_REGION_NAME,
    credentials: {
      accessKeyId: AWS_SNS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SNS_SECRET_ACCESS_KEY
    },
    endpoint: process.env.AWS_ENDPOINT
  })

  return awsSnsClient
}

export async function sendSMS(
  type: SMSTemplateType,
  variables: Record<string, string>,
  recipient: string,
  locale: string
) {
  if (SMS_PROVIDER === 'aws-sns') {
    const client = getOrCreateAwsSnsClient()
    const message = await compileMessages(type, variables, locale)
    const publishParams = {
      PhoneNumber: recipient,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: AWS_SNS_SENDER_ID
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional'
        }
      }
    }

    const publishSms = new PublishCommand(publishParams)

    let response: PublishCommandOutput
    try {
      response = await client.send(publishSms)
    } catch (error) {
      logger.error(error)
      throw error
    }
    if (
      response.$metadata.httpStatusCode !== 200 &&
      response.$metadata.httpStatusCode !== 201
    ) {
      logger.error(`Failed to send sms to ${recipient}`)
      throw internal(`Failed to send notification to ${recipient}.`)
    }
    logger.info(`Response from AWS SNS: ${JSON.stringify(response)}`)
  } else {
    // Logic for other SMS providers can be added here
    logger.error(`SMS provider "${SMS_PROVIDER}" is not supported yet.`)
    throw internal(
      `Failed to send SMS: Unsupported provider "${SMS_PROVIDER}".`
    )
  }
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
