import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { formatDateToLongString } from './utils'
import { getMonthFormatted } from './helper'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Informant's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let record: Awaited<ReturnType<typeof createDeclaration>>

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    record = await createDeclaration(token, {}, 'REGISTER', 'HEALTH_FACILITY')
    ;[yyyy, mm, dd] = record.declaration['informant.dob'].split('-')
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('2.1 - Validate log in and load search page', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test.describe.serial("2.5 - Validate search by Informant's details", () => {
    test('2.5.1 - Validate filling name and dob filters', async () => {
      await page.getByText('Informant details').click()

      await page
        .locator('#firstname')
        .fill(record.declaration['informant.name'].firstname)
      await page
        .locator('#surname')
        .fill(record.declaration['informant.name'].surname)

      await page.locator('[data-testid="informant____dob-dd"]').fill(dd)
      await page.locator('[data-testid="informant____dob-mm"]').fill(mm)
      await page.locator('[data-testid="informant____dob-yyyy"]').fill(yyyy)
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.url()).toContain(`informant.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(
        `informant.name=${encodeURIComponent(JSON.stringify({ firstname: record.declaration['informant.name'].firstname, middlename: '', surname: record.declaration['informant.name'].surname }))}`
      )
      await expect(page.getByText('Search results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      await expect(
        page.getByText(
          `Informant's Date of birth: ${formatDateToLongString(record.declaration['informant.dob'])}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(
          `Informant's Name: ${record.declaration['informant.name'].firstname} ${record.declaration['informant.name'].surname}`
        )
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(`informant.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(
        `informant.name=${encodeURIComponent(JSON.stringify({ firstname: record.declaration['informant.name'].firstname, surname: record.declaration['informant.name'].surname, middlename: '' }))}`
      )
      await expect(page.locator('#tab_v2\\.birth')).toHaveText('Birth')
      await expect(page.getByTestId('informant____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('informant____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('informant____dob-yyyy')).toHaveValue(yyyy)
      await expect(page.locator('#firstname')).toHaveValue(
        record.declaration['informant.name'].firstname
      )
      await expect(page.locator('#surname')).toHaveValue(
        record.declaration['informant.name'].surname
      )
    })

    test('2.5.4 - Validate informant.dob range input', async () => {
      const informantDOBRangeButton = page.locator(
        '#informant____dob-date_range_button'
      )
      if (await informantDOBRangeButton.isVisible()) {
        await page.locator('#informant____dob-date_range_button').click()
        await expect(page.locator('#picker-modal')).toBeVisible()

        const currentMonth = new Date().getMonth() + 1
        const shortMonth = getMonthFormatted(currentMonth)
        const month = getMonthFormatted(currentMonth, { month: 'long' })
        await expect(
          page.getByRole('button', { name: shortMonth })
        ).toHaveCount(2)
        await expect(page.locator('#date-range-confirm-action')).toBeVisible()

        await page.locator('#date-range-confirm-action').click()
        await expect(page.locator('#picker-modal')).toBeHidden()

        const checkbox = page.locator(
          'input[type="checkbox"][name="informant____dobdate_range_toggle"]'
        )
        await expect(checkbox).toBeVisible()
        await expect(checkbox).toBeChecked()

        const currentYear = new Date().getFullYear()
        const lastYear = currentYear - 1
        // ex: 'May 2024 to May 2025' is visible after date range selection
        await expect(
          page.getByText(`${month} ${lastYear} to ${month} ${currentYear}`)
        ).toBeVisible()
      }
    })
  })
})
