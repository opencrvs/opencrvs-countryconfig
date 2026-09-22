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

const bridePrefix = {
  id: 'marriageRegistration.search.criteria.label.prefix.bride',
  defaultMessage: "Bride's",
  description: 'Bride prefix'
}

const bridegroomPrefix = {
  id: 'marriageRegistration.search.criteria.label.prefix.bridegroom',
  defaultMessage: "Bridegroom's",
  description: 'Bridegroom prefix'
}

export const advancedSearchMarriageRegistration = [
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
      description: 'The title of Marriage details accordion',
      id: 'advancedSearch.form.eventDetails'
    },
    fields: [
      field('marriageDetails.dateOfMarriage').range(),
      field('marriageDetails.address').fuzzy(),
      field('marriageDetails.venueName').fuzzy(),
      field('marriageDetails.officiantFullName').fuzzy(),
      field('marriageDetails.officiantAffiliation').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Bridegroom details',
      description: 'The title of Bridegroom details accordion',
      id: 'advancedSearch.form.bridegroomDetails'
    },
    fields: [
      field('marriageDetails.bridegroomDob', {
        searchCriteriaLabelPrefix: bridegroomPrefix
      }).range(),
      field('marriageDetails.bridegroomName', {
        validations: [],
        conditionals: []
      }).fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Bride details',
      description: 'The title of Bride details accordion',
      id: 'advancedSearch.form.brideDetails'
    },
    fields: [
      field('marriageDetails.brideDob', {
        searchCriteriaLabelPrefix: bridePrefix
      }).range(),
      field('marriageDetails.brideName', {
        validations: [],
        conditionals: []
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
