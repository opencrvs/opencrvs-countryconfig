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
      field('child.dob').range(),
      field('child.firstname').fuzzy(),
      field('child.surname').fuzzy(),
      field('child.gender').exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Event details accordion',
      id: 'v2.advancedSearch.form.eventDetails'
    },
    fields: [field('child.birthLocation', { conditionals: [] }).exact()]
  },
  {
    title: {
      defaultMessage: 'Mother details',
      description: 'The title of Mother details accordion',
      id: 'v2.advancedSearch.form.motherDetails'
    },
    fields: [
      field('mother.dob').range(),
      field('mother.firstname').fuzzy(),
      field('mother.surname').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Father details',
      description: 'The title of Father details accordion',
      id: 'v2.advancedSearch.form.fatherDetails'
    },
    fields: [
      field('father.dob').range(),
      field('father.firstname').fuzzy(),
      field('father.surname').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Informant details',
      description: 'The title of Informant details accordion',
      id: 'v2.advancedSearch.form.informantDetails'
    },
    fields: [
      field('informant.dob', { conditionals: [] }).range(),
      field('informant.firstname', { conditionals: [] }).fuzzy(),
      field('informant.surname', { conditionals: [] }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
