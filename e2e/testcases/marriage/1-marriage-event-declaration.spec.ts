import { expect, test } from '@playwright/test'
import { createPIN, login } from '../../helpers'
import { validateSectionButtons } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe('1. Marriage event validation', () => {
  test.beforeEach(async ({ page }) => {
    await login(
      page,
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createPIN(page)
  })

  test('1.1. Navigate to the event declaration page', async ({ page }) => {
    await page.click('#header_new_event')
    await page.waitForSelector('#continue')
  })

  test('Testcase 1', async ({ page }) => {
    await page.click('#header_new_event')

    await test.step('1.1.1 Validate the contents of the event type page', async () => {
      await expect(page.getByText('Birth', { exact: true })).toBeVisible()
      await expect(page.getByText('Death', { exact: true })).toBeVisible()
      await expect(page.getByText('Marriage', { exact: true })).toBeVisible()
      await expect(page.getByText('Exit', { exact: true })).toBeVisible()
      await expect(page.getByText('Continue', { exact: true })).toBeVisible()
    })

    await test.step('1.1.2 Click the "Continue" button without selecting any event', async () => {
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Please select the type of event', { exact: true })
      ).toBeVisible()
    })

    await test.step('1.1.3 Select the "Marriage" event and click "Continue" button', async () => {
      await page.getByText('Marriage', { exact: true }).click()
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText("Informant's details", { exact: true })
      ).toBeVisible()
    })
    // 1.2. Is missing because marriage declaration does not have an "Introduction" page.
    await test.step('1.3.1 Validate the content of the informant page', async () => {
      await validateSectionButtons(page)
      await expect(
        page.locator('label', { hasText: 'Informant type' })
      ).toBeVisible()
      await expect(
        page.locator('label', { hasText: 'Phone number' })
      ).toBeVisible()
      await expect(page.locator('label', { hasText: 'Email' })).toBeVisible()
    })
    // 1.3.2 Is missing because "Informant details" page does not give an error if
    // user click continue and nothing is selected.
    await test.step('1.3.3 Select any option in Informant type > Click Continue', async () => {
      await page.locator('#informantType').click()
      await page.getByText('Groom', { exact: true }).click()
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText("Groom's details", { exact: true })
      ).toBeVisible()
    })
    await test.step('1.4. Validate Groom Details page', async () => {
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText("Bride's details", { exact: true })
      ).toBeVisible()
    })
    await test.step('1.5. Validate Bridge Details page', async () => {
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Marriage details', { exact: true })
      ).toBeVisible()
    })
    await test.step('1.6. Validate Marriage Details page', async () => {
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Witness 1 details', { exact: true })
      ).toBeVisible()
    })
    await test.step('1.7. Validate witness 1 Details page', async () => {
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Witness 2 details', { exact: true })
      ).toBeVisible()
    })
    await test.step('1.8. Validate witness 2 Details page', async () => {
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Upload supporting documents', { exact: true })
      ).toBeVisible()
    })
    await test.step('1.9. Validate Supporting document page', async () => {
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      page.getByText('Register event', { exact: true })
    })
  })
  test('1.11 Validate save and exit button', async ({ page }) => {
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()

    await test.step('1.11.1. & 1.11.2. Validate "Save & Exit" button modal content and cancel', async () => {
      await page.getByText('Save & Exit', { exact: true }).click()
      await expect(
        page.getByText(
          'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?',
          { exact: true }
        )
      ).toBeVisible()
      await expect(page.getByText('Cancel', { exact: true })).toBeVisible()
      await expect(page.getByText('Confirm', { exact: true })).toBeVisible()
      await page.getByText('Cancel', { exact: true }).click()
      await expect(page.getByText('Save & exit?', { exact: true })).toBeHidden()
    })

    await test.step('1.11.3. Confirm "Save & Exit" button', async () => {
      await page.getByText('Save & Exit', { exact: true }).click()
      await page.getByText('Confirm', { exact: true }).click()
      await page.waitForTimeout(500) // because the page is shown twice
      await expect(
        page.getByRole('button', { name: 'In progress' })
      ).toBeVisible()
      await expect(
        page.getByText('No name provided', { exact: true })
      ).toBeVisible()
    })
  })
  test('1.12 Validate exit button', async ({ page }) => {
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()

    await test.step('1.12.1. & 1.12.2. Validate "Exit" button modal content and cancel', async () => {
      await page.getByText('Exit', { exact: true }).click()
      await expect(
        page.getByText('Exit without saving changes?', { exact: true })
      ).toBeVisible()
      await expect(
        page.getByText(
          'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?',
          { exact: true }
        )
      ).toBeVisible()
      await expect(page.getByText('Cancel', { exact: true })).toBeVisible()
      await expect(page.getByText('Confirm', { exact: true })).toBeVisible()
      await page.getByText('Cancel', { exact: true }).click()
      await expect(
        page.getByText('Exit without saving changes?', { exact: true })
      ).toBeHidden()
    })
    await test.step('1.12.3. Confirm "Exit" button', async () => {
      await page.getByText('Exit', { exact: true }).click()

      await page.getByText('Confirm', { exact: true }).click()
      await page.waitForTimeout(500) // because the page is shown twice
      await expect(
        page.getByRole('button', { name: 'In progress' })
      ).toBeVisible()
      await expect(
        page.getByText('No records in progress', { exact: true })
      ).toBeVisible()
    })
  })

  test('1.13 Validate three dot menu button', async ({ page }) => {
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()

    await test.step('1.13.3. Delete declaration from the 3 dot menu', async () => {
      await page.click('#eventToggleMenuToggleButton')
      await page.getByText('Delete declaration', { exact: true }).click()
      await page.getByText('Confirm', { exact: true }).click()
      await expect(
        page.getByText('No records in progress', { exact: true })
      ).toBeVisible()
    })
  })
})
