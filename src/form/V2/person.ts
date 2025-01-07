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

import { FieldConfig, SelectOption } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'

const idTypeOptions: SelectOption[] = [
  {
    value: 'NATIONAL_ID' as const,
    label: {
      defaultMessage: 'National ID',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeNationalID'
    }
  },
  {
    value: 'PASSPORT' as const,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypePassport'
    }
  },
  {
    value: 'BIRTH_REGISTRATION_NUMBER' as const,
    label: {
      defaultMessage: 'Birth Registration Number',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeBRN'
    }
  },
  {
    value: 'NONE' as const,
    label: {
      defaultMessage: 'None',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeNone'
    }
  }
]

export const concatFields = (fields: string[]) => {
  return fields.join('____')
}

export const getPersonInputFields = (person: string): FieldConfig[] => [
  {
    id: `${person}.firstname`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'First name',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.firstname.label`
    },
    conditionals: []
  },
  {
    id: `${person}.surname`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'Surname',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.surname.label`
    },
    conditionals: []
  },
  {
    id: `${person}.dob`,
    type: 'DATE',
    required: true,
    validation: [
      {
        message: {
          defaultMessage: 'Please enter a valid date',
          description: 'This is the error message for invalid date',
          id: `event.birth.action.declare.form.section.${person}.field.dob.error`
        },
        validator: field(concatFields([person, 'dob'])).isBeforeNow()
      }
    ],
    label: {
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.dob.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(concatFields([person, 'dobUnknown'])).isEqualTo(
          'true'
        )
      }
    ]
  },
  {
    id: `${person}.dobUnknown`,
    type: 'CHECKBOX',
    required: true,
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.age.label`
    },
    conditionals: []
  },
  {
    id: `${person}.age`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: `Age of ${person}`,
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.age.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(concatFields([person, 'dobUnknown'])).isEqualTo(
          'false'
        )
      }
    ]
  },
  {
    id: `${person}.idType`,
    type: 'SELECT',
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.idType.label`
    },
    options: idTypeOptions,
    conditionals: []
  }
]
