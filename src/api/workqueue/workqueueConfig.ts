import {
  ActionStatus,
  ActionType,
  EventStatus,
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
        type: 'timePeriod',
        term: 'last7Days'
      }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    emptyMessage: {
      id: 'workqueues.recent.emptyMessage',
      defaultMessage: 'No recent records',
      description: 'Empty message for recent workqueue'
    }
  },
  {
    slug: 'requires-completion',
    icon: 'FileDotted',
    name: {
      id: 'workqueues.notifications.title',
      defaultMessage: 'Notifications',
      description: 'Title of notifications workqueue'
    },
    query: {
      flags: {
        anyOf: [InherentFlags.INCOMPLETE],
        noneOf: [InherentFlags.REJECTED]
      },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ],
    emptyMessage: {
      id: 'workqueues.notifications.emptyMessage',
      defaultMessage: 'No notifications',
      description: 'Empty message for notifications workqueue'
    }
  },
  {
    slug: 'pending-validation',
    icon: 'Stamp',
    name: {
      id: 'workqueues.pendingValidation.title',
      defaultMessage: 'Pending validation',
      description: 'Title of pending validation workqueue'
    },
    query: {
      status: { type: 'exact', term: EventStatus.enum.DECLARED },
      flags: { noneOf: ['validated', InherentFlags.REJECTED] }
    },
    actions: [{ type: 'DEFAULT', conditionals: [] }]
  },

  {
    slug: 'potential-duplicate',
    icon: 'Files',
    name: {
      id: 'workqueues.potentialDuplicate.title',
      defaultMessage: 'Potential duplicate',
      description: 'Title of potential duplicate workqueue'
    },
    query: {
      flags: { anyOf: [InherentFlags.POTENTIAL_DUPLICATE] }
    },
    actions: []
  },
  {
    slug: 'pending-updates',
    icon: 'FileX',
    name: {
      id: 'workqueues.pendingUpdates.title',
      defaultMessage: 'Pending updates',
      description: 'Title of pending updates workqueue'
    },
    query: { flags: { anyOf: [InherentFlags.REJECTED] } },
    actions: []
  },
  {
    slug: 'pending-approval',
    icon: 'Stamp',
    name: {
      id: 'workqueues.requiresApproval.title',
      defaultMessage: 'Pending approval',
      description: 'Title of Pending approval workqueue'
    },
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          defaultMessage: 'Approval requested',
          description:
            'This is the label for the pending approval workqueue column',
          id: 'workqueue.late-registration-approval.column.approval-requested'
        },
        value: event.field('updatedAt')
      }
    ],
    query: {
      flags: {
        anyOf: ['approval-required-for-late-registration']
      },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ]
  },
  {
    slug: 'pending-registration',
    icon: 'Pencil',
    name: {
      id: 'workqueues.pendingRegistration.title',
      defaultMessage: 'Pending registration',
      description: 'Title of pending registration workqueue'
    },
    query: {
      flags: {
        anyOf: ['validated'],
        noneOf: ['approval-required-for-late-registration']
      }
    },
    actions: []
  },
  {
    slug: 'registration-registrar-general',
    icon: 'Pencil',
    name: {
      id: 'workqueues.pendingRegistration.title',
      defaultMessage: 'Pending registration',
      description: 'Title of pending registration workqueue'
    },
    query: { status: { type: 'exact', term: EventStatus.enum.DECLARED } },
    actions: []
  },
  {
    slug: 'pending-feedback-registrar-general',
    icon: 'ChatText',
    name: {
      id: 'workqueues.pendingFeedback.title',
      defaultMessage: 'Pending feedback',
      description: 'Title of pending feedback workqueue'
    },
    query: {
      flags: {
        anyOf: ['escalated-to-registrar-general']
      }
    },
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          id: 'workqueues.reviewRequested.title',
          defaultMessage: 'Review requested',
          description: 'Title of review requested workqueue'
        },
        value: event.field('updatedAt')
      }
    ],
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ]
  },
  {
    slug: 'escalated',
    icon: 'FileArrowUp',
    name: {
      id: 'workqueues.escalated.title',
      defaultMessage: 'Escalated',
      description: 'Title of escalated workqueue'
    },
    query: {
      flags: {
        anyOf: [
          'escalated-to-registrar-general',
          'escalated-to-provincial-registrar'
        ]
      }
    },
    actions: []
  },
  {
    slug: 'pending-feedback-provincinal-registrar',
    icon: 'ChatText',
    name: {
      id: 'workqueues.pendingFeedback.title',
      defaultMessage: 'Pending feedback',
      description: 'Title of pending feedback workqueue'
    },
    query: {
      flags: {
        anyOf: ['escalated-to-provincial-registrar']
      },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    columns: [
      DATE_OF_EVENT_COLUMN,
      {
        label: {
          id: 'workqueues.reviewRequested.title',
          defaultMessage: 'Review requested',
          description: 'Title of review requested workqueue'
        },
        value: event.field('updatedAt')
      }
    ],
    actions: [
      {
        type: 'DEFAULT',
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
      flags: {
        anyOf: [
          `${ActionType.REGISTER}:${ActionStatus.Requested}`.toLowerCase()
        ]
      },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    actions: [
      {
        type: 'DEFAULT',
        conditionals: []
      }
    ]
  },
  {
    slug: 'pending-certification',
    icon: 'Printer',
    name: {
      id: 'workqueues.pendingCertification.title',
      defaultMessage: 'Pending certification',
      description: 'Title of pending certification workqueue'
    },
    query: {
      flags: { anyOf: ['pending-first-certificate-issuance'] },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    actions: [{ type: 'DEFAULT', conditionals: [] }],
    emptyMessage: {
      id: 'workqueues.pendingCertification.emptyMessage',
      defaultMessage: 'No pending certification records',
      description: 'Empty message for pending certification workqueue'
    }
  },
  {
    slug: 'pending-issuance',
    icon: 'Handshake',
    name: {
      id: 'workqueues.pendingIssuance.title',
      defaultMessage: 'Pending issuance',
      description: 'Title of pending issuance workqueue'
    },
    query: {
      flags: { anyOf: ['certified-copy-printed-in-advance-of-issuance'] },
      updatedAtLocation: { type: 'within', location: user('primaryOfficeId') }
    },
    actions: [{ type: 'DEFAULT', conditionals: [] }],
    emptyMessage: {
      id: 'workqueues.pendingCertification.emptyMessage',
      defaultMessage: 'No pending certification records',
      description: 'Empty message for pending certification workqueue'
    }
  },
  {
    slug: 'correction-requested',
    icon: 'File',
    name: {
      id: 'workqueues.correctionRequested.title',
      defaultMessage: 'Pending corrections',
      description: 'Title of correction requested workqueue'
    },
    query: { flags: { anyOf: [InherentFlags.CORRECTION_REQUESTED] } },
    actions: [{ type: 'DEFAULT', conditionals: [] }]
  }
])
