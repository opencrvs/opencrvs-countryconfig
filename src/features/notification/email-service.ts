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

import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'
import * as sgMail from '@sendgrid/mail'
import { SENDER_EMAIL_ADDRESS, EMAIL_API_KEY } from './constant'
import { logger } from '@countryconfig/logger'

if (EMAIL_API_KEY) {
  sgMail.setApiKey(EMAIL_API_KEY)
}

const readTemplate = <T extends Record<string, string>>(templateName: string) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `../../email-templates/${templateName}.html`)
      )
      .toString()
  )

type OnboardingInviteVariables = {
  firstNames: string
  username: string
  password: string
  applicationName: string
  completeSetupUrl: string
  countryLogo: string
}
type TwoFactorAuthenticationVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type ChangePhoneNumberVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type ChangeEmailAddressVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type ResetPasswordBySysAdminVariables = {
  firstNames: string
  password: string
  applicationName: string
  countryLogo: string
}
type ResetPasswordVariables = {
  firstNames: string
  authCode: string
  applicationName: string
  countryLogo: string
}
type UsernameReminderVariables = {
  firstNames: string
  username: string
  applicationName: string
  countryLogo: string
}

type UsernameUpdateVariables = {
  firstNames: string
  username: string
  applicationName: string
  countryLogo: string
}

const templates = {
  'onboarding-invite': {
    type: 'onboarding-invite',
    subject: 'Welcome to OpenCRVS!',
    template: readTemplate<OnboardingInviteVariables>('onboarding-invite')
  },
  '2-factor-authentication': {
    type: '2-factor-authentication',
    subject: 'Two factor authentication',
    template: readTemplate<TwoFactorAuthenticationVariables>(
      '2-factor-authentication'
    )
  },
  'change-phone-number': {
    type: 'change-phone-number',
    subject: 'Phone number change request',
    template: readTemplate<ChangePhoneNumberVariables>('change-phone-number')
  },
  'change-email-address': {
    type: 'change-email-address',
    subject: 'Email address change request',
    template: readTemplate<ChangeEmailAddressVariables>('change-email-address')
  },
  'password-reset-by-system-admin': {
    type: 'password-reset-by-system-admin',
    subject: 'Account password reset invitation',
    template: readTemplate<ResetPasswordBySysAdminVariables>(
      'password-reset-by-system-admin'
    )
  },
  'password-reset': {
    type: 'password-reset',
    subject: 'Account password reset request',
    template: readTemplate<ResetPasswordVariables>('password-reset')
  },
  'username-reminder': {
    type: 'username-reminder',
    subject: 'Account username reminder',
    template: readTemplate<UsernameReminderVariables>('username-reminder')
  },
  'username-updated': {
    type: 'username-updated',
    subject: 'Account username updated',
    template: readTemplate<UsernameUpdateVariables>('username-reminder')
  }
}

export type EmailTemplateType = keyof typeof templates

export type TemplateVariables =
  | OnboardingInviteVariables
  | TwoFactorAuthenticationVariables
  | ChangePhoneNumberVariables
  | ResetPasswordBySysAdminVariables
  | ResetPasswordVariables
  | UsernameReminderVariables
  | UsernameUpdateVariables

export const sendEmail = async (
  type: EmailTemplateType,
  variables: TemplateVariables,
  recipient: string
) => {
  let emailSubject = ''
  let emailBody = ''
  if (type === 'onboarding-invite') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(variables as OnboardingInviteVariables)
  } else if (type === '2-factor-authentication') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(
      variables as TwoFactorAuthenticationVariables
    )
  } else if (type === 'change-phone-number') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(
      variables as ChangePhoneNumberVariables
    )
  } else if (type === 'change-email-address') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(
      variables as ChangeEmailAddressVariables
    )
  } else if (type === 'password-reset-by-system-admin') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(
      variables as ResetPasswordBySysAdminVariables
    )
  } else if (type === 'password-reset') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(variables as ResetPasswordVariables)
  } else if (type === 'username-reminder') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(variables as UsernameReminderVariables)
  } else if (type === 'username-updated') {
    emailSubject = templates[type].subject
    emailBody = templates[type].template(variables as UsernameUpdateVariables)
  }

  const msg = {
    to: recipient,
    from: SENDER_EMAIL_ADDRESS,
    subject: emailSubject,
    html: emailBody
  }

  try {
    logger.info(`Sending email to ${msg.to}`)
    await sgMail.send(msg)
  } catch (error) {
    logger.error(`Unable to send email to ${recipient} for error : ${error}`)

    if (error.response) {
      logger.error(error.response.body)
    }
  }
}
