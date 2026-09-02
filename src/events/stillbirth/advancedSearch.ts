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
  AdvancedSearchConfig,
  event,
  field,
  user
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'
import { PlaceOfDelivery, genderOptions } from './forms/pages/eventDetails'
import { TranslationConfig } from '@opencrvs/toolkit/events'

const placeOfDeliveryMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  PRIVATE_HOME: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  OTHER: {
    defaultMessage: 'Other address',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfDelivery, TranslationConfig>

const placeOfDeliveryOptions = createSelectOptions(
  PlaceOfDelivery,
  placeOfDeliveryMessageDescriptors
)

const fatherPrefix = {
  id: 'stillbirth.search.criteria.label.prefix.father',
  defaultMessage: "Father's",
  description: 'Father prefix'
}
const motherPrefix = {
  id: 'stillbirth.search.criteria.label.prefix.mother',
  defaultMessage: "Mother's",
  description: 'Mother prefix'
}
const informantPrefix = {
  id: 'stillbirth.search.criteria.label.prefix.informant',
  defaultMessage: "Informant's",
  description: 'Informant prefix'
}

export const advancedSearchStillbirth = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatuses.REGISTERED.registrationNumber').exact(),
      event('legalStatuses.REGISTERED.acceptedAt').range(),
      event('status').exact(),
      event('updatedAt').range()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Event details accordion',
      id: 'advancedSearch.form.eventDetails'
    },
    fields: [
      field('eventDetails.dateOfDelivery').range(),
      field('eventDetails.gestationalAgeWeeks').range(),
      field('eventDetails.sex', { options: genderOptions }).exact(),
      field('eventDetails.placeOfDelivery', {
        options: placeOfDeliveryOptions
      }).exact(),
      field('eventDetails.deliveryLocation', {
        allowedLocations: user.jurisdiction(
          user.scope('record.search').attribute('placeOfEvent')
        )
      }).exact()
    ]
  },
  {
    title: {
      defaultMessage: "Mother's details",
      description: "The title of Mother's details accordion",
      id: 'event.stillbirth.search.mother'
    },
    fields: [
      field('mother.name', { validations: [], conditionals: [] }).fuzzy(),
      field('mother.dob', { searchCriteriaLabelPrefix: motherPrefix }).range()
    ]
  },
  {
    title: {
      defaultMessage: "Father's details",
      description: "The title of Father's details accordion",
      id: 'event.stillbirth.search.father'
    },
    fields: [
      field('father.name', { validations: [], conditionals: [] }).fuzzy(),
      field('father.dob', { searchCriteriaLabelPrefix: fatherPrefix }).range()
    ]
  },
  {
    title: {
      defaultMessage: "Informant's details",
      description: "The title of Informant's details accordion",
      id: 'advancedSearch.form.informantDetails'
    },
    fields: [
      field('informant.name', { validations: [], conditionals: [] }).fuzzy(),
      field('informant.dob', {
        searchCriteriaLabelPrefix: informantPrefix
      }).range()
    ]
  }
] satisfies AdvancedSearchConfig[]
