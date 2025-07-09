import { SEVEN_DAYS_IN_MILISECOND } from '@countryconfig/constants'
import {
  ActionStatus,
  ActionType,
  InherentFlags,
  defineWorkqueues,
  event,
  user
} from '@opencrvs/toolkit/events'

const DATE_OF_EVENT_COLUMN = {
  label: {
    id: 'workqueues.dateOfEvent',
    defaultMessage: 'Date of Event',
    description: 'Label for workqueue column: dateOfEvent'
  },
  value: event.field('dateOfEvent')
}

export const Workqueues = defineWorkqueues([
  {
    slug: 'in-progress',
    icon: 'Draft',
    name: {
      id: 'workqueues.inProgress.title',
      defaultMessage: 'In progress',
      description: 'Title of in progress workqueue'
    },
    query: {},
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
    query: {},
    actions: [
      {
        type: 'READ',
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
    query: {}
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
      assignedTo: { type: 'exact', term: user('id') }
    },
    actions: [
      {
        type: 'DEFAULT',
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
      updatedBy: { type: 'exact', term: user('id') },
      updatedAt: {
        type: 'range',
        gte: new Date(Date.now() - SEVEN_DAYS_IN_MILISECOND).toISOString(),
        lte: new Date(Date.now()).toISOString()
      }
    },
    actions: [
      {
        type: 'DEFAULT',
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
      flags: { anyOf: [InherentFlags.INCOMPLETE] }
      // @TODO: add this line back after notifications API has support for locations
      // https://github.com/opencrvs/opencrvs-core/issues/9829
      // updatedAtLocation: { type: 'exact', term: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'DEFAULT',
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
      status: { type: 'anyOf', terms: ['DECLARED', 'NOTIFIED'] },
      createdBy: { type: 'exact', term: user('id') }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Sent for review',
          description: 'This is the label for the workqueue column',
          id: 'workqueue.sent-for-review.column.sent-for-review'
        },
        value: event.field('updatedAt')
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
      status: { type: 'exact', term: 'DECLARED' },
      createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Sent for review',
          description: 'This is the label for the workqueue column',
          id: 'workqueue.in-review.column.sent-for-update'
        },
        value: event.field('updatedAt')
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
      type: 'or',
      clauses: [
        {
          status: {
            type: 'anyOf',
            terms: ['DECLARED', 'VALIDATED']
          },
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        },
        {
          flags: {
            anyOf: [InherentFlags.CORRECTION_REQUESTED]
          },
          createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
        }
      ]
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Sent for review',
          description: 'This is the label for the workqueue column',
          id: 'workqueue.in-review-all.column.sent-for-review'
        },
        value: event.field('updatedAt')
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
      flags: {
        anyOf: [InherentFlags.REJECTED]
      }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Sent for update',
          description: 'This is the label for the workqueue column',
          id: 'workqueue.sent-for-update.column.sent-for-update'
        },
        value: event.field('updatedAt')
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
      type: 'or',
      clauses: [
        {
          updatedBy: { type: 'exact', term: user('id') },
          status: { type: 'exact', term: 'VALIDATED' }
        },
        {
          flags: {
            anyOf: [InherentFlags.CORRECTION_REQUESTED]
          },
          updatedBy: { type: 'exact', term: user('id') }
        }
      ]
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Sent for approval',
          description: 'This is the label for the workqueue column',
          id: 'workqueue.sent-for-approval.column.sent-for-approval'
        },
        value: event.field('updatedAt')
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
      flags: {
        anyOf: [
          `${ActionType.REGISTER}:${ActionStatus.Requested}`.toLowerCase()
        ]
      },
      createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'DEFAULT',
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
      flags: {
        noneOf: [InherentFlags.PRINTED, InherentFlags.CORRECTION_REQUESTED]
      },
      status: { type: 'exact', term: 'REGISTERED' },
      createdAtLocation: { type: 'exact', term: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'PRINT_CERTIFICATE',
        conditionals: []
      }
    ],
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Registered',
          description: 'This is the label for the workqueue column',
          id: 'workqueue.ready-to-print.column.registered'
        },
        value: event.field('updatedAt')
      }
    ]
  }
])
