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
      status: { type: 'exact', term: 'IN_PROGRESS' }
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
      status: { type: 'exact', term: 'DECLARED' }
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
      status: { type: 'exact', term: 'WAITING_FOR_ATTESTATION' }
    }
  },

  {
    slug: 'assigned-to-you',
    name: {
      id: 'workqueues.assignedToYou.title',
      defaultMessage: 'Assigned to you',
      description: 'Title of assigned to you workqueue'
    },
    query: {
      status: { type: 'exact', term: 'ASSIGNED_TO_YOU' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'recent',
    name: {
      id: 'workqueues.recent.title',
      defaultMessage: 'Recent',
      description: 'Title of recent workqueue'
    },
    query: {
      status: { type: 'exact', term: 'RECENT' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'notifications',
    name: {
      id: 'workqueues.notifications.title',
      defaultMessage: 'Notifications',
      description: 'Title of notifications workqueue'
    },
    query: {
      status: { type: 'exact', term: 'REQUIRES_COMPLETION' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'sent-for-review',
    name: {
      id: 'workqueues.sentForReview.title',
      defaultMessage: 'Sent for review',
      description: 'Title of sent for review workqueue'
    },
    query: {
      status: { type: 'exact', term: 'SENT_FOR_REVIEW' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'in-review',
    name: {
      id: 'workqueues.inReview.title',
      defaultMessage: 'Ready for review',
      description: 'Title of ready for review workqueue'
    },
    query: {
      status: { type: 'exact', term: 'IN_REVIEW' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'in-review-all',
    name: {
      id: 'workqueues.inReviewAll.title',
      defaultMessage: 'Ready for review',
      description: 'Title of ready for review (all) workqueue'
    },
    query: {
      status: { type: 'exact', term: 'IN_REVIEW_ALL' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'requires-updates',
    name: {
      id: 'workqueues.requiresUpdates.title',
      defaultMessage: 'Requires updates',
      description: 'Title of requires updates workqueue'
    },
    query: {
      status: { type: 'exact', term: 'REQUIRES_UPDATES' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'sent-for-approval',
    name: {
      id: 'workqueues.sentForApproval.title',
      defaultMessage: 'Sent for approval',
      description: 'Title of sent for approval workqueue'
    },
    query: {
      status: { type: 'exact', term: 'SENT_FOR_APPROVAL' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'in-external-validation',
    name: {
      id: 'workqueues.inExternalValidation.title',
      defaultMessage: 'In external validation',
      description: 'Title of in external validation workqueue'
    },
    query: {
      status: { type: 'exact', term: 'IN_EXTERNAL_VALIDATION' }
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'ready-to-print',
    name: {
      id: 'workqueues.readyToPrint.title',
      defaultMessage: 'Ready to print',
      description: 'Title of ready to print workqueue'
    },
    query: {
      status: { type: 'exact', term: 'READY_TO_PRINT' }
    },
    actions: [
      {
        type: 'PRINT',
        conditionals: []
      }
    ]
  },
  {
    slug: 'ready-to-issue',
    name: {
      id: 'workqueues.readyToIssue.title',
      defaultMessage: 'Ready to issue',
      description: 'Title of ready to issue workqueue'
    },
    query: {
      status: { type: 'exact', term: 'READY_TO_ISSUE' }
    },
    actions: [
      {
        type: 'ISSUE',
        conditionals: []
      }
    ]
  }
])
