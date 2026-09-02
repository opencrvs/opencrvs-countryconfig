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
import {
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  not,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

const RequesterIdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER',
  NONE: 'NONE'
} as const

const requesterIdTypeMessageDescriptors = {
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
} satisfies Record<keyof typeof RequesterIdType, TranslationConfig>

const requesterIdTypeOptions = createSelectOptions(
  RequesterIdType,
  requesterIdTypeMessageDescriptors
)

const isSomeoneElse = field('requester.type').isEqualTo('SOMEONE_ELSE')

export const requesterDetailsFields: FieldConfig[] = [
  {
    id: 'requester.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'event.stillbirth.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the field'
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: isSomeoneElse }]
  },
  {
    id: 'requester.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    configuration: tuvaluNameConfig,
    label: {
      id: 'event.stillbirth.action.correction.form.section.requester.name.label',
      defaultMessage: 'Name',
      description: 'This is the label for the field'
    },
    validation: [invalidNameValidator('requester.name')],
    conditionals: [{ type: ConditionalType.SHOW, conditional: isSomeoneElse }]
  },
  {
    id: 'requester.dob',
    type: FieldType.DATE,
    required: true,
    label: {
      id: 'event.stillbirth.action.correction.form.section.requester.dob.label',
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field'
    },
    validation: [
      {
        message: {
          defaultMessage: 'Date cannot be in the future',
          description: 'This is the error message for invalid date',
          id: 'event.stillbirth.action.correction.form.section.requester.dob.error'
        },
        validator: field('requester.dob').isBefore().now()
      }
    ],
    conditionals: [{ type: ConditionalType.SHOW, conditional: isSomeoneElse }]
  },
  {
    id: 'requester.nationality',
    type: FieldType.COUNTRY,
    required: true,
    label: {
      id: 'event.stillbirth.action.correction.form.section.requester.nationality.label',
      defaultMessage: 'Nationality',
      description: 'This is the label for the field'
    },
    defaultValue: 'TUV',
    conditionals: [{ type: ConditionalType.SHOW, conditional: isSomeoneElse }]
  },
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: 'event.stillbirth.action.correction.form.section.requester.idType.label'
    },
    options: requesterIdTypeOptions,
    conditionals: [{ type: ConditionalType.SHOW, conditional: isSomeoneElse }]
  },
  {
    id: 'requester.idNumber',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID number',
      description: 'This is the label for the field',
      id: 'event.stillbirth.action.correction.form.section.requester.idNumber.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isSomeoneElse,
          not(field('requester.idType').isEqualTo(RequesterIdType.NONE)),
          not(field('requester.idType').isFalsy())
        )
      }
    ]
  }
]
