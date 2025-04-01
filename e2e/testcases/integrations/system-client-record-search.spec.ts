import { faker } from '@faker-js/faker'
import { test, type Page, expect } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { createPIN, getClientToken, getToken, login } from '../../helpers'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  getFacility
} from '../birth/helpers'
import { BirthInputDetails } from '../birth/types'
import {
  // eventNotificationPayload,
  fetchEvents,
  getTokenForSystemClient
} from './utils'
import {
  Facility,
  getFacilities,
  getLocations
} from '@countryconfig/data-generator/location'
import { sendBirthNotification } from '@countryconfig/data-generator/declare'

test.describe.serial('1. Birth declaration case - 1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Searching records and sending event notification as a system client', async () => {
    let token: {
      clientId: string
      secret: string
      sha: string
    }
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
        CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
      )
      await createPIN(page)
    })

    // event notification
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
    })

    test('Send event notification', async () => {
      console.log('-------> Entering send event notification test ------->')
      const clientToken = await getClientToken(token.clientId, token.secret)

      // fetch facilities using the registrar
      const facilities = await getFacilities()

      if (!facilities) {
        throw new Error('No facilities found')
      }

      const office = facilities[0]

      const locations = await getLocations()

      if (!locations) {
        throw new Error('No locations found')
      }
      const district = locations[0]

      const response = await sendBirthNotification(
        { username: 'test', token: clientToken },
        'male',
        faker.date.birthdate(),
        faker.date.recent(),
        facilities[0],
        district,
        office
      )

      console.log('response :>> ', response)

      expect(facilities).toBe('[facilities]')
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
})
