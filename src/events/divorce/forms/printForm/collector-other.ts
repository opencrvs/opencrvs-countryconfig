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
import {
  invalidNameValidator,
  nationalIdValidator
} from '@countryconfig/events/marriageRegistration/validators'
import {
  otherIdValidator,
  passportIdValidator
} from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const printCertificateCollectorOther: FieldConfig[] = [
  {
    id: 'collector.OTHER.relationshipToCouple',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Relationship to divorcing party',
      description:
        'This is the label for the relationship to divorcing party field',
      id: 'event.divorce.action.form.section.divorcingParty.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'collector.OTHER.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
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
    },

    label: {
      defaultMessage: "Collector's name",
      description: 'This is the label for the name field of OTHER collector',
      id: 'event.divorce.action.form.section.collector.other.field.name.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ],
    validation: [invalidNameValidator('collector.OTHER.name')]
  },
  {
    id: 'collector.OTHER.dob',
    type: FieldType.DATE,
    required: true,
    validation: [
      {
        message: {
          defaultMessage: 'Date cannot be in the future',
          description: 'This is the error message for invalid date',
          id: 'validations.noFutureDate'
        },
        validator: field('collector.OTHER.dob').isBefore().now()
      }
    ],
    label: {
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field',
      id: 'verifyCertificate.dateOfBirth'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'collector.OTHER.nationality',
    type: FieldType.COUNTRY,
    required: true,
    secured: false,
    label: {
      defaultMessage: 'Nationality',
      description: 'This is the label for the field',
      id: 'form.field.label.nationality'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ],
    defaultValue: 'COK'
  },
  {
    id: 'collector.OTHER.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for selecting the type of ID',
      id: 'event.divorce.action.form.section.idType.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ],
    options: idTypeOptions
  },
  {
    id: 'collector.PASSPORT.details',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID number',
      description: 'Field for entering Passport details',
      id: 'form.field.label.idNumber'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
          field('collector.OTHER.idType').isEqualTo(IdType.PASSPORT)
        )
      }
    ],
    validation: [passportIdValidator('collector.PASSPORT.details')]
  },
  {
    id: 'collector.brn',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID number',
      description: 'Field for entering Birth Registration Number',
      id: 'form.field.label.idNumber'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
          field('collector.OTHER.idType').isEqualTo(IdType.BIRTH_CERTIFICATE)
        )
      }
    ],
    validation: [otherIdValidator('collector.brn')]
  },
  {
    id: 'collector.OTHER.idNumberOther',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number if "Other" is selected',
      id: 'form.field.label.idNumber'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
          field('collector.OTHER.idType').isEqualTo(IdType.OTHER)
        )
      }
    ],
    validation: [otherIdValidator('collector.OTHER.idNumberOther')]
  }
]
