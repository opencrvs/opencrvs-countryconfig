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
import { defineConfig } from '@opencrvs/toolkit/events'
import { DEATH_DECLARATION_FORM } from './form/declaration'

export const deathEvent = defineConfig({
  id: 'Event.V2_DEATH',
  declaration: DEATH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Death',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.death.label'
  },
  //   dateOfEvent: field('child.dob').getId(),
  title: {
    defaultMessage: '{child.firstname} {child.surname}',
    description: 'This is the title of the summary',
    id: 'v2.event.death.title'
  },
  fallbackTitle: {
    id: 'v2.event.tennis-club-membership.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: []
  },
  actions: [],
  advancedSearch: []
})
