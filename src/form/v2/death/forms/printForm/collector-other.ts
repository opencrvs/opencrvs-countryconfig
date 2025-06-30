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
import { nationalIdValidator } from '../../../birth/validators'

export const CollectorType = {
  SOMEONE_ELSE: 'SOMEONE_ELSE'
} as const

const otherIdType = {
  PASSPORT: 'PASSPORT',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  REFUGEE_NUMBER: 'REFUGEE_NUMBER',
  ALIEN_NUMBER: 'ALIEN_NUMBER',
  OTHER: 'OTHER',
  NO_ID: 'NO_ID',
  NATIONAL_ID: 'NATIONAL_ID',
  BIRTH_REGISTRATION_NUMBER: 'BIRTH_REGISTRATION_NUMBER'
} as const

export const printCertificateCollectorOther: FieldConfig[] = [
  {
    id: 'collector.OTHER.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for selecting the type of ID',
      id: 'v2.event.death.action.form.section.idType.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(
          CollectorType.SOMEONE_ELSE
        )
      }
    ],
    options: [
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.passport.label',
          defaultMessage: 'Passport',
          description: 'Option for selecting Passport as the ID type'
        },
        value: otherIdType.PASSPORT
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.nid.label',
          defaultMessage: 'National ID',
          description: 'Option for selecting National ID as the ID type'
        },
        value: otherIdType.NATIONAL_ID
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.drivingLicense.label',
          defaultMessage: 'Drivers License',
          description: 'Option for selecting Driving License as the ID type'
        },
        value: otherIdType.DRIVING_LICENSE
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.brn.label',
          defaultMessage: 'Birth Registration Number',
          description:
            'Option for selecting Birth Registration Number as the ID type'
        },
        value: otherIdType.BIRTH_REGISTRATION_NUMBER
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.refugeeNumber.label',
          defaultMessage: 'Refugee Number',
          description: 'Option for selecting Refugee Number as the ID type'
        },
        value: otherIdType.REFUGEE_NUMBER
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.alienNumber.label',
          defaultMessage: 'Alien Number',
          description: 'Option for selecting Alien Number as the ID type'
        },
        value: otherIdType.ALIEN_NUMBER
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.other.label',
          defaultMessage: 'Other',
          description: 'Option for selecting Other as the ID type'
        },
        value: otherIdType.OTHER
      },
      {
        label: {
          id: 'v2.event.death.action.form.section.idType.noId.label',
          defaultMessage: 'No ID available',
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
      defaultMessage: 'Passport',
      description: 'Field for entering Passport details',
      id: 'v2.event.death.action.form.section.passportDetails.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.PASSPORT)
        )
      }
    ]
  },
  {
    id: 'collector.nid',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'National ID',
      description: 'Field for entering ID Number',
      id: 'v2.event.death.action.form.section.nid.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.NATIONAL_ID)
        )
      }
    ],
    validation: [nationalIdValidator('collector.nid')]
  },
  {
    id: 'collector.DRIVING_LICENSE.details',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Drivers License',
      description: 'Field for entering Driving License details',
      id: 'v2.event.death.action.form.section.drivingLicenseDetails.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.DRIVING_LICENSE)
        )
      }
    ]
  },
  {
    id: 'collector.brn',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Birth Registration Number',
      description: 'Field for entering Birth Registration Number',
      id: 'v2.event.death.action.form.section.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(
            otherIdType.BIRTH_REGISTRATION_NUMBER
          )
        )
      }
    ]
  },
  {
    id: 'collector.REFUGEE_NUMBER.details',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Refugee Number',
      description: 'Field for entering Refugee Number details',
      id: 'v2.event.death.action.form.section.refugeeNumberDetails.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.REFUGEE_NUMBER)
        )
      }
    ]
  },
  {
    id: 'collector.ALIEN_NUMBER.details',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Alien Number',
      description: 'Field for entering Alien Number details',
      id: 'v2.event.death.action.form.section.alienNumberDetails.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.ALIEN_NUMBER)
        )
      }
    ]
  },
  {
    id: 'collector.OTHER.idTypeOther',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Other type of ID',
      description: 'Field for entering ID type if "Other" is selected',
      id: 'v2.event.death.action.form.section.idTypeOther.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.OTHER)
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
      description: 'Field for entering ID Number if "Other" is selected',
      id: 'v2.event.death.action.form.section.idNumberOther.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE),
          field('collector.OTHER.idType').isEqualTo(otherIdType.OTHER)
        )
      }
    ]
  },
  {
    id: 'collector.OTHER.firstName',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'First Name',
      description: 'This is the label for the first name field',
      id: 'v2.event.death.action.form.section.firstName.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(
          CollectorType.SOMEONE_ELSE
        )
      }
    ]
  },
  {
    id: 'collector.OTHER.lastName',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Last Name',
      description: 'This is the label for the last name field',
      id: 'v2.event.death.action.form.section.lastName.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(
          CollectorType.SOMEONE_ELSE
        )
      }
    ]
  },
  {
    id: 'collector.OTHER.relationshipToChild',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the relationship to child field',
      id: 'v2.event.death.action.form.section.relationshipToChild.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(
          CollectorType.SOMEONE_ELSE
        )
      }
    ]
  },
  {
    id: 'collector.OTHER.signedAffidavit',
    type: FieldType.FILE,
    required: false,
    label: {
      defaultMessage: 'Signed Affidavit (Optional)',
      description: 'This is the label for uploading a signed affidavit',
      id: 'v2.event.death.action.form.section.signedAffidavit.label'
    },
    configuration: {
      maxFileSize: 5 * 1024 * 1024, // 5 MB
      acceptedFileTypes: ['image/png', 'image/jpg', 'image/jpeg'],
      fileName: {
        defaultMessage: 'Signed Affidavit',
        description: 'This is the label for the file name',
        id: 'v2.event.death.action.form.section.signedAffidavit.fileName'
      }
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(
          CollectorType.SOMEONE_ELSE
        )
      }
    ]
  }
]
