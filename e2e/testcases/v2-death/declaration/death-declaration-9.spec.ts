import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  goToSection,
  loginToV2
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../../constants'
import { selectAction } from '../../../v2-utils'

test.describe.serial('9. Death declaration case - 9', () => {
  let page: Page
  async function expectRowValueWithChangeButton(
    fieldName: string,
    assertionText: string
  ) {
    await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
      assertionText
    )

    await expect(page.getByTestId(`change-button-${fieldName}`)).toBeVisible()
  }
  const REQUIRED = 'Required for registration'
  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      nationality: 'Farajaland',
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo'
      }
    },
    informant: {
      relation: 'Grandson'
    }
  }
  const annotation = {
    review: {
      comment: "He was a great person, we'll miss him"
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('9.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.1 Fill deceased details', async () => {
      await page.locator('#firstname').fill(declaration.deceased.name.firstname)
      await page.locator('#surname').fill(declaration.deceased.name.surname)
      await continueForm(page)
    })

    test('9.1.2 Fill event details', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informant.relation, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('9.1.4 Go to preview', async () => {
      await goToSection(page, 'review')
    })

    test('9.1.5 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.gender', REQUIRED)

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.dob', REQUIRED)

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.nationality', 'Farajaland')
      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.idType', REQUIRED)

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district
      )

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton('eventDetails.date', REQUIRED)

      /*
       * Expected result: should require
       * - Place of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.placeOfDeath',
        REQUIRED
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton('informant.email', REQUIRED)

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton('spouse.name', REQUIRED)

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.dob', REQUIRED)

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.nationality', 'Farajaland')

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.idType', REQUIRED)

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.addressSameAs', 'Yes')
    })

    test('9.1.6 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('9.1.7 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue. Handle better after outbox workqueue is implemented
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */
      expect(page.url().includes('assigned-to-you')).toBeTruthy()

      await page.getByText('Sent for review').click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
      ).toBeVisible()
    })
  })

  test.describe('9.2 Declaration Review by RA', async () => {
    test('9.2.1 Navigate to the declaration review page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

      await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue. Handle better after outbox workqueue is implemented
      await page.getByText('Notifications').click()

      await page
        .getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
        .click()
    })

    test('9.2.2 Verify information on review page', async () => {
      await selectAction(page, 'Validate')
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.name',
        declaration.deceased.name.firstname
      )

      /*
       * Expected result: should require
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.gender', REQUIRED)

      /*
       * Expected result: should require
       * - Deceased's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.dob', REQUIRED)

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.nationality', 'Farajaland')
      /*
       * Expected result: should require
       * - Deceased's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton('deceased.idType', REQUIRED)

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district
      )

      /*
       * Expected result: should require
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton('eventDetails.date', REQUIRED)

      /*
       * Expected result: should require
       * - Place of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.placeOfDeath',
        REQUIRED
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should require
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton('informant.email', REQUIRED)

      /*
       * Expected result: should require
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */

      await expectRowValueWithChangeButton('spouse.name', REQUIRED)

      /*
       * Expected result: should require
       * - Spouse's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.dob', REQUIRED)

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.nationality', 'Farajaland')

      /*
       * Expected result: should require
       * - Spouse's Type of Id
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.idType', REQUIRED)

      /*
       * Expected result: should require
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton('spouse.addressSameAs', 'Yes')
    })
  })
})
