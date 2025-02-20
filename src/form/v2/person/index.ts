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

import { TranslationConfig } from '@opencrvs/toolkit/events'
import { createSelectOptions } from '../utils'

export const PersonType = {
  father: 'father',
  mother: 'mother',
  informant: 'informant',
  applicant: 'applicant'
} as const

export type PersonType = keyof typeof PersonType

export const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_REGISTRATION_NUMBER: 'BIRTH_REGISTRATION_NUMBER',
  NONE: 'NONE'
} as const

const MaritalStatus = {
  SINGLE: 'SINGLE',
  MARRIED: 'MARRIED',
  WIDOWED: 'WIDOWED',
  DIVORCED: 'DIVORCED',
  SEPARATED: 'SEPARATED',
  NOT_STATED: 'NOT_STATED'
} as const

const EducationalAttainment = {
  NO_SCHOOLING: 'NO_SCHOOLING',
  PRIMARY_ISCED_1: 'PRIMARY_ISCED_1',
  POST_SECONDARY_ISCED_4: 'POST_SECONDARY_ISCED_4',
  FIRST_STAGE_TERTIARY_ISCED_5: 'FIRST_STAGE_TERTIARY_ISCED_5'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypePassport'
  },
  BIRTH_REGISTRATION_NUMBER: {
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeBRN'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const maritalStatusMessageDescriptors = {
  SINGLE: {
    defaultMessage: 'Single',
    description: 'Option for form field: Marital status',
    id: 'v2.form.field.label.maritalStatusSingle'
  },
  MARRIED: {
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status',
    id: 'v2.form.field.label.maritalStatusMarried'
  },
  WIDOWED: {
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status',
    id: 'v2.form.field.label.maritalStatusWidowed'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status',
    id: 'v2.form.field.label.maritalStatusDivorced'
  },
  SEPARATED: {
    defaultMessage: 'Separated',
    description: 'Option for form field: Marital status',
    id: 'v2.form.field.label.maritalStatusSeparated'
  },
  NOT_STATED: {
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status',
    id: 'v2.form.field.label.maritalStatusNotStated'
  }
} satisfies Record<keyof typeof MaritalStatus, TranslationConfig>

const educationalAttainmentMessageDescriptors = {
  NO_SCHOOLING: {
    defaultMessage: 'No schooling',
    description: 'Option for form field: no education',
    id: 'v2.form.field.label.educationAttainmentNone'
  },
  PRIMARY_ISCED_1: {
    defaultMessage: 'Primary',
    description: 'Option for form field: ISCED1 education',
    id: 'v2.form.field.label.educationAttainmentISCED1'
  },
  POST_SECONDARY_ISCED_4: {
    defaultMessage: 'Secondary',
    description: 'Option for form field: ISCED4 education',
    id: 'v2.form.field.label.educationAttainmentISCED4'
  },
  FIRST_STAGE_TERTIARY_ISCED_5: {
    defaultMessage: 'Tertiary',
    description: 'Option for form field: ISCED5 education',
    id: 'v2.form.field.label.educationAttainmentISCED5'
  }
} satisfies Record<keyof typeof EducationalAttainment, TranslationConfig>

export const idTypeOptions = createSelectOptions(
  IdType,
  idTypeMessageDescriptors
)

export const maritalStatusOptions = createSelectOptions(
  MaritalStatus,
  maritalStatusMessageDescriptors
)
export const educationalAttainmentOptions = createSelectOptions(
  EducationalAttainment,
  educationalAttainmentMessageDescriptors
)

// @TODO: Consider whether these can become boolean fields
export const YesNoTypes = {
  YES: 'YES',
  NO: 'NO'
} as const

const yesNoMessageDescriptors = {
  YES: {
    defaultMessage: 'Yes',
    id: 'v2.form.field.label.Yes',
    description: 'Label for form field radio option Yes'
  },
  NO: {
    defaultMessage: 'No',
    id: 'v2.form.field.label.No',
    description: 'Label for form field radio option No'
  }
} satisfies Record<keyof typeof YesNoTypes, TranslationConfig>

export const yesNoRadioOptions = createSelectOptions(
  YesNoTypes,
  yesNoMessageDescriptors
)
