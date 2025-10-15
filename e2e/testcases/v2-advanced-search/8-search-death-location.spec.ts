import { expect, test, type Page } from '@playwright/test'
import { loginToV2 } from '../../helpers'

const assertPills = async (page: Page, pills: string[]) => {
  pills.push('Event: Death')
  for (const pill of pills) {
    await expect(page.getByText(pill)).toBeVisible()
  }
}

test.describe("Advanced Search 8 - Death - Deceased's place of death", () => {
  test.beforeEach(async ({ page }) => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Death').click()
    await page.getByText('Event details').click()
  })

  test('8.1 Before selecting a place of death', async ({ page }) => {
    await expect(
      page.getByText('Place of death', { exact: true })
    ).toBeVisible()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).not.toBeVisible()
  })
  test('8.2 Select Health Institution', async ({ page }) => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).toBeVisible()

    await expect(page.getByText('Country')).not.toBeVisible()

    await page.locator('#eventDetails____deathLocation').fill('water')
    await page.getByText('Water FallsRural Health Centre').click()

    await page.getByTestId('search').click()
    await expect(page.getByText(/Search results\s*\(\d+\)/)).toBeVisible()

    await assertPills(page, [
      "Deceased's Health Institution: Water FallsRural Health Centre, Ienge, Pualula, Farajaland",
      'Place of death: Health Institution'
    ])
  })
  test('8.3 Select Residential address', async ({ page }) => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Residential address', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).toBeVisible()

    await page.getByTestId('search').click()
    await expect(page.getByText(/Search results\s*\(\d+\)/)).toBeVisible()

    await assertPills(page, [
      'Usual place of residence: Farajaland, Central, Ibombo',
      'Place of death: Residential address'
    ])
  })
  test('8.4 Select Other', async ({ page }) => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Other', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).toBeVisible()

    await page.getByTestId('search').click()
    await expect(page.getByText(/Search results\s*\(\d+\)/)).toBeVisible()
    await assertPills(page, [
      'Death location address: Farajaland, Central, Ibombo',
      'Place of death: Other'
    ])
  })
})
