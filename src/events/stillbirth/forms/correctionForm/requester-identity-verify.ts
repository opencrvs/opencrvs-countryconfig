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
  or
} from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

const isRecordSubject = field('requester.type').isEqualTo('RECORD_SUBJECT')

/** Confirms the requester's identity against details already held on the record, or (for "Someone else") the details just collected on the requester-details page. */
export const correctionRequesterIdentityVerify: FieldConfig[] = [
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('requester.type').isEqualTo('MOTHER'),
          and(
            isRecordSubject,
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.stillbirth.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'mother.idType' },
        { fieldId: 'mother.idNumber' },
        { fieldId: 'mother.brn' },
        { fieldId: 'mother.passport' },
        { fieldId: 'mother.name' },
        { fieldId: 'mother.dob' },
        { fieldId: 'mother.nationality' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('requester.type').isEqualTo('FATHER'),
          and(
            isRecordSubject,
            field('informant.relation').isEqualTo(InformantType.FATHER)
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.stillbirth.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'father.idType' },
        { fieldId: 'father.idNumber' },
        { fieldId: 'father.name' },
        { fieldId: 'father.dob' },
        { fieldId: 'father.nationality' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isRecordSubject,
          field('informant.relation').isEqualTo(InformantType.OTHER)
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.stillbirth.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'informant.idType' },
        { fieldId: 'informant.idNumber' },
        { fieldId: 'informant.name' },
        { fieldId: 'informant.dob' },
        { fieldId: 'informant.nationality' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.stillbirth.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'requester.idType' },
        { fieldId: 'requester.idNumber' },
        { fieldId: 'requester.name' },
        { fieldId: 'requester.dob' },
        { fieldId: 'requester.nationality' }
      ]
    }
  }
]
