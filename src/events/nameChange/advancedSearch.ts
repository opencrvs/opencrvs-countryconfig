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

const personPrefix = {
  id: 'nameChange.search.criteria.label.prefix.person',
  defaultMessage: "Person's",
  description: 'Person prefix'
}

export const advancedSearchNameChange = [
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
      defaultMessage: "Person's details",
      description: "The title of Person's details accordion",
      id: 'advancedSearch.form.personDetails'
    },
    fields: [
      field('subjects.brn', {
        validations: [],
        conditionals: [],
        searchCriteriaLabelPrefix: personPrefix
      }).exact(),
      field('subjects.dob', {
        searchCriteriaLabelPrefix: personPrefix
      }).range(),
      field('subjects.name', {
        validations: [],
        conditionals: [],
        searchCriteriaLabelPrefix: personPrefix
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
