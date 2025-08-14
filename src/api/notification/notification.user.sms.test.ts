import { vi, describe, it, expect, beforeEach } from 'vitest'
process.env.USER_NOTIFICATION = 'true'

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
    INFOBIP_SENDER_ID: 'mock_sender',
    USER_NOTIFICATION_DELIVERY_METHOD: 'sms'
  }
})

vi.mock('node-fetch', () => {
  return {
    default: vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => 'mock-public-key'
    })
  }
})

import fetch from 'node-fetch'
import { testData } from './testData'
import { createServer } from '../../index'

describe('User notification - sms', () => {
  let server: any

  beforeEach(async () => {
    ;(fetch as any).mockClear()
    server = await createServer()
  })

  testData.forEach(({ event, payload }) =>
    it(event, async () => {
      await server.server
        .inject({
          method: 'POST',
          url: `/triggers/user/${event}`,
          payload
        })
        .catch(() => {})
      expect((fetch as any).mock.calls[1][1].body).toMatchSnapshot()
    })
  )
})
