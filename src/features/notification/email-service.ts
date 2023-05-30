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
}
type TwoFactorAuthenticationVariables = {
  firstNames: string
  authCode: string
  applicationName: string
}
type ChangePhoneNumberVariables = {
  firstNames: string
  authCode: string
  applicationName: string
}
type ResetPasswordBySysAdminVariables = {
  firstNames: string
  password: string
  applicationName: string
}
type ResetPasswordVariables = {
  firstNames: string
  authCode: string
  applicationName: string
}
type UsernameReminderVariables = {
  firstNames: string
  username: string
  applicationName: string
}

type UsernameUpdateVariables = {
  firstNames: string
  username: string
  applicationName: string
}

const templates = {
  'onboarding-invite': {
    type: 'onboarding-invite',
    title: 'Welcome to OpenCRVS!',
    template: readTemplate<OnboardingInviteVariables>('onboarding-invite')
  },
  '2-factor-authentication': {
    type: '2-factor-authentication',
    title: 'Two factor authentication',
    template: readTemplate<TwoFactorAuthenticationVariables>(
      '2-factor-authentication'
    )
  },
  'change-phone-number': {
    type: 'change-phone-number',
    title: 'Phone number change request',
    template: readTemplate<ChangePhoneNumberVariables>('change-phone-number')
  },
  'password-reset-by-system-admin': {
    type: 'password-reset-by-system-admin',
    title: 'OpenCRVS account password reset invitation',
    template: readTemplate<ResetPasswordBySysAdminVariables>(
      'password-reset-by-system-admin'
    )
  },
  'password-reset': {
    type: 'password-reset',
    title: 'OpenCRVS account password reset request',
    template: readTemplate<ResetPasswordVariables>('password-reset')
  },
  'username-reminder': {
    type: 'username-reminder',
    title: 'OpenCRV account username reminder',
    template: readTemplate<UsernameReminderVariables>('username-reminder')
  },
  'username-updated': {
    type: 'username-updated',
    title: 'OpenCRV account username updated',
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

export const sendEmail = (
  type: EmailTemplateType,
  variables: TemplateVariables,
  recipient: string
) => {
  let emailtitle = ''
  let emailBody = ''
  if (type === 'onboarding-invite') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(variables as OnboardingInviteVariables)
  } else if (type === '2-factor-authentication') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(
      variables as TwoFactorAuthenticationVariables
    )
  } else if (type === 'change-phone-number') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(
      variables as ChangePhoneNumberVariables
    )
  } else if (type === 'password-reset-by-system-admin') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(
      variables as ResetPasswordBySysAdminVariables
    )
  } else if (type === 'password-reset') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(variables as ResetPasswordVariables)
  } else if (type === 'username-reminder') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(variables as UsernameReminderVariables)
  } else if (type === 'username-updated') {
    emailtitle = templates[type].title
    emailBody = templates[type].template(variables as UsernameUpdateVariables)
  }
  console.log('-=-=-=-=-=-=-emailPayload=-=-=-=-=-=-=')
  console.log(emailBody)
  console.log(emailtitle)

  // TODO: Send the email with nodemailer using SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS from constants
}
