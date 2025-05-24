import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

/**
 * Converts a numeric month value (1–12) to its corresponding short English month name (e.g., "Jan", "Feb").
 *
 * @param {number} month - The month number (1 for January, 12 for December).
 * @returns {string} The short name of the month in English.
 *
 * @example
 * getMonthShortName(1); // returns "Jan"
 * getMonthShortName(12); // returns "Dec"
 */
const getShortMonthName = (month: number) => {
  const arbitraryDate = new Date(2000, month - 1)
  return arbitraryDate.toLocaleString('en-US', { month: 'short' })
}

test.describe
  .serial("Advanced Search - Birth Event Declaration - Child's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let fullNameOfChild = ''

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    const record: Awaited<ReturnType<typeof createDeclaration>> =
      await createDeclaration(token, {
        'child.dob': '2017-04-09',
        'child.reason': 'Other', // needed for late dob value
        'child.gender': 'female'
      })
    ;[yyyy, mm, dd] = record.declaration['child.dob'].split('-')
    fullNameOfChild = `${record.declaration['child.firstname']} ${record.declaration['child.surname']}`
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('2.1 - Validate log in and load search page', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page.getByText('Advanced Search')).toBeVisible()
    await page.click('#advanced-search')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test.describe.serial("2.5 - Validate search by Child's DOB & Gender", () => {
    test('2.5.1 - Validate filling DOB and gender filters', async () => {
      await page.getByText('Child details').click()

      await page.locator('[data-testid="child____dob-dd"]').fill(dd)
      await page.locator('[data-testid="child____dob-mm"]').fill(mm)
      await page.locator('[data-testid="child____dob-yyyy"]').fill(yyyy)

      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.url()).toContain(
        `child.dob=${yyyy}-${mm}-${dd}&child.gender=female`
      )
      await expect(page.getByText('Search Results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      await expect(
        page.getByText(`Child's Date of birth: 9 April 2017`)
      ).toBeVisible()
      await expect(page.getByText("Child's Sex: Female")).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfChild)).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(
        `child.dob=${yyyy}-${mm}-${dd}&child.gender=female&eventType=v2.birth`
      )
      await expect(page.locator('#tab_v2\\.birth')).toHaveText('Birth')

      await expect(page.getByTestId('child____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('child____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('child____dob-yyyy')).toHaveValue(yyyy)

      await expect(page.getByTestId('select__child____gender')).toContainText(
        'Female'
      )
    })

    test('2.5.4 - Validate child.dob range input', async () => {
      const childDOBRangeButton = page.locator(
        '#child____dob-date_range_button'
      )
      if (await childDOBRangeButton.isVisible()) {
        await page.locator('#child____dob-date_range_button').click()
        await expect(page.locator('#picker-modal')).toBeVisible()

        const month = getShortMonthName(new Date().getMonth() + 1)
        await expect(page.getByRole('button', { name: month })).toHaveCount(2)
        await expect(page.locator('#date-range-confirm-action')).toBeVisible()

        await page.locator('#date-range-confirm-action').click()
        await expect(page.locator('#picker-modal')).toBeHidden()

        const checkbox = page.locator(
          'input[type="checkbox"][name="child____dobdate_range_toggle"]'
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
