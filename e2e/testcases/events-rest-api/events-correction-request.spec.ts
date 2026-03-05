import { expect, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import {
  createIntegrationContext,
  createRegisteredEvent,
  fetchClientAPI
} from './helpers'

test.describe('POST /api/events/events/{eventId}/correction/request', () => {
  let clientToken: string
  let registrarToken: string
  let healthFacilityId: string

  test.beforeAll(async () => {
    const context = await createIntegrationContext()
    clientToken = context.clientToken
    registrarToken = context.registrarToken
    healthFacilityId = context.healthFacilityId
  })

  test('HTTP 200 for correction request', async () => {
    const eventId = await createRegisteredEvent(registrarToken)

    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/correction/request`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'REQUEST_CORRECTION',
        declaration: {
          'child.name': {
            firstname: faker.person.firstName(),
            surname: faker.person.lastName()
          }
        },
        annotation: {},
        createdAtLocation: healthFacilityId
      }
    )

    const body = await response.json()
    expect(response.status).toBe(200)
    const requestAction = body.actions.find(
      (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
    )
    expect(requestAction).toBeDefined()
  })
})
