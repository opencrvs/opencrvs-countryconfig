import { test, expect, type Page } from '@playwright/test'
import {
  createPIN,
  drawSignature,
  goToSection,
  login,
  uploadImage
} from '../../../helpers'
import faker from '@faker-js/faker'

test.describe.serial('7. Birth declaration case - 7', () => {
  let page: Page
  const required = 'Required for registration'
  const declaration = {
    child: {
      name: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.lastName()
      }
    },
    attendantAtBirth: 'None',
    informantType: 'Legal guardian',
    mother: {
      detailsDontExist: true
    },
    father: {
      detailsDontExist: true
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('7.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, 'k.bwalya', 'test')
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.1 Fill child details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.child.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.child.name.familyName)

      await page.locator('#attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.2 Fill informant details', async () => {
      await page.waitForTimeout(500)
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("7.1.3 Fill mother's details", async () => {
      await page.getByLabel("Mother's details are not available").check()
      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("7.1.4 Fill father's details", async () => {
      await page.getByLabel("Father's details are not available").check()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.5 Add supporting documents', async () => {
      goToSection(page, 'documents')
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForChildDOB"]')
      )
      await page
        .locator('#uploadDocForInformant')
        .getByText('Select...')
        .click()
      await page.getByText('Birth certificate', { exact: true }).click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForInformant"]')
      )
      await page
        .locator('#uploadDocForProofOfLegalGuardian')
        .getByText('Select...')
        .click()
      await page
        .getByText('Proof of legal guardianship', { exact: true })
        .click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForProofOfLegalGuardian"]')
      )
    })

    test('7.1.6 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test('7.1.7 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.firstNames
      )
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )
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
       * - Reason of why mother's details not available
       */
      await expect(page.locator('#mother-content #Reason')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.locator('#father-content #Reason')).toContainText(
        required
      )
    })

    test('7.1.8 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('7.1.9 Send for review', async () => {
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
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('7.2 Declaration Review by RA', async () => {
    test('7.2.1 Navigate to the declaration review page', async () => {
      await login(page, 'f.katongo', 'test')
      await createPIN(page)
      await page.getByRole('button', { name: 'In Progress' }).click()
      await page.getByRole('button', { name: 'Field Agents' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Update', exact: true }).click()
    })

    test('7.2.2 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.firstNames
      )
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )
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
       * - Reason of why mother's details not available
       */
      await expect(page.locator('#mother-content #Reason')).toContainText(
        required
      )

      /*
       * Expected result: should require
       * - Reason of why father's details not available
       */
      await expect(page.locator('#father-content #Reason')).toContainText(
        required
      )
    })
  })
})