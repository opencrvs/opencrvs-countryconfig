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
import {
  tuvaluNameConfig,
  invalidNameValidator,
  nationalIdValidator
} from '../../validators'

const otherIdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER',
  NO_ID: 'NO_ID',
} as const

export const printCertificateCollectorOther: FieldConfig[] = [
  {
    id: 'collector.OTHER.relationshipToChild',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the relationship to child field',
      id: 'event.birth.action.form.section.relationshipToChild.label'
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
    configuration: tuvaluNameConfig,
    hideLabel: true,
    label: {
      defaultMessage: "Collector's name",
      description: 'This is the label for the name field of OTHER collector',
      id: 'event.birth.action.form.section.collector.other.field.name.label'
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
      id: 'event.birth.action.form.section.idType.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ],
    options: [
      {
        label: {
          id: 'event.birth.action.form.section.idType.passport.label',
          defaultMessage: 'Passport',
          description: 'Option for selecting Passport as the ID type'
        },
        value: otherIdType.PASSPORT
      },

      {
        label: {
          id: 'form.field.label.iDTypeBirthCertificate',
          defaultMessage: 'Birth certificate',
          description:
            'Option for selecting Birth Certificate as the ID type'
        },
        value: otherIdType.BIRTH_CERTIFICATE
      },
      {
        label: {
          id: 'event.birth.action.form.section.idType.other.label',
          defaultMessage: 'Other',
          description: 'Option for selecting Other as the ID type'
        },
        value: otherIdType.OTHER
      },
      {
        label: {
          id: 'event.birth.action.form.section.idType.noId.label',
          defaultMessage: 'None',
          description: 'Option for selecting No ID as the ID type'
        },
        value: otherIdType.NO_ID
      }
    ]
  },
  {
    id: 'collector.PASSPORT.details',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number',
      id: 'event.birth.action.form.section.idNumber.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
          field('collector.OTHER.idType').isEqualTo(otherIdType.PASSPORT)
        )
      }
    ]
  },
  {
    id: 'collector.brn',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number',
      id: 'event.birth.action.form.section.idNumber.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
          field('collector.OTHER.idType').isEqualTo(otherIdType.BIRTH_CERTIFICATE)
        )
      }
    ]
  },
  {
    id: 'collector.OTHER.idNumberOther',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number',
      id: 'event.birth.action.form.section.idNumber.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
          field('collector.OTHER.idType').isEqualTo(otherIdType.OTHER)
        )
      }
    ]
  }
]
