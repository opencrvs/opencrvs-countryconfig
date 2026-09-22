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

import { AdvancedSearchConfig, event, field } from '@opencrvs/toolkit/events'

const wifePrefix = {
  id: 'divorce.search.criteria.label.prefix.wife',
  defaultMessage: "Wife's",
  description: 'Wife prefix'
}

const husbandPrefix = {
  id: 'divorce.search.criteria.label.prefix.husband',
  defaultMessage: "Husband's",
  description: 'Husband prefix'
}

export const advancedSearchDivorce = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.createdAtLocation').within(),
      event('legalStatuses.REGISTERED.acceptedAt').range(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Divorce event details accordion',
      id: 'advancedSearch.form.eventDetails'
    },
    fields: [
      field('divorceOrderDetails.orderNumber').fuzzy(),
      field('marriageDetails.marriageRegistrationNumber').fuzzy(),
      field('marriageDetails.dateOfMarriage').range(),
      field('marriageDetails.placeOfMarriage').fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
