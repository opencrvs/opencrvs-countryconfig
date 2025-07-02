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
  statusOptions,
  timePeriodOptions
} from '@countryconfig/form/EventMetadataSearchOptions'
import { AdvancedSearchConfig, event, field } from '@opencrvs/toolkit/events'
const deceasedPrefix = {
  id: 'v2.death.search.criteria.label.prefix.deceased',
  defaultMessage: "Deceased's",
  description: 'Deceased prefix'
}
const informantPrefix = {
  id: 'v2.death.search.criteria.label.prefix.informant',
  defaultMessage: "Informant's",
  description: 'Informant prefix'
}
export const advancedSearchDeath = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'v2.advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatus.REGISTERED.createdAtLocation').exact(),
      event('legalStatus.REGISTERED.createdAt').range(),
      event('status', statusOptions).exact(),
      event('updatedAt', timePeriodOptions).range()
    ]
  },
  {
    title: {
      defaultMessage: 'Deceased details',
      description: 'The title of Deceased details accordion',
      id: 'v2.advancedSearch.form.deceasedDetails'
    },
    fields: [
      field('deceased.dob', {
        searchCriteriaLabelPrefix: deceasedPrefix
      }).range(),
      field('deceased.name', {
        validations: [],
        conditionals: []
      }).fuzzy(),
      field('deceased.gender', {
        searchCriteriaLabelPrefix: deceasedPrefix
      }).exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Event details accordion',
      id: 'v2.advancedSearch.form.eventDetails'
    },
    fields: [
      field('eventDetails.deathLocation', {
        conditionals: [],
        searchCriteriaLabelPrefix: deceasedPrefix
      }).exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Informant details',
      description: 'The title of Informant details accordion',
      id: 'v2.advancedSearch.form.informantDetails'
    },
    fields: [
      field('informant.dob', {
        conditionals: [],
        searchCriteriaLabelPrefix: informantPrefix
      }).range(),
      field('informant.name', {
        conditionals: [],
        validations: []
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
