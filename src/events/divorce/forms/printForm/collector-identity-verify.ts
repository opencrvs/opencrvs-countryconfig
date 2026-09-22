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
  or
} from '@opencrvs/toolkit/events'

export const printCertificateCollectorIdentityVerify: FieldConfig[] = [
  {
    id: 'collector.identity.verify.data.husband',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('HUSBAND')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.bridegroomGivenNames' },
        { fieldId: 'marriageDetails.bridegroomDob' }
      ]
    }
  },
  {
    id: 'collector.identity.verify.data.wife',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('WIFE')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.brideName' },
        { fieldId: 'marriageDetails.brideDob' }
      ]
    }
  },
  {
    id: 'collector.identity.verify.data.couple',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('COUPLE')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.bridegroomName' },
        { fieldId: 'marriageDetails.bridegroomDob' },
        { fieldId: 'marriageDetails.bridegroomPlaceOfBirth' },
        { fieldId: 'marriageDetails.brideName' },
        { fieldId: 'marriageDetails.brideDob' }
      ]
    }
  },
  {
    id: 'collector.identity.verify.data.marriageOfficiant',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(
          'MARRIAGE_OFFICIANT'
        )
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.officiantFullName' },
        { fieldId: 'marriageDetails.officiantAffiliation' }
      ]
    }
  },
  {
    id: 'collector.identity.verify.data.someoneElse',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'event.divorce.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        // { fieldId: 'informantDetails.phoneNumber' },
        // { fieldId: 'informantDetails.email' }
      ]
    }
  }
]
