import { expect, test } from '@playwright/test'
import { fetchClientAPI } from './api'
import { CREDENTIALS } from '../../constants'
import { v4 as uuidv4 } from 'uuid'

const EVENT_TYPE = 'v2.birth'

// TODO CIHAN: login with j.campbell and create a system user?
// TODO CIHAN: use system user

test.describe('POST /api/events/events/create', () => {
  test('returns HTTP 400 with missing payload', async () => {
    const response = await fetchClientAPI('/api/events/events/create', 'POST')
    expect(response.status).toBe(400)
  })

  test('returns HTTP 200 with valid payload', async () => {
    const response = await fetchClientAPI('/api/events/events/create', 'POST', {
      type: EVENT_TYPE,
      transactionId: uuidv4()
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.type).toBe(EVENT_TYPE)
    expect(body.actions.length).toBe(2)
  })

  test.skip('returns HTTP 401 when user is missing scope', async () => {
    const response = await fetchClientAPI('/api/events/events/create', 'POST')

    expect(response.status).toBe(401)
  })
})

test.describe('POST /api/events/events/notify', () => {
  test('returns HTTP 400 with missing payload', async () => {
    const response = await fetchClientAPI('/api/events/events/notify', 'POST')

    expect(response.status).toBe(400)
  })

  test('returns HTTP 200 with valid payload', async () => {
    const response = await fetchClientAPI('/api/events/events/notify', 'POST', {
      type: EVENT_TYPE,
      transactionId: uuidv4()
    })

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.type).toBe(EVENT_TYPE)
    expect(body.actions.length).toBe(2)

    // TODO CIHAN: check from UI that event is created
  })

  test.skip('returns HTTP 401 when user is missing scope', async () => {
    const response = await fetchClientAPI(
      '/api/events/events/create',
      'POST',
      CREDENTIALS.REGISTRATION_AGENT
    )

    expect(response.status).toBe(401)
  })
})
