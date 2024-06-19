import { test, expect, type Page } from '@playwright/test'
import { createPIN, goToSection, login } from '../../../helpers'
import faker from '@faker-js/faker'

test.describe.serial('9. Death declaration case - 9', () => {
  let page: Page
  const REQUIRED = 'Required for registration'
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.name.firstName('male')
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

  test.describe('9.1 Declaratin started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, 'k.bwalya', 'test')
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.2 Fill event details', async () => {
      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.3 Fill informant details', async () => {
      await page.waitForTimeout(500)
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
      goToSection(page, 'preview')
    })

    test('9.1.5 Verify informations in preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * * should require
       * - Deceased's Family Name
       * - Change button
       */
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.firstNames
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expect(page.locator('#deceased-content #Date')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText(declaration.deceased.nationality)
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText('Change')

      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.country
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.district
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.province
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        'Change'
      )

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
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'No'
      )
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Place of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expect(page.locator('#informant-content #Informant')).toContainText(
        declaration.informantType
      )
      await expect(page.locator('#informant-content #Informant')).toContainText(
        'Change'
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

      await expect(page.locator('#spouse-content #Full')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#spouse-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expect(page.locator('#spouse-content #Date')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#spouse-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        'Farajaland'
      )
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expect(page.locator('#spouse-content #Type')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#spouse-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Usual')).toContainText('Yes')
    })

    test('9.1.6 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

      await page.getByRole('button', { name: 'Sent for review' }).click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.deceased.name.firstNames}`
        })
      ).toBeVisible()
    })
  })

  test.describe('9.2 Declaration Review by RA', async () => {
    test('9.2.1 Navigate to the declaration review page', async () => {
      await login(page, 'f.katongo', 'test')
      await createPIN(page)
      await page.getByRole('button', { name: 'In Progress' }).click()
      await page.getByRole('button', { name: 'Field Agents' }).click()

      await page
        .getByRole('button', {
          name: `${declaration.deceased.name.firstNames}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Update', exact: true }).click()
    })

    test('9.2.2 Verify informations in review page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * * should require
       * - Deceased's Family Name
       * - Change button
       */
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.firstNames
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expect(page.locator('#deceased-content #Date')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText(declaration.deceased.nationality)
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText('Change')

      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deceased-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.country
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.district
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.province
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        'Change'
      )

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
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'No'
      )
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Place of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expect(page.locator('#informant-content #Informant')).toContainText(
        declaration.informantType
      )
      await expect(page.locator('#informant-content #Informant')).toContainText(
        'Change'
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

      await expect(page.locator('#spouse-content #Full')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#spouse-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expect(page.locator('#spouse-content #Date')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#spouse-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        'Farajaland'
      )
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expect(page.locator('#spouse-content #Type')).toContainText(
        REQUIRED
      )
      await expect(page.locator('#spouse-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Usual')).toContainText('Yes')
    })
  })
})
