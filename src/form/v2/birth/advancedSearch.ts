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

import { EventConfig } from '@opencrvs/toolkit/events'

type AdvancedSearch = EventConfig['advancedSearch']

export const advancedSearchBirth = [
  {
    id: 'BIRTHS',
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'v2.advancedSearch.form.registrationDetails'
    },
    fields: [
      {
        fieldId: 'child.dob'
      }
    ]
  },
  {
    id: 'NO',
    title: {
      defaultMessage: 'Child details',
      description: 'The title of Child details accordion',
      id: 'v2.advancedSearch.form.childDetails'
    },
    fields: [
      {
        fieldId: 'child.gender'
      }
    ]
  }
] satisfies AdvancedSearch
