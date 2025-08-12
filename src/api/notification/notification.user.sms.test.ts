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
      USER_NOTIFICATION_DELIVERY_METHOD: 'sms',
      INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'sms'
    })
  }
})

vi.mock(import('./constant'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    INFOBIP_API_KEY: 'mock_api_key',
    INFOBIP_GATEWAY_ENDPOINT: 'https://gateway.infobip.com',
    INFOBIP_SENDER_ID: 'mock_sender'
  }
})

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({})
    })
  }
})

import { sendNotification } from './handler'
import fetch from 'node-fetch'
import { testData } from './testData'

describe('User notification - sms', () => {
  beforeEach(async () => {
    ;(fetch as any).mockClear()
  })
  testData.forEach(({ event, payload }) =>
    it(event, async () => {
      await sendNotification(event, payload).catch(() => {})
      expect((fetch as any).mock.calls[0][1].body).toMatchSnapshot()
    })
  )
})
