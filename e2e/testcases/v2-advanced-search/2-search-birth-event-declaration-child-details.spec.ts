import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { formatDateToLongString } from './utils'
import { getMonthFormatted } from './helper'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Child's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let fullNameOfChild = ''
  let record: Awaited<ReturnType<typeof createDeclaration>>

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    record = await createDeclaration(token, {
      'child.dob': faker.date
        // Randomly chosen DOB between 2010-01-01 and 2020-12-31
        // Ensures the created record appears on the first page of search results
        .between({ from: '2010-01-01', to: '2020-12-31' })
        .toISOString()
        .split('T')[0],
      'child.reason': 'Other', // needed for late dob value
      'child.gender': 'female'
    })
    ;[yyyy, mm, dd] = record.declaration['child.dob'].split('-')
    fullNameOfChild = `${record.declaration['child.name'].firstname} ${record.declaration['child.name'].surname}`
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

  test.describe.serial("2.5 - Validate search by Child's details", () => {
    test('2.5.1 - Validate filling DOB and gender filters', async () => {
      await page.getByText('Child details').click()

      await page
        .locator('#firstname')
        .fill(record.declaration['child.name'].firstname)
      await page
        .locator('#surname')
        .fill(record.declaration['child.name'].surname)

      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.locator('[data-testid="child____dob-dd"]').fill(dd)
      await page.locator('[data-testid="child____dob-mm"]').fill(mm)
      await page.locator('[data-testid="child____dob-yyyy"]').fill(yyyy)
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.url()).toContain(`child.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(`child.gender=female`)
      await expect(page.url()).toContain(
        `child.name=${encodeURIComponent(JSON.stringify({ firstname: record.declaration['child.name'].firstname, middlename: '', surname: record.declaration['child.name'].surname }))}`
      )
      await expect(page.getByText('Search Results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      await expect(
        page.getByText(
          `Child's Date of birth: ${formatDateToLongString(record.declaration['child.dob'])}`
        )
      ).toBeVisible()
      await expect(page.getByText("Child's Sex: Female")).toBeVisible()
      await expect(
        page.getByText(
          `Child's Name: ${record.declaration['child.name'].firstname} ${record.declaration['child.name'].surname}`
        )
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfChild).last()).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(`child.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(`child.gender=female`)
      await expect(page.url()).toContain(
        `child.name=${encodeURIComponent(JSON.stringify({ firstname: record.declaration['child.name'].firstname, surname: record.declaration['child.name'].surname, middlename: '' }))}`
      )
      await expect(page.locator('#tab_v2\\.birth')).toHaveText('Birth')

      await expect(page.getByTestId('child____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('child____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('child____dob-yyyy')).toHaveValue(yyyy)

      await expect(page.getByTestId('select__child____gender')).toContainText(
        'Female'
      )
      await expect(page.locator('#firstname')).toHaveValue(
        record.declaration['child.name'].firstname
      )
      await expect(page.locator('#surname')).toHaveValue(
        record.declaration['child.name'].surname
      )
    })

    test('2.5.4 - Validate child.dob range input', async () => {
      const childDOBRangeButton = page.locator(
        '#child____dob-date_range_button'
      )
      if (await childDOBRangeButton.isVisible()) {
        await page.locator('#child____dob-date_range_button').click()
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
