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

import { InformantType } from '@countryconfig/events/birth/forms/pages/informant'
import {
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  not,
  or
} from '@opencrvs/toolkit/events'

/**
 * Page 3a - ID Validation: Verify their identity
 * Display requester data for verification
 * Options: "Identity does not match" / "Verified"
 *
 * Page 3b - Proceed without proof of ID (modal)
 * Shows if "Identity does not match" is selected
 */

export const verifyIdentityFields: FieldConfig[] = [
  // Verify identity for Bride Groom
  {
    id: 'requester.identity.verify.data.brideGroom',
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
      id: 'form.field.label.identityDetails'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.bridegroomGivenNames' },
        { fieldId: 'marriageDetails.bridegroomDob' }
      ]
    }
  },
  // Verify identity for Bride
  {
    id: 'requester.identity.verify.data.bride',
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
      id: 'form.field.label.identityDetails'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.brideName' },
        { fieldId: 'marriageDetails.brideDob' }
      ]
    }
  },
  // Verify identity for Couple
  {
    id: 'requester.identity.verify.data.couple',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('COUPLE')
      }
    ],
    label: {
      defaultMessage: 'Identity details',
      description: 'Title for the data section',
      id: 'form.field.label.identityDetails'
    },
    configuration: {
      data: [
        { fieldId: 'marriageDetails.bridegroomGivenNames' },
        { fieldId: 'marriageDetails.bridegroomDob' },
        { fieldId: 'marriageDetails.brideName' },
        { fieldId: 'marriageDetails.brideDob' }
      ]
    }
  },
  // Verify identity for Marriage Officiant
  {
    id: 'requester.identity.verify.data.marriageOfficiant',
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
      id: 'form.field.label.identityDetails'
    },
    configuration: {
      data: [
        // { fieldId: 'marriageDetails.officiantFullName' },
        // { fieldId: 'marriageDetails.officiantAffiliation' }
      ]
    }
  },
  // Verify identity for Someone Else
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
      id: 'form.field.label.identityDetails'
    },
    configuration: {
      data: [
        // { fieldId: 'informantDetails.phoneNumber' },
        // { fieldId: 'informantDetails.email' }
      ]
    }
  }
]
