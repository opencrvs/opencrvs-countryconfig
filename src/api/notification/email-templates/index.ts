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

import { TriggerEvent } from '@opencrvs/toolkit/notification'
import * as fs from 'fs'
import * as Handlebars from 'handlebars'
import { join } from 'path'
import { z } from 'zod'

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

const BaseVariables = z.object({
  applicationName: z.string(),
  countryLogo: z.string()
})

export type BaseVariables = z.infer<typeof BaseVariables>

export const TriggerVariable = {
  [TriggerEvent.USER_CREATED]: z.object({
    firstName: z.string(),
    username: z.string(),
    password: z.string(),
    completeSetupUrl: z.string(),
    loginURL: z.string()
  }),
  [TriggerEvent.USER_UPDATED]: z.object({
    firstName: z.string(),
    oldUsername: z.string(),
    newUsername: z.string()
  }),
  [TriggerEvent.USERNAME_REMINDER]: z.object({
    firstName: z.string(),
    username: z.string()
  }),
  [TriggerEvent.RESET_PASSWORD]: z.object({
    firstName: z.string(),
    authCode: z.string()
  }),
  [TriggerEvent.RESET_PASSWORD_BY_ADMIN]: z.object({
    firstName: z.string(),
    password: z.string()
  }),
  [TriggerEvent.TWO_FA]: z.object({
    firstName: z.string(),
    authCode: z.string()
  })
} as const

export type TriggerVariable = {
  [T in TriggerEvent]: z.infer<(typeof TriggerVariable)[T]>
}

export const ChangePhoneNumberVariables = BaseVariables.extend({
  firstNames: z.string(),
  authCode: z.string()
})
export type ChangePhoneNumberVariables = z.infer<
  typeof ChangePhoneNumberVariables
>

export const ChangeEmailAddressVariables = BaseVariables.extend({
  firstNames: z.string(),
  authCode: z.string()
})
export type ChangeEmailAddressVariables = z.infer<
  typeof ChangeEmailAddressVariables
>

export const ApproveCorrectionVariables = BaseVariables.extend({
  firstNames: z.string(),
  lastName: z.string(),
  event: z.string(),
  trackingId: z.string()
})
export type ApproveCorrectionVariables = z.infer<
  typeof ApproveCorrectionVariables
>

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
  'user-created': {
    type: 'onboarding-invite',
    subject: 'Welcome to OpenCRVS!',
    template:
      readOtherTemplate<TriggerVariable['user-created']>('onboarding-invite')
  },
  '2fa': {
    type: '2-factor-authentication',
    subject: 'Two factor authentication',
    template: readOtherTemplate<TriggerVariable['2fa']>(
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
  'reset-password-by-admin': {
    type: 'password-reset-by-system-admin',
    subject: 'Account password reset invitation',
    template: readOtherTemplate<TriggerVariable['reset-password-by-admin']>(
      'password-reset-by-system-admin'
    )
  },
  'reset-password': {
    type: 'password-reset',
    subject: 'Account password reset request',
    template:
      readOtherTemplate<TriggerVariable['reset-password']>('password-reset')
  },
  'username-reminder': {
    type: 'username-reminder',
    subject: 'Account username reminder',
    template:
      readOtherTemplate<TriggerVariable['username-reminder']>(
        'username-reminder'
      )
  },
  'user-updated': {
    type: 'username-updated',
    subject: 'Account username updated',
    template:
      readOtherTemplate<TriggerVariable['user-updated']>('username-updated')
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
