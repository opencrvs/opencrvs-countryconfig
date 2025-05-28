import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { CLIENT_URL, GATEWAY_HOST } from '../../constants'
import { CREDENTIALS } from '../../constants'
import { getClientToken, getToken } from '../../helpers'
import { format } from 'date-fns'

async function fetchClientAPI(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string,
  body: object = {}
) {
  const url = new URL(`${CLIENT_URL}${path}`)

  return fetch(url, {
    method,
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  })
}

async function createSystemUser() {
  const token = await getToken(
    CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
    CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
  )

  const res = await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
      mutation registerSystem($system: SystemInput) {
        registerSystem(system: $system) {
          clientSecret
          system {
            clientId
            shaSecret
          }
        }
      }
    `,
      variables: {
        system: {
          name: `E2E test integration ${format(new Date(), 'dd.MM.yyyy HH:mm:ss.SSS')}`,
          type: 'HEALTH'
        }
      }
    })
  })

  const body = await res.json()

  return {
    clientSecret: body.data.registerSystem.clientSecret as string,
    system: body.data.registerSystem.system as {
      clientId: string
      shaSecret: string
    }
  }
}

const EVENT_TYPE = 'v2.birth'

test.describe('Events REST API', () => {
  let clientToken: string

  test.beforeAll(async () => {
    const { system, clientSecret } = await createSystemUser()
    clientToken = await getClientToken(system.clientId, clientSecret)
  })

  test.describe('POST /api/events/events', () => {
    test.skip('returns HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken
      )

      expect(response.status).toBe(403)
    })

    test('returns HTTP 400 with missing payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken
      )
      expect(response.status).toBe(400)
    })

    test('returns HTTP 200 with valid payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4()
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(2)
    })
  })

  test.describe('POST /api/events/events/notifications', () => {
    test('returns HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken
      )
      expect(response.status).toBe(403)
    })

    test('returns HTTP 400 with missing payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken
      )

      expect(response.status).toBe(400)
    })

    test('returns HTTP 200 with valid payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4()
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(2)

      // TODO CIHAN: check from UI that event is created
    })
  })
})
