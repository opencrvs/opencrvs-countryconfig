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

import { defineWorkqueues, event, user } from '@opencrvs/toolkit/events'

export const Workqueues = defineWorkqueues([
  {
    slug: 'in-progress',
    icon: 'Draft',
    name: {
      id: 'workqueues.inProgress.title',
      defaultMessage: 'In progress',
      description: 'Title of in progress workqueue'
    },
    query: {
      type: 'and',
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
    icon: 'FileSearch',
    name: {
      id: 'workqueues.correctionRequested.title',
      defaultMessage: 'Correction requested',
      description: 'Title of correction requested workqueue'
    },
    query: {
      type: 'and',
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
    icon: 'FileSearch',
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
      type: 'and',
      clauses: []
    }
  },

  {
    slug: 'assigned-to-you',
    icon: 'PushPin',
    name: {
      id: 'workqueues.assignedToYou.title',
      defaultMessage: 'Assigned to you',
      description: 'Title of assigned to you workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          assignedTo: { type: 'exact', term: user('id') }
        }
      ]
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
    icon: 'Timer',
    name: {
      id: 'workqueues.recent.title',
      defaultMessage: 'Recent',
      description: 'Title of recent workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          updatedBy: { type: 'exact', term: user('id') },
          updatedAt: {
            type: 'range',
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            lte: new Date(Date.now()).toISOString()
          }
        }
      ]
    },
    actions: [
      {
        type: 'REVIEW',
        conditionals: []
      }
    ]
  },
  {
    slug: 'requires-completion',
    icon: 'File',
    name: {
      id: 'workqueues.notifications.title',
      defaultMessage: 'Notifications',
      description: 'Title of notifications workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          status: { type: 'exact', term: 'NOTIFIED' }
        }
      ]
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
    icon: 'FileSearch',
    name: {
      id: 'workqueues.sentForReview.title',
      defaultMessage: 'Sent for review',
      description: 'Title of sent for review workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          status: { type: 'anyOf', terms: ['DECLARED'] },
          createdBy: { type: 'exact', term: user('id') }
        }
      ]
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
    icon: 'FileSearch',
    name: {
      id: 'workqueues.inReview.title',
      defaultMessage: 'Ready for review',
      description: 'Title of ready for review workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          status: { type: 'anyOf', terms: ['DECLARED'] },
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
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
    icon: 'FileSearch',
    name: {
      id: 'workqueues.inReviewAll.title',
      defaultMessage: 'Ready for review',
      description: 'Title of ready for review (all) workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          status: { type: 'anyOf', terms: ['DECLARED'] },
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
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
    icon: 'FileMinus',
    name: {
      id: 'workqueues.requiresUpdates.title',
      defaultMessage: 'Requires updates',
      description: 'Title of requires updates workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
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
    icon: 'FileText',
    name: {
      id: 'workqueues.sentForApproval.title',
      defaultMessage: 'Sent for approval',
      description: 'Title of sent for approval workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          createdBy: { type: 'exact', term: user('id') }
        }
      ]
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
    icon: 'FileText',
    name: {
      id: 'workqueues.inExternalValidation.title',
      defaultMessage: 'In external validation',
      description: 'Title of in external validation workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
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
    icon: 'Printer',
    name: {
      id: 'workqueues.readyToPrint.title',
      defaultMessage: 'Ready to print',
      description: 'Title of ready to print workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
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
    icon: 'Handshake',
    name: {
      id: 'workqueues.readyToIssue.title',
      defaultMessage: 'Ready to issue',
      description: 'Title of ready to issue workqueue'
    },
    query: {
      type: 'and',
      clauses: [
        {
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
    },
    actions: [
      {
        type: 'ISSUE',
        conditionals: []
      }
    ]
  }
])
