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
import { defineFormConditional } from '@opencrvs/toolkit/conditionals'
import { TranslationConfig } from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'

/** Type of ID shared across mother, father and informant on the stillbirth form. */
export const StillbirthIdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER',
  NONE: 'NONE'
} as const

const stillbirthIdTypeMessageDescriptors = {
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth certificate',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBirthCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof StillbirthIdType, TranslationConfig>

export const stillbirthIdTypeOptions = createSelectOptions(
  StillbirthIdType,
  stillbirthIdTypeMessageDescriptors
)

/** ID number validator: alphanumeric, spaces not allowed, "/" and "-" allowed as separators. */
export const idNumberValidator = (fieldId: string) => ({
  message: {
    defaultMessage:
      'ID number can only contain letters, numbers and the separators "/" and "-"',
    description: 'This is the error message for an invalid ID number',
    id: 'event.stillbirth.error.invalidIdNumber'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[A-Za-z0-9/-]+$'
      }
    }
  })
})

export const StillbirthMaritalStatus = {
  MARRIED: 'MARRIED',
  SINGLE: 'SINGLE',
  DEFACTO: 'DEFACTO',
  DIVORCED: 'DIVORCED',
  WIDOWED: 'WIDOWED'
} as const

const stillbirthMaritalStatusMessageDescriptors = {
  MARRIED: {
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusMarried'
  },
  SINGLE: {
    defaultMessage: 'Single (never married)',
    description: 'Option for form field: Marital status single never married',
    id: 'form.field.label.maritalStatusSingleNeverMarried'
  },
  DEFACTO: {
    defaultMessage: 'Defacto',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusDefacto'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusDivorced'
  },
  WIDOWED: {
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusWidowed'
  }
} satisfies Record<keyof typeof StillbirthMaritalStatus, TranslationConfig>

export const stillbirthMaritalStatusOptions = createSelectOptions(
  StillbirthMaritalStatus,
  stillbirthMaritalStatusMessageDescriptors
)
