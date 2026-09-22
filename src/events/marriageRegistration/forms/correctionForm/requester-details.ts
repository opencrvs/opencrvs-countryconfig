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
  FieldType
} from '@opencrvs/toolkit/events'
import { IdType, idTypeOptions } from '@countryconfig/events/utils'
import { otherIdValidator, passportIdValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

/**
 * Page 2 - ID Validation (Requester's Details)
 * Show this page if Requester was "Someone Else"
 * Fields: B1 (Relationship), B2 (Given names), B3 (Surname), B4 (DOB), B5 (Nationality), B6 (Type of ID), B7 (ID number)
 */

export const requesterDetailsFields: FieldConfig[] = [
  // B1 - Relationship to child
  {
    id: 'requester.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'event.marriageRegistration.action.form.section.relationshipToCouple.label',
      defaultMessage: 'Relationship to couple',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  // B2 & B3 - Given name(s) and Surname (NAME field type handles both)
  {
    id: 'requester.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.name.label',
      defaultMessage: 'Name',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    configuration: {
      maxLength: MAX_NAME_LENGTH,
      name: {
        firstname: {
          required: true,
          label: {
            defaultMessage: 'Given name(s)',
            description: 'Label for form field: First names',
            id: 'form.field.label.firstNames'
          }
        },
        surname: {
          required: true,
          label: {
            defaultMessage: 'Surname',
            description: 'Label for family name text input',
            id: 'form.field.label.familyName'
          }
        }
      }
    }
  },
  // B4 - Date of birth (cannot be future date)
  {
    id: 'requester.dob',
    type: FieldType.DATE,
    required: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.dob.label',
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    validation: [
      {
        message: {
          defaultMessage: 'Date cannot be in the future',
          description: 'This is the error message for invalid date',
          id: 'event.marriageRegistration.action.correction.form.section.requester.dob.error'
        },
        validator: field('requester.dob').isBefore().now()
      }
    ]
  },
  // B5 - Nationality (default: Cook Islands)
  {
    id: 'requester.nationality',
    type: FieldType.COUNTRY,
    required: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.nationality.label',
      defaultMessage: 'Nationality',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    defaultValue: 'COK'
  },
  // B6 - Type of ID
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.idType.label'
    },
    options: idTypeOptions,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  // B7 - ID number (Passport)
  {
    id: 'requester.passport',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.passport.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.PASSPORT)
        )
      }
    ],
    validation: [passportIdValidator('requester.passport')]
  },
  // B7 - ID number (Birth Certificate)
  {
    id: 'requester.brn',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.BIRTH_CERTIFICATE)
        )
      }
    ],
    validation: [otherIdValidator('requester.brn')]
  },
  // B7 - ID number (Other)
  {
    id: 'requester.other',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.OTHER)
        )
      }
    ],
    validation: [otherIdValidator('requester.other')]
  }
]
