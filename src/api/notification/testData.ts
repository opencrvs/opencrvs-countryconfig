import { Recipient } from '@opencrvs/toolkit/notification'
import { TriggerEventPayloadPair } from './handler'

const recipient: Recipient = {
  name: [
    {
      use: 'en',
      family: 'Doe',
      given: ['John']
    }
  ],
  email: 'john.doe@gmail.com',
  mobile: '+15551234567'
}

export const testData: TriggerEventPayloadPair[] = [
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
        name: [
          {
            use: 'en',
            family: 'Campbell',
            given: ['Kennedy']
          }
        ],
        id: 'admin',
        role: 'NATIONAL_SYSTEM_ADMIN'
      }
    }
  }
]
