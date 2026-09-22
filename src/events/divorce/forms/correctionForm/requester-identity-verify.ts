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
  ConditionalType,
  field,
  FieldConfig,
  FieldType
} from '@opencrvs/toolkit/events'

export const correctionRequesterIdentityVerify: FieldConfig[] = [
  {
    id: 'requester.identity.verify.data.husband',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('HUSBAND')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.bridegroomGivenNames' },
        { fieldId: 'marriageDetails.bridegroomDob' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data.wife',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('WIFE')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.brideName' },
        { fieldId: 'marriageDetails.brideDob' }
      ]
    }
  },
  {
    id: 'requester.identity.verify.data.registrar',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('REGISTRAR')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: []
    }
  },
  {
    id: 'requester.identity.verify.data.someoneElse',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        // { fieldId: 'requester.idType' },
        // { fieldId: 'requester.passport' },
        // { fieldId: 'requester.brn' },
        // { fieldId: 'requester.other' },
        // { fieldId: 'requester.name' },
        // { fieldId: 'requester.dob' },
        // { fieldId: 'requester.nationality' }
      ]
    }
  }
]
