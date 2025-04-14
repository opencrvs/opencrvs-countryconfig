import { expect, test } from '@playwright/test'
import { createPIN, login, goToSection } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe('7. Validate Witness 2 details page', () => {
  test.beforeEach(async ({ page }) => {
    await login(
      page,
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createPIN(page)
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await goToSection(page, 'witnessTwo')
  })

  // 1.1. Enter Non-English characters
  test('1.1. Validate "First Name(s)" text field', async ({ page }) => {
    await page.locator('#firstNamesEng').fill('*')
    await page.getByText('Witness 2 details').click()
    await expect(page.locator('#firstNamesEng_error')).toHaveText(
      `Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)`
    )
  })

  test('1.2. Enter less than 33 English characters', async ({ page }) => {
    await page.locator('#firstNamesEng').fill('Rakibul Islam')
    await page.getByText('Witness 2 details').click()

    await expect(page.locator('#firstNamesEng_error')).toBeHidden()
  })

  test('1.3. Enter Field as NULL', async ({ page }) => {
    await page.locator('#firstNamesEng').click()
    await page.locator('#relationship').click()
    await expect(
      page.getByText('Required for registration', { exact: true })
    ).toBeVisible()
  })

  test('1.4. Enter more than 32 English characters', async ({ page }) => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#firstNamesEng').fill(LONG_NAME)
    await page.getByText('Witness 2 details').click()

    await expect(page.locator('#firstNamesEng')).toHaveValue(
      LONG_NAME.slice(0, 32)
    )
  })

  // 2.1. Enter Non-English characters
  test('2.1. Validate "Last Name(s)" text field', async ({ page }) => {
    await page.locator('#familyNameEng').fill('*')
    await page.getByText('Witness 2 details').click()
    await expect(page.locator('#familyNameEng_error')).toBeVisible()
  })

  test('2.2. Enter less than 33 English characters', async ({ page }) => {
    await page.locator('#familyNameEng').fill('Rakibul Islam')
    await page.getByText('Witness 2 details').click()

    await expect(page.locator('#familyNameEng_error')).toBeHidden()
  })

  test('2.3. Enter Field as NULL', async ({ page }) => {
    await page.locator('#familyNameEng').click()
    await page.locator('#relationship').click()
    await expect(
      page.getByText('Required for registration', { exact: true })
    ).toBeVisible()
  })

  test('2.4. Enter more than 32 English characters', async ({ page }) => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#familyNameEng').fill(LONG_NAME)
    await page.getByText('Witness 2 details').click()

    await expect(page.locator('#familyNameEng')).toHaveValue(
      LONG_NAME.slice(0, 32)
    )
  })
  test('3. Select any to the following option from Relationship to spouses:', async ({
    page
  }) => {
    await page.locator('#relationship').click()
    await page.getByText('Other', { exact: true }).click()
    await expect(page.getByText('Other', { exact: true })).toBeVisible()
  })
  test('4. Click continue', async ({ page }) => {
    await page.getByText('Continue', { exact: true }).click()
    await expect(
      page.getByText('Upload supporting documents', { exact: true })
    ).toBeVisible()
  })
})
