import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { CLIENT_URL, GATEWAY_HOST } from '../../constants'
import { CREDENTIALS } from '../../constants'
import {
  fetchUserLocationHierarchy,
  formatName,
  getAction,
  getClientToken,
  getToken,
  loginToV2
} from '../../helpers'
import { addDays, format, subDays } from 'date-fns'
import { faker } from '@faker-js/faker'
import { ensureAssigned } from '../../v2-utils'
import { getAllLocations } from '../birth/helpers'

import decode from 'jwt-decode'

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

const EVENT_TYPE = 'birth'

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
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
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
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
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
    let healthFacilityId: string

    test.beforeAll(async () => {
      const healthFacilities = await getAllLocations('HEALTH_FACILITY')

      if (!healthFacilities[0].id) {
        throw new Error('No health facility found')
      }

      healthFacilityId = healthFacilities[0].id
    })

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
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
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
      const body = await response.json()
      expect(body.message).toBe('Input validation failed')
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

      const fakeSurname = faker.person.lastName()
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
            'child.name': { surname: fakeSurname },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe(
        `[{"message":"Unexpected field","id":"foo.bar","value":"this should cause an error"},{"message":"Invalid input","id":"child.name","value":{"surname":"${fakeSurname}"}}]`
      )
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

      const fakeSurname = faker.person.lastName()

      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': { surname: fakeSurname },
            // this should cause an error because the date is in the future
            'child.dob': format(addDays(new Date(), 10), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe(
        `[{"message":"Invalid input","id":"child.name","value":{"surname":"${fakeSurname}"}}]`
      )
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
            'child.name': { surname: 12345 }
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(400)
      const body = await response.json()
      expect(body.message).toBe(
        '[{"message":"Invalid input","id":"child.name","value":{}}]'
      )
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
            'child.name': {
              firstname: faker.person.firstName(),
              surname: faker.person.lastName()
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      expect(response.status).toBe(404)
    })

    test('HTTP 400 when trying to notify an event without createdAtLocation', async () => {
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
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {}
        }
      )

      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.message).toBe(
        'createdAtLocation is required and must be a valid office id'
      )
    })

    test('HTTP 400 when trying to notify an event with an invalid createdAtLocation', async () => {
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
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: 'invalid-location-id'
        }
      )

      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.message).toBe('Input validation failed')
    })

    test('HTTP 400 when trying to notify an event with a non-office createdAtLocation', async () => {
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

      const locations = await getAllLocations('ADMIN_STRUCTURE')
      const centralLocation = locations.find(
        (location) => location.name === 'Central'
      )

      if (!centralLocation) {
        throw new Error('No central location found')
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
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: centralLocation.id
        }
      )

      const body = await response.json()

      expect(response.status).toBe(400)
      expect(body.message).toBe('createdAtLocation must be an office location')
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

      const token = await loginToV2(page)
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const response = await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: location[location.length - 1]
        }
      )

      const body = await response.json()

      expect(response.status).toBe(200)
      expect(body.type).toBe(EVENT_TYPE)
      expect(body.actions.length).toBe(3)
      expect(body.actions[0].type).toBe('CREATE')
      expect(body.actions[1].type).toBe('NOTIFY')
      expect(body.actions[1].status).toBe('Requested')
      expect(body.actions[2].type).toBe('NOTIFY')
      expect(body.actions[2].status).toBe('Accepted')

      // check that event is created in UI

      await page.getByRole('button', { name: 'Notifications' }).click()

      await page.getByText(await formatName(childName)).click()

      await ensureAssigned(page)

      await expect(page.locator('#row_0')).toContainText('Sent incomplete')
      await expect(page.locator('#row_0')).toContainText(clientName)
      await expect(page.locator('#row_0')).toContainText('Health integration')

      // Open modal by clicking 'Sent incomplete' action row
      await page.getByText('Sent incomplete').click()
      const modal = await page.getByTestId('event-history-modal')
      expect(modal).toContainText('Sent incomplete')
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
          'child.name': {
            firstname: childName.firstNames,
            surname: childName.familyName
          },
          'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
        },
        annotation: {},
        createdAtLocation: healthFacilityId
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

      const token = await loginToV2(page)
      const { sub } = decode<{ sub: string }>(token)

      const location = await fetchUserLocationHierarchy(sub, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      await fetchClientAPI(
        '/api/events/events/notifications',
        'POST',
        clientToken,
        {
          eventId,
          transactionId: uuidv4(),
          type: 'NOTIFY',
          declaration: {
            'child.name': {
              firstname: childName.firstNames,
              surname: childName.familyName
            },
            'child.dob': format(subDays(new Date(), 1), 'yyyy-MM-dd')
          },
          annotation: {},
          createdAtLocation: location[location.length - 1]
        }
      )

      await page.getByRole('button', { name: 'Notifications' }).click()
      await page.getByText(await formatName(childName)).click()

      await ensureAssigned(page)

      await page.getByRole('button', { name: 'Action' }).click()
      await getAction(page, 'Review').click()

      await page
        .locator('#Accordion_child-accordion-header')
        .getByRole('button', { name: 'Change all', exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue', exact: true }).click()

      await expect(page.locator('#firstname')).toHaveValue(childName.firstNames)
      await expect(page.locator('#surname')).toHaveValue(childName.familyName)
    })
  })
})
