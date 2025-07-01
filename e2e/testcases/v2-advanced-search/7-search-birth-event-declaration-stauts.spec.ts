import { expect, test, type Page } from '@playwright/test'
import { loginToV2 } from '../../helpers'
// import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
// import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
// import { formatDateToLongString } from './utils'
// import { getMonthFormatted } from './helper'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Informant's details", () => {
  let page: Page
  let firstname: string
  let surname: string

  test.beforeAll(async ({ browser }) => {
    firstname = faker.person.firstName()
    surname = faker.person.firstName()
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 Fill child details and create a draft birth declaration', async () => {
    await loginToV2(page)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#firstname').fill(firstname)
    await page.locator('#surname').fill(surname)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText(/seconds ago/)).toBeVisible()
  })

  test('7.2 - Validate loading search page', async () => {
    // await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test('7.3 - Validate filling name and dob filters', async () => {
    await page.getByText('Registration details').click()

    await page.locator('#event____status').click()
    await expect(page.getByText('Created')).toBeHidden()
    await page.getByText(/^Any status$/).click()

    await page.getByText('Child details').click()

    await page.locator('#firstname').fill(firstname)
    await page.locator('#surname').fill(surname)
    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
  })
})
