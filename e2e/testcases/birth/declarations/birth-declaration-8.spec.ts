import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  createPIN,
  drawSignature,
  expectOutboxToBeEmpty,
  goToSection,
  login
} from '../../../helpers'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('8. Birth declaration case - 8', () => {
  let page: Page
  const required = 'Required for registration'
  const declaration = {
    informantType: 'Someone else',
    informant: {
      relation: 'Uncle'
    },
    mother: {
      maritalStatus: 'Not stated'
    },
    father: {
      maritalStatus: 'Not stated'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.FIELD_AGENT.USERNAME,
        CREDENTIALS.FIELD_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('8.1.1 Fill child details', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('8.1.2 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      /*
       * Expected result: should show additional fields:
       * - Relationship to child
       */
      await page
        .locator('#otherInformantType')
        .fill(declaration.informant.relation)

      await continueForm(page)
    })

    test("8.1.3 Fill mother's details", async () => {
      await page.locator('#maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await continueForm(page)
    })

    test("8.1.4 Fill father's details", async () => {
      await page.locator('#maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('8.1.5 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('8.1.6 Verify information on preview page', async () => {
      /*
       * Expected result: should require
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(required)
      await expect(page.locator('#child-content #Full')).toContainText(required)
      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.locator('#informant-content')).toContainText(
        declaration.informantType
      )
      await expect(page.locator('#informant-content')).toContainText(
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        required
      )
      /*
       * Expected result: should require
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Informant's date of birth
       */
      await expect(page.locator('#informant-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Informant's Type of Id
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's date of birth
       */
      await expect(page.locator('#mother-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(page.locator('#mother-content #Marital')).toContainText(
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.locator('#mother-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.locator('#father-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#father-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.locator('#father-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.locator('#father-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(page.locator('#father-content #Marital')).toContainText(
        declaration.father.maritalStatus
      )
    })

    test('8.1.7 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('8.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expectOutboxToBeEmpty(page)
    })
  })

  test.describe('8.2 Declaration Review by RA', async () => {
    test('8.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'In Progress' }).click()
      await page.getByRole('button', { name: 'Field Agents' }).click()

      await expect(page.locator('#name_0')).toBeVisible()
      const [firstButton] = await page
        .getByRole('button', {
          name: 'No name provided'
        })
        .all()
      await firstButton.click()

      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Update', exact: true }).click()
    })

    test('8.2.2 Verify information on preview page', async () => {
      /*
       * Expected result: should require
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(required)
      await expect(page.locator('#child-content #Full')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(required)

      /*
       * Expected result: should require
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(page.locator('#informant-content')).toContainText(
        declaration.informantType
      )
      await expect(page.locator('#informant-content')).toContainText(
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Must be a valid email address'
      )
      /*
       * Expected result: should require
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Informant's date of birth
       */
      await expect(page.locator('#informant-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Informant's Type of Id
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#mother-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Mother's date of birth
       */
      await expect(page.locator('#mother-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(page.locator('#mother-content #Marital')).toContainText(
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should require
       * - Mother's Type of Id
       */
      await expect(page.locator('#mother-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.locator('#father-content #Full')).toContainText(
        required
      )
      await expect(page.locator('#father-content #Full')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Father's date of birth
       */
      await expect(page.locator('#father-content #Date')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Father's Type of Id
       */
      await expect(page.locator('#father-content #Type')).toContainText(
        required
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(page.locator('#father-content #Marital')).toContainText(
        declaration.father.maritalStatus
      )
    })
  })
})
