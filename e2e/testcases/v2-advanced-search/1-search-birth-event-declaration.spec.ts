import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

test.describe.serial('Advanced Search - Birth Event Declaration', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1 - Validate log in and load search page', async () => {
    await loginToV2(page)

    await page.click('#searchType')
    await expect(page.getByText('Advanced Search')).toBeVisible()
  })

  test('1.2 - Validate navigating to advanced search', async () => {
    await page.click('#advanced-search')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await expect(
      page.getByText('Select the options to build an advanced search.')
    ).toBeVisible()
  })

  test('1.3 - Validate display child details when selecting Birth', async () => {
    await page.getByText('Birth').click()
    await expect(page.getByText('Child details')).toBeVisible()
  })

  test('1.4 - Validate Search button disabled when form is incomplete', async () => {
    const searchButton = page.locator('#search')
    await expect(searchButton).toBeDisabled()
  })

  test.describe.serial('1.5 - Validate search by Child DOB & Gender', () => {
    let record: Awaited<ReturnType<typeof createDeclaration>>
    let fullNameOfChild: string
    let yyyy: string, mm: string, dd: string

    test.beforeAll(async () => {
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
        //@ts-ignore
        'child.reason': 'Other', // needed for late dob value
        'child.gender': 'female'
      })
      ;[yyyy, mm, dd] = record.declaration['child.dob'].split('-')
      fullNameOfChild =
        record.declaration['child.firstname'] +
        ' ' +
        record.declaration['child.surname']
    })

    test('1.5.1 - Validate filling DOB and gender filters', async () => {
      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)

      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()
    })

    test('1.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.getByText('Search Results')).toBeVisible()
      await expect(page.getByText(fullNameOfChild)).toBeVisible()
    })
  })
})
