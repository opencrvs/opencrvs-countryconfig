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

const childPrefix = {
  id: 'v2.birth.search.criteria.label.prefix.child',
  defaultMessage: "Child's",
  description: 'Child prefix'
}
const motherPrefix = {
  id: 'v2.birth.search.criteria.label.prefix.mother',
  defaultMessage: "Mother's",
  description: 'Mother prefix'
}
const fatherPrefix = {
  id: 'v2.birth.search.criteria.label.prefix.father',
  defaultMessage: "Father's",
  description: 'Father prefix'
}
const informantPrefix = {
  id: 'v2.birth.search.criteria.label.prefix.informant',
  defaultMessage: "Informant's",
  description: 'Informant prefix'
}
export const advancedSearchBirth = [
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
      defaultMessage: 'Child details',
      description: 'The title of Child details accordion',
      id: 'v2.advancedSearch.form.childDetails'
    },
    fields: [
      field('child.dob', {
        searchCriteriaLabelPrefix: childPrefix
      }).range(),
      field('child.firstname', {
        searchCriteriaLabelPrefix: childPrefix
      }).fuzzy(),
      field('child.surname', {
        searchCriteriaLabelPrefix: childPrefix
      }).fuzzy(),
      field('child.gender', {
        searchCriteriaLabelPrefix: childPrefix
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
      field('child.birthLocation', {
        conditionals: [],
        searchCriteriaLabelPrefix: childPrefix
      }).exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Mother details',
      description: 'The title of Mother details accordion',
      id: 'v2.advancedSearch.form.motherDetails'
    },
    fields: [
      field('mother.dob', {
        searchCriteriaLabelPrefix: motherPrefix
      }).range(),
      field('mother.firstname', {
        searchCriteriaLabelPrefix: motherPrefix
      }).fuzzy(),
      field('mother.surname', {
        searchCriteriaLabelPrefix: motherPrefix
      }).fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Father details',
      description: 'The title of Father details accordion',
      id: 'v2.advancedSearch.form.fatherDetails'
    },
    fields: [
      field('father.dob', {
        searchCriteriaLabelPrefix: fatherPrefix
      }).range(),
      field('father.firstname', {
        searchCriteriaLabelPrefix: fatherPrefix
      }).fuzzy(),
      field('father.surname', {
        searchCriteriaLabelPrefix: fatherPrefix
      }).fuzzy()
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
      field('informant.firstname', {
        conditionals: [],
        searchCriteriaLabelPrefix: informantPrefix
      }).fuzzy(),
      field('informant.surname', {
        conditionals: [],
        searchCriteriaLabelPrefix: informantPrefix
      }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
