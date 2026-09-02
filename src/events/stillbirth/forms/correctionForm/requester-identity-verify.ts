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
import { FieldConfig, FieldType } from '@opencrvs/toolkit/events'

/** Confirms the "Someone else" requester's identity against the details just collected on the requester-details page. */
export const correctionRequesterIdentityVerify: FieldConfig[] = [
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
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
