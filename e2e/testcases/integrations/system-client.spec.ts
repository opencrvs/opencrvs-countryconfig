import { faker } from '@faker-js/faker'
import { test, type Page, expect } from '@playwright/test'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { createPIN, getClientToken, getToken, login } from '../../helpers'
import { ConvertEnumsToStrings, createDeclaration } from '../birth/helpers'
import { BirthInputDetails } from '../birth/types'
import {
  eventNotificationPayload,
  fetchEvents,
  getLocationById,
  getOffices,
  getTokenForSystemClient
} from './utils'

test.describe.serial('Record Search System Client Tests', () => {
  let page: Page
  let token: {
    clientId: string
    secret: string
    sha: string
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(
      page,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
    )
    await createPIN(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Create a Record Search System client', async () => {
    await expect(
      page.getByText('Organisation', { exact: true }).first()
    ).toBeVisible()
    await page.getByText('Configuration', { exact: true }).click()
    await page.getByText('Integrations', { exact: true }).click()
    await page.getByText('Create client', { exact: true }).click()
    await page.locator('#client_name').fill('Record search ' + Date.now())
    await page.locator('#permissions-selectors').click()
    await page.getByText('Record search', { exact: true }).last().click()
    await page.getByText('Create', { exact: true }).click()
    await expect(page.getByText('Client ID', { exact: true })).toBeVisible()

    await page.waitForSelector('#Spinner', { state: 'detached' })

    const clientId = await page
      .getByText('Client ID', { exact: true })
      .locator('..')
      .locator(':nth-child(2) :first-child')
      .first()
      .textContent()
    const secret = await page
      .getByText('Client secret', { exact: true })
      .locator('..')
      .locator(':nth-child(2) :first-child')
      .first()
      .textContent()
    const sha = await page
      .getByText('SHA secret', { exact: true })
      .locator('..')
      .locator(':nth-child(2) :first-child')
      .first()
      .textContent()

    if (!clientId || !secret || !sha) {
      throw new Error('Client ID, secret or SHA secret not found')
    }

    token = {
      clientId,
      secret,
      sha
    }

    await page.locator('#close-btn').click()
  })

  test('Search for a record', async () => {
    const declarationInput = {
      child: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.firstName(),
        gender: 'male'
      },
      informant: {
        type: 'BROTHER'
      },
      attendant: {
        type: 'PHYSICIAN'
      },
      mother: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.firstName()
      },
      father: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.firstName()
      }
    } as ConvertEnumsToStrings<BirthInputDetails>

    const registrarToken = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const createdDeclaration = await createDeclaration(
      registrarToken,
      declarationInput
    )

    const systemToken = await getTokenForSystemClient(
      token.clientId,
      token.secret
    )

    const events = await fetchEvents(
      createdDeclaration.trackingId,
      systemToken.access_token
    )
    expect(events.data.searchEvents.totalItems).toBe(1)
  })
})

test.describe.serial('Event Notification System Client Tests', () => {
  let page: Page
  let token: {
    clientId: string
    secret: string
    sha: string
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(
      page,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
    )
    await createPIN(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Create an event notification System client', async () => {
    await page.getByRole('button', { name: 'Organisation' }).click()
    await page.getByRole('button', { name: 'Configuration' }).click()
    await page.getByRole('button', { name: 'Integrations' }).click()
    await page.getByRole('button', { name: 'Create client' }).click()

    await page.locator('#client_name').fill('Event not ' + Date.now())
    await page.locator('#permissions-selectors').click()
    await page.getByText('Event notification', { exact: true }).last().click()
    await page.getByText('Create', { exact: true }).click()
    await expect(page.getByText('Client ID', { exact: true })).toBeVisible()

    await page.waitForSelector('#Spinner', { state: 'detached' })

    const clientId = await page
      .getByText('Client ID', { exact: true })
      .locator('..')
      .locator(':nth-child(2) :first-child')
      .first()
      .textContent()
    const secret = await page
      .getByText('Client secret', { exact: true })
      .locator('..')
      .locator(':nth-child(2) :first-child')
      .first()
      .textContent()
    const sha = await page
      .getByText('SHA secret', { exact: true })
      .locator('..')
      .locator(':nth-child(2) :first-child')
      .first()
      .textContent()

    if (!clientId || !secret || !sha) {
      throw new Error('Client ID, secret or SHA secret not found')
    }

    token = {
      clientId,
      secret,
      sha
    }

    await page.locator('#close-btn').click()
  })

  test('Send event notification', async () => {
    const clientToken = await getClientToken(token.clientId, token.secret)

    // get facilities
    const resCRVFacilities = await fetch(
      `${GATEWAY_HOST}/location?type=HEALTH_FACILITY&_count=0&status=active`
    )

    const facilityList = await resCRVFacilities.json()

    const facilities = facilityList?.entry
    const facility = facilities[0]

    const facilityPartOf = facility.resource.partOf.reference

    // get districtId using facility partOf as the fhirId
    const foundDistrict = await getLocationById(facilityPartOf.split('/')[1])
    // const districtPartOf = foundDistrict.partOf.reference.split('/')[1]

    // check for the office
    const offices = await getOffices()
    const officeId = offices.filter(
      (office: any) =>
        office.resource.partOf.reference === `Location/${foundDistrict.id}`
    )[0].resource.id

    // get stateId using district partOf as fhirId
    const foundState = await getLocationById(
      foundDistrict.partOf.reference.split('/')[1]
    )

    const response: any = await fetch(`${GATEWAY_HOST}/notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
        'x-correlation-id': `birth-notification-${faker.person.lastName}`
      },
      body: JSON.stringify(
        eventNotificationPayload(
          officeId,
          foundDistrict.id,
          foundState.id,
          facility.resource.id
        )
      )
    })

    const status = response?.status

    expect(status).toBe(200)
  })
})
