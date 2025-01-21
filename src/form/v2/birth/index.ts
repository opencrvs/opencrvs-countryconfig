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
import {
  defineConditional,
  eventHasAction,
  not
} from '@opencrvs/toolkit/conditionals'
import { BIRTH_DECLARE_FORM } from './forms/declare'

export const birthEvent = defineConfig({
  id: 'BIRTH',
  label: {
    defaultMessage: 'Birth declaration',
    description: 'This is what this event is referred as in the system',
    id: 'event.birth.label'
  },
  summary: {
    title: {
      defaultMessage: '{applicant.firstname} {applicant.surname}',
      description: 'This is the title of the summary',
      id: 'event.birth.summary.title'
    },
    fields: []
  },
  workqueues: [
    {
      id: 'all',
      title: {
        defaultMessage: 'All birth events',
        description: 'Label for all birth events workqueue',
        id: 'event.birth.workqueue.all.label'
      },
      fields: [
        {
          id: 'child.firstname'
        },
        {
          id: 'child.surname'
        }
      ],
      filters: []
    }
  ],
  actions: [
    {
      type: 'DECLARE',
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.declare.label'
      },
      forms: [BIRTH_DECLARE_FORM],
      allowedWhen: defineConditional(not(eventHasAction('DECLARE')))
    }
  ]
})
