import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { CLIENT_URL, GATEWAY_HOST } from '../../constants'
import { CREDENTIALS } from '../../constants'
import { formatName, getClientToken, getToken, loginToV2 } from '../../helpers'
import { format } from 'date-fns'
import { faker } from '@faker-js/faker'

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

async function createSystemUser(token: string) {
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
          name: `Test-int. ${format(new Date(), 'dd.MM. HH:mm:ss')}`,
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

async function deleteSystemUser(token: string, clientId: string) {
  await fetch(`${GATEWAY_HOST}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      operationName: 'deleteSystem',
      variables: {
        clientId
      },
      query: `mutation deleteSystem($clientId: ID!) {  deleteSystem(clientId: $clientId) {
          _id
          clientId
          name
          shaSecret
          status
          type
          __typename
        }
      }`
    })
  })
}

const EVENT_TYPE = 'v2.birth'

test.describe('Events REST API', () => {
  let clientToken: string
  let clientId: string
  let systemAdminToken: string

  test.beforeAll(async () => {
    systemAdminToken = await getToken(
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
    )
    const { system, clientSecret } = await createSystemUser(systemAdminToken)
    clientId = system.clientId
    clientToken = await getClientToken(clientId, clientSecret)
  })

  test.afterAll(async () => {
    await deleteSystemUser(systemAdminToken, clientId)
  })

  test.describe('POST /api/events/events', () => {
    test('returns HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        'foobar'
      )
      expect(response.status).toBe(401)
    })

    test('returns HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        // use system admin token which doesnt have required scope to create event
        systemAdminToken
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

    test('returns HTTP 400 with invalid payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: 'foobar'
        }
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
    test('returns HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        'foobar'
      )
      expect(response.status).toBe(401)
    })

    test('returns HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        // use system admin token which doesnt have required scope to create event
        systemAdminToken
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

    test('returns HTTP 400 with invalid payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          type: 'foobar'
        }
      )

      expect(response.status).toBe(400)
    })

    test('returns HTTP 404 when trying to notify a non-existing event', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId: uuidv4(),
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.firstname': faker.person.firstName(),
            'child.surname': faker.person.lastName(),
            'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(404)
    })

    test('returns HTTP 200 with valid payload', async ({ page }) => {
      const createEventResponse = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId: uuidv4()
        }
      )

      const createEventResponseBody = await createEventResponse.json()
      const eventId = createEventResponseBody.id

      const childName = {
        firstNames: faker.person.firstName(),
        familyName: faker.person.lastName()
      }

      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.firstname': childName.firstNames,
            'child.surname': childName.familyName,
            'child.dob': new Date(Date.now() - 60 * 60 * 24 * 1000)
          },
          annotation: {}
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(4)
      expect(body.actions[0].type).toBe('CREATE')
      expect(body.actions[1].type).toBe('ASSIGN')
      expect(body.actions[2].type).toBe('NOTIFY')
      expect(body.actions[3].type).toBe('UNASSIGN')

      // check that event is created in UI
      await loginToV2(page)
      await page.getByText(await formatName(childName)).click()
      await expect(page.locator('#row_0')).toContainText('Assigned')
      await expect(page.locator('#row_1')).toContainText('Notified')
      await expect(page.locator('#row_2')).toContainText('Unassigned')
    })
  })
})
