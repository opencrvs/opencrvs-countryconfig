import { expect, test, type Page } from '@playwright/test'
import { loginToV2 } from '../../helpers'

test.describe
  .serial("Advanced Search 8 - Death - Deceased's place of death", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('8.1 Navigate to Advanced Search - Death - Event details', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Death').click()
    await page.getByText('Event details').click()
  })
  test('8.2 Before selecting a place of death', async () => {
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
  test('8.3 Select Health Institution', async () => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Health Institution', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).toBeVisible()
    await expect(page.getByText('Country')).not.toBeVisible()
  })
  test('8.4 Select Usual place of residence', async () => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page
      .getByText("Deceased's usual place of residence", { exact: true })
      .click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).not.toBeVisible()
  })
  test('8.4 Select Other', async () => {
    await page.getByTestId('select__eventDetails____placeOfDeath').click()
    await page.getByText('Other', { exact: true }).click()
    await expect(
      page
        .locator('#eventDetails____deathLocation-form-input')
        .getByText('Health Institution', { exact: true })
    ).not.toBeVisible()
    await expect(page.getByText('Country')).toBeVisible()
  })
})
