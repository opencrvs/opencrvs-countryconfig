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

/**
 * Page 3a - ID Validation: Verify their identity
 * Display requester data for verification
 * Options: "Identity does not match" / "Verified"
 */

export const verifyIdentityFields: FieldConfig[] = [
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
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.adoption.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: []
    }
  }
]
