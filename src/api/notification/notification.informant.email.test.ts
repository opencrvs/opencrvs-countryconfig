import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => 'mock-public-key'
    })
  }
})

vi.mock('@opencrvs/toolkit/api', () => ({
  createClient: vi.fn(() => ({
    locations: {
      get: {
        query: vi.fn().mockResolvedValue([
          {
            id: '9e069dda-0d83-4f67-a4f2-9adbf5658e2e',
            name: 'Windmill village registrar office'
          }
        ])
      }
    }
  }))
}))

vi.mock('nanoid', () => {
  return {
    customAlphabet: vi.fn(() => {
      return vi.fn(() => 'P4JPMNEW3ZM3')
    })
  }
})
vi.mock('nodemailer', () => {
  const sendMailMock = vi.fn().mockResolvedValue({ messageId: 'mocked-id' })

  return {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock
    })),
    __sendMailMock: sendMailMock
  }
})

let nodemailer: typeof import('nodemailer')

import { createServer } from '../../index'

import { informantNotificationTestData } from './testData'
let sendMailMock: ReturnType<typeof vi.fn>

describe('Informant notification - Email', () => {
  let server: any

  beforeEach(async () => {
    vi.resetModules()
    nodemailer = await import('nodemailer')
    sendMailMock = (nodemailer as any).__sendMailMock as ReturnType<
      typeof vi.fn
    >
    sendMailMock.mockClear()
    server = await createServer()
  })

  informantNotificationTestData.forEach(
    ({ eventType, actionType, eventDocument }) =>
      it(`${eventType} - ${actionType}`, async () => {
        await server.server.inject({
          method: 'POST',
          url: `/trigger/events/${eventType}/actions/${actionType}`,
          payload: { event: eventDocument },
          auth: {
            strategy: 'jwt',
            credentials: {},
            artifacts: { token: 'mock-token' }
          }
        })

        expect(sendMailMock).toHaveBeenCalledTimes(1)
        expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
      })
  )
})
