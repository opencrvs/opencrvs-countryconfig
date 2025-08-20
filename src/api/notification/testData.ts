import { Recipient } from '@opencrvs/toolkit/notification'
import { UUID } from '@opencrvs/toolkit/events'
import { TriggerEventPayloadPair } from './handler'
import {
  Action,
  ActionStatus,
  ActionType,
  CreatedAction,
  EventDocument
} from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/form/types/types'

const recipient: Recipient = {
  name: {
    firstname: 'John',
    surname: 'Doe'
  },
  email: 'john.doe@gmail.com',
  mobile: '+15551234567'
}

export const userNotificationTestData: TriggerEventPayloadPair[] = [
  {
    event: 'user-created',
    payload: {
      recipient,
      username: 'j.doe',
      temporaryPassword: 'TempPass123!'
    }
  },
  {
    event: 'user-updated',
    payload: {
      recipient,
      oldUsername: 'z.roronoa',
      newUsername: 'j.doe'
    }
  },
  {
    event: 'username-reminder',
    payload: {
      recipient,
      username: 'j.doe'
    }
  },
  {
    event: '2fa',
    payload: {
      recipient,
      code: '102030'
    }
  },
  {
    event: 'reset-password',
    payload: {
      recipient,
      code: '112233'
    }
  },
  {
    event: 'reset-password-by-admin',
    payload: {
      recipient,
      temporaryPassword: 'tempPass123',
      admin: {
        name: {
          firstname: 'Kennedy',
          surname: 'Campbell'
        },
        id: 'admin',
        role: 'NATIONAL_SYSTEM_ADMIN'
      }
    }
  }
]

const CreateAction = {
  id: '596a6a01-5070-4b4d-bed4-949a33212b6e' as unknown as UUID,
  transactionId: 'tmp-0c1a550f-4537-4e15-bde1-649157fd1c52',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:04.815Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  status: ActionStatus.Accepted,
  type: ActionType.CREATE
} satisfies CreatedAction

const AssignAction = {
  id: 'f2262859-71f8-4604-bea9-7e24fcced788' as unknown as UUID,
  transactionId: 'tmp-0c1a550f-4537-4e15-bde1-649157fd1c52',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:04.815Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  status: 'Accepted',
  type: 'ASSIGN',
  assignedTo: '68a33795caf0b9e13a86d51f'
} satisfies Action

const RequestNotificationAction = {
  id: 'e8ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7c194bf-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'child.name': {
      firstname: 'Ace',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.name': {
      firstname: 'Rouge',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      province: '05cbe3a1-9020-47bd-b558-807607c2f119',
      district: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284',
      urbanOrRural: 'URBAN'
    },
    'informant.email': 'rouge@portgas.com',
    'informant.phoneNo': '0734231245',
    'father.nationality': 'FAR',
    'informant.relation': 'MOTHER',
    'mother.nationality': 'FAR',
    'father.addressSameAs': 'YES'
  },
  annotation: {},
  status: ActionStatus.Requested,
  type: ActionType.NOTIFY
} satisfies Action

const RequestDeclarationAction = {
  id: 'e8ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7c194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'child.name': {
      firstname: 'Ace',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.name': {
      firstname: 'Rouge',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      province: '05cbe3a1-9020-47bd-b558-807607c2f119',
      district: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284',
      urbanOrRural: 'URBAN'
    },
    'informant.email': 'rouge@portgas.com',
    'informant.phoneNo': '0734231245',
    'father.nationality': 'FAR',
    'informant.relation': 'MOTHER',
    'mother.nationality': 'FAR',
    'father.addressSameAs': 'YES'
  },
  annotation: {},
  status: ActionStatus.Requested,
  type: ActionType.DECLARE
} satisfies Action

const DeclarationAction = {
  id: 'e8ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7c194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {
    'child.name': {
      firstname: 'Ace',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.name': {
      firstname: 'Rouge',
      surname: 'Portgas D.',
      middlename: ''
    },
    'mother.address': {
      country: 'FAR',
      addressType: 'DOMESTIC',
      province: '05cbe3a1-9020-47bd-b558-807607c2f119',
      district: 'afaead2b-7ef5-4adb-b4bf-3d2b8437c284',
      urbanOrRural: 'URBAN'
    },
    'informant.email': 'rouge@portgas.com',
    'informant.phoneNo': '0734231245',
    'father.nationality': 'FAR',
    'informant.relation': 'MOTHER',
    'mother.nationality': 'FAR',
    'father.addressSameAs': 'YES'
  },
  annotation: {},
  status: ActionStatus.Accepted,
  type: ActionType.DECLARE
} satisfies Action

const RequestRegistrationAction = {
  id: 'e4ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7d194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  annotation: {},
  status: ActionStatus.Requested,
  type: ActionType.REGISTER
} satisfies Action

const RequestRejectionAction = {
  id: 'e4ef249e-dc06-4b5e-840a-2ee7edc3f826' as unknown as UUID,
  transactionId: 'c7d194bc-cd8d-48d0-824f-c3969d5aad79',
  createdByUserType: 'user',
  createdAt: '2025-08-20T03:24:49.861Z',
  createdBy: '68a33795caf0b9e13a86d51f',
  createdByRole: 'SOCIAL_WORKER',
  createdAtLocation: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e' as unknown as UUID,
  declaration: {},
  annotation: {},
  reason: { message: 'False Data', isDuplicate: false },
  status: ActionStatus.Requested,
  type: ActionType.REJECT
} satisfies Action

const birthNotificationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'v2.birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [CreateAction, AssignAction, RequestNotificationAction],
  trackingId: 'PRZIB7'
}

const birthDeclarationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'v2.birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [CreateAction, AssignAction, RequestDeclarationAction],
  trackingId: 'PRZIB7'
}

const birthRegistrationEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'v2.birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [
    CreateAction,
    AssignAction,
    DeclarationAction,
    RequestRegistrationAction
  ],
  trackingId: 'PRZIB7'
}

const birthRejectionEvent: EventDocument = {
  id: '43b8c015-2caf-469a-8900-a2209128ad44' as unknown as UUID,
  type: 'v2.birth',
  createdAt: '2025-08-20T03:24:04.815Z',
  updatedAt: '2025-08-20T03:24:04.815Z',
  actions: [
    CreateAction,
    AssignAction,
    DeclarationAction,
    RequestRejectionAction
  ],
  trackingId: 'PRZIB7'
}

export const informantNotificationTestData: {
  eventType: string
  actionType: ActionType
  eventDocument: EventDocument
}[] = [
  {
    eventType: Event.V2_BIRTH,
    actionType: ActionType.NOTIFY,
    eventDocument: birthNotificationEvent
  },
  {
    eventType: Event.V2_BIRTH,
    actionType: ActionType.DECLARE,
    eventDocument: birthDeclarationEvent
  },
  {
    eventType: Event.V2_BIRTH,
    actionType: ActionType.REGISTER,
    eventDocument: birthRegistrationEvent
  },
  {
    eventType: Event.V2_BIRTH,
    actionType: ActionType.REJECT,
    eventDocument: birthRejectionEvent
  }
]
