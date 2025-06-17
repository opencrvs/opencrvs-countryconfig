import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { CLIENT_URL, GATEWAY_HOST } from '../../constants'
import { CREDENTIALS } from '../../constants'
import { formatName, getClientToken, getToken, loginToV2 } from '../../helpers'
import { addDays, format, subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { selectAction } from '../../v2-utils'

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
  const name = `Test-int. ${format(new Date(), 'dd.MM. HH:mm:ss')}`
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
          name,
          type: 'HEALTH'
        }
      }
    })
  })

  const body = await res.json()

  return {
    name,
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
  let clientName: string

  test.beforeAll(async () => {
    systemAdminToken = await getToken(
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
    )
    const { system, clientSecret, name } =
      await createSystemUser(systemAdminToken)
    clientName = name
    clientId = system.clientId
    clientToken = await getClientToken(clientId, clientSecret)
  })

  test.afterAll(async () => {
    await deleteSystemUser(systemAdminToken, clientId)
  })

  test.describe('POST /api/events/events', () => {
    test('HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        'foobar'
      )
      expect(response.status).toBe(401)
    })

    test('HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        // use system admin token which doesnt have required scope to create event
        systemAdminToken
      )

      expect(response.status).toBe(403)
    })

    test('HTTP 400 with missing payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken
      )

      expect(response.status).toBe(400)
    })

    test('HTTP 400 with invalid payload', async () => {
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

    test('HTTP 200 with valid payload', async () => {
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
      expect(body.actions.length).toBe(1)
    })

    test('API is idempotent', async () => {
      const transactionId = uuidv4()
      const response1 = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId
        }
      )

      const response2 = await fetchClientAPI(
        '/api/events/events',
        'POST',
        clientToken,
        {
          type: EVENT_TYPE,
          transactionId
        }
      )

      const body1 = await response1.json()
      const body2 = await response2.json()

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(body1).toEqual(body2)
    })
  })

  test.describe('POST /api/events/events/notifications', () => {
    test('HTTP 401 when invalid token is used', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        'foobar'
      )
      expect(response.status).toBe(401)
    })

    test('HTTP 403 when user is missing scope', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        // use system admin token which doesnt have required scope to create event
        systemAdminToken
      )
      expect(response.status).toBe(403)
    })

    test('HTTP 400 with missing payload', async () => {
      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken
      )

      expect(response.status).toBe(400)
    })

    test('HTTP 400 with invalid payload', async () => {
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

    test('HTTP 400 with payload containing declaration with unexpected fields', async () => {
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

      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'foo.bar': 'this should cause an error',
            'child.surname': faker.person.lastName(),
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
    })

    test('HTTP 400 with payload containing declaration with invalid values', async () => {
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

      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.surname': faker.person.lastName(),
            // this should cause an error because the date is in the future
            'child.dob': format(addDays(new Date(), 10), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
    })

    test('HTTP 400 with payload containing declaration with values of wrong type', async () => {
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

      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.surname': 12345
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
    })

    test('HTTP 404 when trying to notify a non-existing event', async () => {
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
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(404)
    })

    test('HTTP 200 with valid payload', async ({ page }) => {
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
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(2)
      expect(body.actions[0].type).toBe('CREATE')
      expect(body.actions[1].type).toBe('NOTIFY')

      // check that event is created in UI
      await loginToV2(page)

      await page.getByRole('button', { name: 'Notifications' }).click()

      await page.getByText(await formatName(childName)).click()
      await expect(page.locator('#row_0')).toContainText('Notified')
      await expect(page.locator('#row_0')).toContainText(clientName)
      await expect(page.locator('#row_0')).toContainText('Health integration')

      // Open modal by clicking 'Notified' actio row
      await page.getByText('Notified').click()
      const modal = await page.getByTestId('event-history-modal')
      expect(modal).toContainText('Notified')
      expect(modal).toContainText(clientName)
    })

    test('API is idempotent', async () => {
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

      const requestBody = {
        eventId,
        transactionId: uuidv4(),
        type: 'NOTIFY',
        declaration: {
          'child.firstname': childName.firstNames,
          'child.surname': childName.familyName,
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {}
      }

      const response1 = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        requestBody
      )

      const response2 = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        requestBody
      )

      const body1 = await response1.json()
      const body2 = await response2.json()

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(body1).toEqual(body2)
    })

    test('user can register event notified by integration', async ({
      page
    }) => {
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

      await fetchClientAPI(
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
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      await loginToV2(page)

      await page.getByRole('button', { name: 'Notifications' }).click()
      await page.getByText(await formatName(childName)).click()
      await selectAction(page, 'Validate')
      await page
        .locator('#Accordion_child-accordion-header')
        .getByRole('button', { name: 'Change all', exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue', exact: true }).click()

      await expect(page.locator('#child____firstname')).toHaveValue(
        childName.firstNames
      )
      await expect(page.locator('#child____surname')).toHaveValue(
        childName.familyName
      )
    })
  })
})
