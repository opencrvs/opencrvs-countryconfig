import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  goToSection,
  login,
  switchEventTab
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { ensureAssigned, ensureOutboxIsEmpty, selectAction } from '../../utils'

test.describe.serial('Approval of late birth registration', () => {
  let page: Page
  const childName = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with birth date from over a year ago', async () => {
      await page.locator('#firstname').fill(childName.firstNames)
      await page.locator('#surname').fill(childName.familyName)
      await page.locator('#child____gender').click()
      await page.getByText('Male', { exact: true }).click()

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('2019')
      await page.locator('#child____reason').fill('Late registration reason')

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText('Health Institution', {
          exact: true
        })
        .click()
      await page
        .locator('#child____birthLocation')
        .fill('Golden Valley Rural Health Centre'.slice(0, 3))
      await page.getByText('Golden Valley Rural Health Centre').click()

      await continueForm(page)
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText('Mother', {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1991')

      await page.locator('#mother____idType').click()
      await page.getByText('None', { exact: true }).click()

      await continueForm(page)
    })

    test("Fill father's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('male'))
      await page.locator('#surname').fill(faker.person.lastName('male'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1985')

      await page.locator('#father____idType').click()
      await page.getByText('None', { exact: true }).click()

      await page.locator('#father____nationality').click()
      await page.getByText('Gabon', { exact: true }).click()

      await page.locator('#father____addressSameAs_YES').click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await ensureOutboxIsEmpty(page)
      await page.getByText('Sent for review').click()
    })
  })

  test.describe('Declaration Review by RA', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByText('Ready for review').click()
      await page
        .getByRole('button', {
          name: formatName(childName)
        })
        .click()

      await ensureAssigned(page)
    })

    test("Event should have the 'Approval required for late registration' flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    // @TODO: This test should be added after action conditionals are implemented
    test.skip('RA should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })

  test.describe('Declaration Review by LR', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.getByText('Ready for review').click()
      await page
        .getByRole('button', {
          name: formatName(childName)
        })
        .click()

      await ensureAssigned(page)
    })

    test("Event should have the 'Approval required for late registration' flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test('Approve', async () => {
      await selectAction(page, 'Approve')
      await expect(
        page.getByText(
          'This birth has been registered late. You are now approving it for further validation and registration.'
        )
      ).toBeVisible()

      await page.getByRole('button', { name: 'Confirm' }).click()
    })

    test('Validate flag is removed after approval', async () => {
      await page.getByTestId('navigation_workqueue_in-review-all').click()
      await page
        .getByRole('button', {
          name: formatName(childName)
        })
        .click()
      await ensureAssigned(page)

      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    test('Validate that action appears in audit trail', async () => {
      await switchEventTab(page, 'Audit')

      await page.getByRole('button', { name: 'Approved', exact: true }).click()
    })
  })
})
