import { vi, describe, it, expect, beforeEach } from 'vitest'

process.env.NODE_ENV = 'production'

vi.mock('../../utils', () => ({
  getApplicationConfig: vi.fn().mockResolvedValue({
    APPLICATION_NAME: 'My App',
    COUNTRY: 'BD',
    COUNTRY_LOGO: { url: '/logo.png' },
    SENTRY: 'https://example.com',
    LOGIN_BACKGROUND: { url: '/bg.png' },
    USER_NOTIFICATION_DELIVERY_METHOD: 'email',
    INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms'
  })
}))

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

describe('User notification - Email', () => {
  beforeEach(async () => {
    vi.resetModules()

    nodemailer = await import('nodemailer')
  })
  it('user-created', async () => {
    await sendNotification('user-created', {
      recipient: {
        name: [{ use: 'en', family: 'Cena', given: ['John'] }],
        email: 'john.doe@gmail.com',
        mobile: '+15551234567'
      },
      username: 'j.doe',
      temporaryPassword: 'TempPass123!'
    })

    const sendMailMock = (nodemailer as any).__sendMailMock as ReturnType<
      typeof vi.fn
    >

    expect(sendMailMock).toHaveBeenCalledTimes(1)

    expect(sendMailMock.mock.calls[0][0]).toMatchSnapshot()
  })
})
