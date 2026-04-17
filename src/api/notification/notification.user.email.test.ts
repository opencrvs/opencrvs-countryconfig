import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Recipient, TriggerEvent } from '@opencrvs/toolkit/notification'
import { TriggerEventPayloadPair } from './handler'
import { createServer } from '../../index'

const recipient: Recipient = {
  name: {
    firstname: 'John',
    surname: 'Doe'
  },
  email: 'john.doe@gmail.com',
  mobile: '+15551234567'
}

const userNotificationTestData: TriggerEventPayloadPair[] = [
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

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'mock-public-key'
    })
  }
})

const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mocked-id' })
vi.mock('nodemailer', () => {
  return {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock
    }))
  }
})

describe('User notification - Email', () => {
  let server: any

  beforeEach(async () => {
    vi.resetModules()
    sendMailMock.mockClear()
    server = await createServer()
  })

  userNotificationTestData.forEach(({ event, payload }) =>
    it(event, async () => {
      await server.server.inject({
        method: 'POST',
        url: `/triggers/user/${event}`,
        payload
      })
      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
    })
  )
})
