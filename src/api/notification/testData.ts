import { Recipient, TriggerEvent } from '@opencrvs/toolkit/notification'
import { TriggerEventPayloadPair } from './handler'

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
  },
  {
    event: TriggerEvent.CHANGE_EMAIL_ADDRESS,
    payload: {
      recipient,
      code: '654321'
    }
  },
  {
    event: TriggerEvent.CHANGE_PHONE_NUMBER,
    payload: {
      recipient,
      code: '123456'
    }
  }
]
