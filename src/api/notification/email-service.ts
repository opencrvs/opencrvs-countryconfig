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

import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'
import * as sgMail from '@sendgrid/mail'
import { SENDER_EMAIL_ADDRESS, EMAIL_API_KEY } from './constant'
import { logger } from '@countryconfig/logger'

if (EMAIL_API_KEY) {
  sgMail.setApiKey(EMAIL_API_KEY)
}

const readBirthTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `/email-templates/birth/${templateName}.html`)
      )
      .toString()
  )

const readDeathTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `/email-templates/death/${templateName}.html`)
      )
      .toString()
  )

const readOtherTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs
      .readFileSync(
        join(__dirname, `/email-templates/other/${templateName}.html`)
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
  loginURL: string
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

type DeclarationCommonVariables = {
  trackingId: string
  crvsOffice: string
  registrationLocation: string
  applicationName: string
  informantName: string
}

type InProgressDeclarationVariables = DeclarationCommonVariables

type InReviewDeclarationVariables = DeclarationCommonVariables

type RegistrationDeclarationVariables = DeclarationCommonVariables & {
  name: string
  registrationNumber: string
}

type RejectionDeclarationVariables = DeclarationCommonVariables & {
  name: string
}

const templates = {
  'onboarding-invite': {
    type: 'onboarding-invite',
    subject: 'Welcome to OpenCRVS!',
    template: readOtherTemplate<OnboardingInviteVariables>('onboarding-invite')
  },
  '2-factor-authentication': {
    type: '2-factor-authentication',
    subject: 'Two factor authentication',
    template: readOtherTemplate<TwoFactorAuthenticationVariables>(
      '2-factor-authentication'
    )
  },
  'change-phone-number': {
    type: 'change-phone-number',
    subject: 'Phone number change request',
    template: readOtherTemplate<ChangePhoneNumberVariables>(
      'change-phone-number'
    )
  },
  'change-email-address': {
    type: 'change-email-address',
    subject: 'Email address change request',
    template: readOtherTemplate<ChangeEmailAddressVariables>(
      'change-email-address'
    )
  },
  'password-reset-by-system-admin': {
    type: 'password-reset-by-system-admin',
    subject: 'Account password reset invitation',
    template: readOtherTemplate<ResetPasswordBySysAdminVariables>(
      'password-reset-by-system-admin'
    )
  },
  'password-reset': {
    type: 'password-reset',
    subject: 'Account password reset request',
    template: readOtherTemplate<ResetPasswordVariables>('password-reset')
  },
  'username-reminder': {
    type: 'username-reminder',
    subject: 'Account username reminder',
    template: readOtherTemplate<UsernameReminderVariables>('username-reminder')
  },
  'username-updated': {
    type: 'username-updated',
    subject: 'Account username updated',
    template: readOtherTemplate<UsernameUpdateVariables>('username-updated')
  },
  birthInProgressNotification: {
    type: 'birthInProgressNotification',
    subject: 'Birth declaration in progress',
    template: readBirthTemplate<InProgressDeclarationVariables>('inProgress')
  },
  birthDeclarationNotification: {
    type: 'birthDeclarationNotification',
    subject: 'Birth declaration in review',
    template: readBirthTemplate<InReviewDeclarationVariables>('inReview')
  },
  birthRegistrationNotification: {
    type: 'birthRegistrationNotification',
    subject: 'Birth declaration registered',
    template:
      readBirthTemplate<RegistrationDeclarationVariables>('registration')
  },
  birthRejectionNotification: {
    type: 'birthRejectionNotification',
    subject: 'Birth declaration required update',
    template: readBirthTemplate<RejectionDeclarationVariables>('rejection')
  },
  deathInProgressNotification: {
    type: 'deathInProgressNotification',
    subject: 'Death declaration in progress',
    template: readDeathTemplate<InProgressDeclarationVariables>('inProgress')
  },
  deathDeclarationNotification: {
    type: 'deathDeclarationNotification',
    subject: 'Death declaration in review',
    template: readDeathTemplate<InReviewDeclarationVariables>('inReview')
  },
  deathRegistrationNotification: {
    type: 'deathRegistrationNotification',
    subject: 'Death declaration registered',
    template:
      readDeathTemplate<RegistrationDeclarationVariables>('registration')
  },
  deathRejectionNotification: {
    type: 'deathRejectionNotification',
    subject: 'Death declaration required update',
    template: readDeathTemplate<RejectionDeclarationVariables>('rejection')
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
  | InProgressDeclarationVariables
  | InReviewDeclarationVariables
  | RegistrationDeclarationVariables
  | RejectionDeclarationVariables

export const sendEmail = async (
  type: EmailTemplateType,
  variables: TemplateVariables,
  recipient: string
) => {
  let emailSubject = ''
  let emailBody = ''

  emailSubject = templates[type].subject
  emailBody = templates[type].template(variables as any)

  const msg = {
    to: recipient,
    from: SENDER_EMAIL_ADDRESS,
    subject: emailSubject,
    html: emailBody
  }

  if (recipient.endsWith('@example.com')) {
    logger.info(`Example email detected: ${msg.to}. Not sending the email.`)
    return
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
