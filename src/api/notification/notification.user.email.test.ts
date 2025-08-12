import { vi, describe, it, expect, beforeEach } from 'vitest'

process.env.NODE_ENV = 'production'
vi.mock('../../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils')>()
  return {
    ...actual,
    getApplicationConfig: vi.fn().mockResolvedValue({
      APPLICATION_NAME: 'Farajaland CRS',
      COUNTRY: 'BD',
      COUNTRY_LOGO: { url: '/logo.png' },
      SENTRY: 'https://sentry.com',
      LOGIN_BACKGROUND: { url: '/bg.png' },
      USER_NOTIFICATION_DELIVERY_METHOD: 'email',
      INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms'
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

import { sendNotification } from './handler'
import { testData } from './testData'
let sendMailMock: ReturnType<typeof vi.fn>

describe('User notification - Email', () => {
  beforeEach(async () => {
    vi.resetModules()
    nodemailer = await import('nodemailer')
    sendMailMock = (nodemailer as any).__sendMailMock as ReturnType<
      typeof vi.fn
    >
    sendMailMock.mockClear()
  })

  testData.forEach(({ event, payload }) =>
    it(event, async () => {
      await sendNotification(event, payload)

      expect(sendMailMock).toHaveBeenCalledTimes(1)
      expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
    })
  )
})
