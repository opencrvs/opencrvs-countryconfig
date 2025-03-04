import { test, expect, type Page } from '@playwright/test'
import {
  assignRecord,
  continueForm,
  createPIN,
  drawSignature,
  expectOutboxToBeEmpty,
  expectTextWithChangeLink,
  getAction,
  goToSection,
  login
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('9. Death declaration case - 9', () => {
  let page: Page
  const REQUIRED = 'Required for registration'
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.person.firstName('male')
      },
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo'
      },
      nationality: 'Farajaland'
    },
    informantType: 'Grandson'
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('9.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.FIELD_AGENT.USERNAME,
        CREDENTIALS.FIELD_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.1 Fill deceased details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.deceased.name.firstNames)

      await continueForm(page)
    })

    test('9.1.2 Fill event details', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.3 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.4 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('9.1.5 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * * should require
       * - Deceased's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Full'), [
        declaration.deceased.name.firstNames,
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Sex'), [
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Date'), [
        REQUIRED
      ])

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deceased-content #Nationality'),
        [declaration.deceased.nationality]
      )
      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Type'), [
        REQUIRED
      ])

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Usual'), [
        declaration.deceased.address.country,
        declaration.deceased.address.district,
        declaration.deceased.address.province
      ])

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        'Must be a valid date of death'
      )
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Cause'),
        ['No']
      )

      /*
       * Expected result: should require
       * - Place of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [REQUIRED]
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Informant'),
        [declaration.informantType]
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectTextWithChangeLink(page.locator('#spouse-content #Full'), [
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Date'), [
        REQUIRED
      ])

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#spouse-content #Nationality'),
        ['Farajaland']
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Type'), [
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Same')).toContainText('Yes')
    })

    test('9.1.6 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('9.1.7 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expectOutboxToBeEmpty(page)

      await page.getByRole('button', { name: 'Sent for review' }).click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.deceased.name.firstNames}`,
          exact: true
        })
      ).toBeVisible()
    })
  })

  test.describe('9.2 Declaration Review by RA', async () => {
    test('9.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'In Progress' }).click()
      await page.getByRole('button', { name: 'Field Agents' }).click()

      await page
        .getByRole('button', {
          name: `${declaration.deceased.name.firstNames}`,
          exact: true
        })
        .click()
      await assignRecord(page)
      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Update declaration').click()
    })

    test('9.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * * should require
       * - Deceased's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Full'), [
        declaration.deceased.name.firstNames,
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Sex'), [
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Date'), [
        REQUIRED
      ])

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deceased-content #Nationality'),
        [declaration.deceased.nationality]
      )
      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Type'), [
        REQUIRED
      ])

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */

      await expectTextWithChangeLink(page.locator('#deceased-content #Usual'), [
        declaration.deceased.address.country,
        declaration.deceased.address.district,
        declaration.deceased.address.province
      ])

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        'Must be a valid date of death'
      )
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Cause'),
        ['No']
      )

      /*
       * Expected result: should require
       * - Place of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [REQUIRED]
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Informant'),
        [declaration.informantType]
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Must be a valid email address'
      )
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectTextWithChangeLink(page.locator('#spouse-content #Full'), [
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Date'), [
        REQUIRED
      ])

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#spouse-content #Nationality'),
        ['Farajaland']
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Type'), [
        REQUIRED
      ])

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Same')).toContainText('Yes')
    })
  })
})
