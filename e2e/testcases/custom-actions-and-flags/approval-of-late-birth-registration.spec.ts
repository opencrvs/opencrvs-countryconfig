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
import { selectDeclarationAction } from '../birth/helpers'
import { format, subYears, subMonths, subDays } from 'date-fns'

const recentDate = subDays(new Date(), 2)
const recentMonth = format(recentDate, 'MM')
const recentYear = format(recentDate, 'yyyy')

const lateRegDate = subMonths(subYears(recentDate, 1), 6)
const day = format(recentDate, 'dd')
const lateRegMonth = format(lateRegDate, 'MM')
const lateRegYear = format(lateRegDate, 'yyyy')

test.describe.serial('Approval of late birth registration', () => {
  let page: Page

  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameFormatted = formatName(childName)

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
      await page.getByText('Female', { exact: true }).click()

      await page.getByPlaceholder('dd').fill(day)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')

      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#child____birthLocation')
        .fill('Golden Valley Rural Health Centre'.slice(0, 3))
      await page.getByText('Golden Valley Rural Health Centre').click()

      await continueForm(page)
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

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
      await page.getByPlaceholder('yyyy').fill('1980')

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

    test('Declare', async () => {
      await selectDeclarationAction(page, 'Declare')
      await ensureOutboxIsEmpty(page)
      await page.getByText('Sent for review').click()
    })
  })

  test.describe('Declaration Review by RA', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByText('Ready for review').click()
      await page.getByRole('button', { name: childNameFormatted }).click()

      await ensureAssigned(page)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test.skip('RA should not have the option to Approve', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })

  test.describe('Declaration Review by LR', async () => {
    test('Navigate to the declaration review page', async () => {
      await login(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.getByText('Ready for review').click()
      await page.getByRole('button', { name: childNameFormatted }).click()
    })

    test('Unassign', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await page.getByText('Unassign', { exact: true }).click()
      await page.getByRole('button', { name: 'Unassign', exact: true }).click()
      await expect(
        page.getByText('Not assigned', { exact: true })
      ).toBeVisible()
    })

    test('Approve action should be disabled before assignment', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const approveButton = page.getByText('Approve', { exact: true })
      await expect(approveButton).toBeVisible()
      await expect(approveButton).toHaveAttribute('disabled')
      await page.getByRole('button', { name: 'Action', exact: true }).click()
    })

    test('Assign', async () => {
      await ensureAssigned(page)
    })

    test("Event should have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).toBeVisible()
    })

    test('Approve requires notes before confirming', async () => {
      await selectAction(page, 'Approve')
      await expect(
        page.getByText(
          'This birth has been registered late. You are now approving it for further validation and registration.'
        )
      ).toBeVisible()

      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeDisabled()

      // Fill the required notes field
      const notesField = page.locator('#notes')
      await notesField.fill(
        'Approving after verifying all late submission details.'
      )

      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
    })

    test("Validate that the 'Approval required for late registration' -flag is removed after approval", async () => {
      await ensureOutboxIsEmpty(page)
      await page.locator('#searchText').fill(childNameFormatted)
      await page.locator('#searchIconButton').click()
      await page.getByRole('button', { name: childNameFormatted }).click()

      await ensureAssigned(page)

      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    test("Validate that the 'Approve' action is no longer available", async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })

    test('Validate that action and form field value appearing in audit trail', async () => {
      await switchEventTab(page, 'Audit')
      await page.getByRole('button', { name: 'Approved', exact: true }).click()
      await expect(
        page.getByText('Approving after verifying all late submission details.')
      ).toBeVisible()
    })
  })
})

test.describe('Birth with non-late registration will not have flag or Approve-action available', () => {
  let page: Page
  const childName = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female')
  }

  const childNameFormatted = formatName(childName)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe.serial('Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with recent birth date', async () => {
      await page.locator('#firstname').fill(childName.firstNames)
      await page.locator('#surname').fill(childName.familyName)
      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByPlaceholder('dd').fill(day)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)

      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#child____birthLocation')
        .fill('Golden Valley Rural Health Centre'.slice(0, 3))
      await page.getByText('Golden Valley Rural Health Centre').click()

      await continueForm(page)
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill('25')
      await page.getByPlaceholder('mm').fill('11')
      await page.getByPlaceholder('yyyy').fill('1984')

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

    test('Declare', async () => {
      await selectDeclarationAction(page, 'Declare')
      await ensureOutboxIsEmpty(page)
    })

    test('Navigate to the record', async () => {
      await page.getByText('Sent for review').click()
      await page.getByRole('button', { name: childNameFormatted }).click()
    })

    test("Record should not have the 'Approval required for late registration' -flag", async () => {
      await expect(
        page.getByText('Approval required for late registration')
      ).not.toBeVisible()
    })

    test('Record should not have the "Approve"-action available', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      await expect(page.getByText('Approve', { exact: true })).not.toBeVisible()
    })
  })
})

test.describe
  .serial("'Approval required for late registration' -flag blocks direct registration", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Declaration started by Local Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details with birth date from over a year ago', async () => {
      await page.locator('#firstname').fill(faker.person.firstName())
      await page.locator('#surname').fill(faker.person.lastName())
      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByPlaceholder('dd').fill(day)
      await page.getByPlaceholder('mm').fill(lateRegMonth)
      await page.getByPlaceholder('yyyy').fill(lateRegYear)
      await page.locator('#child____reason').fill('Late registration reason')

      await page.locator('#child____placeOfBirth').click()
      await page.getByText('Health Institution', { exact: true }).click()
      await page
        .locator('#child____birthLocation')
        .fill('Golden Valley Rural Health Centre'.slice(0, 3))
      await page.getByText('Golden Valley Rural Health Centre').click()

      await continueForm(page)
    })

    test('Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page.getByText('Mother', { exact: true }).click()

      await page.locator('#informant____email').fill('test@example.com')

      await continueForm(page)
    })

    test("Fill mother's details", async () => {
      await page.locator('#firstname').fill(faker.person.firstName('female'))
      await page.locator('#surname').fill(faker.person.lastName('female'))

      await page.getByPlaceholder('dd').fill('12')
      await page.getByPlaceholder('mm').fill('05')
      await page.getByPlaceholder('yyyy').fill('1980')

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

    test('Direct registration should be unavailable', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const declareButton = page.getByText('Register', { exact: true })
      await expect(declareButton).toBeVisible()
      await expect(declareButton).toHaveAttribute('disabled')
    })

    test('Change child dob to recent date', async () => {
      await page.getByTestId('change-button-child.dob').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.getByPlaceholder('dd').fill(day)
      await page.getByPlaceholder('mm').fill(recentMonth)
      await page.getByPlaceholder('yyyy').fill(recentYear)

      await page.getByRole('button', { name: 'Back to review' }).click()
    })

    test('Direct registration should be available', async () => {
      await page.getByRole('button', { name: 'Action', exact: true }).click()
      const declareButton = page.getByText('Register', { exact: true })
      await expect(declareButton).toBeVisible()
      await expect(declareButton).not.toHaveAttribute('disabled')
    })
  })
})
