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

const readBirthTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs.readFileSync(join(__dirname, `./birth/${templateName}.html`)).toString()
  )

const readDeathTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs.readFileSync(join(__dirname, `./death/${templateName}.html`)).toString()
  )

const readOtherTemplate = <T extends Record<string, string>>(
  templateName: string
) =>
  Handlebars.compile<T>(
    fs.readFileSync(join(__dirname, `./other/${templateName}.html`)).toString()
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

type ApproveCorrectionVariables = {
  firstNames: string
  lastName: string
  event: string
  trackingId: string
  applicationName: string
  countryLogo: string
}

type RejectCorrectionVariables = ApproveCorrectionVariables & { reason: string }

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

export type AllUserNotificationVariables = {
  subject: string
  body: string
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
  'correction-approved': {
    type: 'correction-approved',
    subject: 'Correction request approved',
    template: readOtherTemplate<ApproveCorrectionVariables>(
      'correction-approved'
    )
  },
  'correction-rejected': {
    type: 'correction-rejected',
    subject: 'Correction request rejected',
    template: readOtherTemplate<RejectCorrectionVariables>(
      'correction-rejected'
    )
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
  },
  allUserNotification: {
    type: 'allUserNotification',
    subject: '', // Subject defined from National Sys Admin Dashboard
    template: readOtherTemplate<AllUserNotificationVariables>(
      'all-user-notification'
    )
  }
} as const

export type EmailTemplateType = keyof typeof templates
export function getTemplate<T extends EmailTemplateType>(type: T) {
  return templates[type]
}

export function renderTemplate<T extends (typeof templates)[EmailTemplateType]>(
  template: T,
  variables: unknown
) {
  return template.template(variables as any)
}

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
  | AllUserNotificationVariables
