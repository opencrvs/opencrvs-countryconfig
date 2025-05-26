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

import { defineWorkqueue, event } from '@opencrvs/toolkit/events'

export const Workqueues = defineWorkqueue([
  {
    slug: 'in-progress',
    name: {
      id: 'workqueues.inProgress.title',
      defaultMessage: 'In progress',
      description: 'Title of in progress workqueue'
    },
    query: {
      type: 'or',
      clauses: []
    },
    actions: [
      {
        type: 'VALIDATE',
        conditionals: []
      }
    ]
  },
  {
    slug: 'correction-requested',
    name: {
      id: 'workqueues.correctionRequested.title',
      defaultMessage: 'Correction requested',
      description: 'Title of correction requested workqueue'
    },
    query: {
      type: 'or',
      clauses: []
    },
    actions: [
      {
        type: 'REVIEW_CORRECTION',
        conditionals: []
      }
    ]
  },
  {
    slug: 'waiting-for-attestation',
    name: {
      id: 'workqueues.waitingForAttestation.title',
      defaultMessage: 'Waiting for attestation',
      description: 'Title of waiting for attestation'
    },
    columns: [
      {
        label: {
          id: 'workqueues.waitingForAttestation.dateOfEvent',
          defaultMessage: 'Sent for your attestation',
          description:
            'Label for workqueue column: waitingForAttestation.dateOfEvent'
        },
        value: event.field('createdAt')
      },
      {
        label: {
          id: 'workqueues.eventStatus',
          defaultMessage: 'Status of the event',
          description: 'Label for workqueue column: eventStatus'
        },
        value: event.field('status')
      }
    ],
    actions: [],
    query: {
      type: 'or',
      clauses: []
    }
  }
])
