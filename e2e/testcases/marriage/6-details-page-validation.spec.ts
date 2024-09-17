import { expect, test } from '@playwright/test'
import { continueForm, createPIN, goToSection, login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe('6. Validate Marriage details page', () => {
  test.beforeEach(async ({ page }) => {
    await login(
      page,
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createPIN(page)
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByPlaceholder('dd').fill('02')
    await page.getByPlaceholder('mm').fill('03')
    await page.getByPlaceholder('yyyy').fill('1995')
    await continueForm(page)
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1993')
    await continueForm(page)
  })

  test('1.1. Enter date Less than the current date But after Groom and Bride DOB', async ({
    page
  }) => {
    const pastDate = new Date()
    pastDate.setDate(new Date().getDate() - 2)
    const [yyyy, mm, dd] = pastDate.toISOString().split('T')[0].split('-')

    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await expect(
      page.getByText('Illegal age of marriage', { exact: true })
    ).toBeHidden()
    await expect(
      page.getByText('Required for registration. Enter a valid date', {
        exact: true
      })
    ).toBeHidden()
  })

  test('1.2. Enter future date', async ({ page }) => {
    const futureDate = new Date()
    futureDate.setDate(new Date().getDate() + 5)
    const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

    await page.getByPlaceholder('dd').fill(dd)
    await page.getByPlaceholder('mm').fill(mm)
    await page.getByPlaceholder('yyyy').fill(yyyy)
    await page.locator('#typeOfMarriage').click()
    await expect(page.locator('#marriageDate_error')).toHaveText(
      'Required for registration. Enter a valid date'
    )
  })
  test('1.3. Keep field as null', async ({ page }) => {
    await goToSection(page, 'preview')
    await expect(
      page.locator('#required_label_marriageEvent_marriageDate')
    ).toBeVisible()
  })
  test('1.4. Enter date Less than the current date But before Groom and Bride DOB', async ({
    page
  }) => {
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1960')
    await page.getByText('Marriage details').click()
    await expect(page.locator('#marriageDate_error')).toBeVisible()
  })

  test('2.1. Select any country from the "Country" dropdown field, Default value is Farajaland', async ({
    page
  }) => {
    await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    await page.locator('#countryPlaceofmarriage').click()
    await page.getByText('Estonia', { exact: true }).click()
    await expect(
      page.getByText('Estonia', {
        exact: true
      })
    ).toBeVisible()
  })
  test('2.2. Select any Province from "Province" dropdown field, Default value is Central', async ({
    page
  }) => {
    await expect(page.getByText('Central', { exact: true })).toBeVisible()
    await page.locator('#statePlaceofmarriage').click()
    await page.getByText('Sulaka', { exact: true }).click()
    await expect(
      page.getByText('Sulaka', {
        exact: true
      })
    ).toBeVisible()
  })
  test('2.3. Select any district from "District" dropdown field, Default value is Ibombo', async ({
    page
  }) => {
    await expect(page.getByText('Ibombo', { exact: true })).toBeVisible()
    await page.locator('#districtPlaceofmarriage').click()
    await page.getByText('Isamba', { exact: true }).click()
    await expect(
      page.getByText('Isamba', {
        exact: true
      })
    ).toBeVisible()
  })
  test('2.4. Select Urban address', async ({ page }) => {
    const townValue = 'My town'
    const residentalAreaValue = 'My residential area'
    const streetValue = 'My street'
    const phoneValue = '09123456'
    const postalCodeValue = '00120'
    await page.locator("[name='cityPlaceofmarriage']").fill(townValue)
    await page
      .locator("[name='addressLine1UrbanOptionPlaceofmarriage']")
      .fill(residentalAreaValue)
    await page
      .locator("[name='addressLine2UrbanOptionPlaceofmarriage']")
      .fill(streetValue)
    await page
      .locator("[name='addressLine3UrbanOptionPlaceofmarriage']")
      .fill(phoneValue)
    await page
      .locator("[name='postalCodePlaceofmarriage']")
      .fill(postalCodeValue)
  })
  test('2.5. Select Rural address', async ({ page }) => {
    await page.getByText('Rural', { exact: true }).click()
    await page
      .locator('#addressLine1RuralOptionPlaceofmarriage')
      .fill('My village')
  })
  test('3 Select any of the following options from Type of marriage dropdown', async ({
    page
  }) => {
    await page.locator('#typeOfMarriage').click()
    await page.getByText('Polygamous', { exact: true }).click()
    await expect(page.getByText('Polygamous', { exact: true })).toBeVisible()
    await page.getByText('Continue', { exact: true }).click()
    await expect(
      page.getByText('Witness 1 details', { exact: true })
    ).toBeVisible()
  })
})
