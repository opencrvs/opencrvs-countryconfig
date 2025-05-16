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
      await expect(page.url()).toContain(
        `child.dob=${yyyy}-${mm}-${dd}&child.gender=female`
      )
      await expect(page.getByText('Search Results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event : V2 birth')).toBeVisible()
      await expect(
        page.getByText(`Child dob : ${yyyy}-${mm}-${dd}`)
      ).toBeVisible()
      await expect(page.getByText('Child gender : female')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfChild)).toBeVisible()
    })

    test('1.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(
        `child.dob=${yyyy}-${mm}-${dd}&child.gender=female&eventType=v2.birth`
      )
      await expect(page.locator('#tab_v2.birth')).toHaveText('Birth')

      await expect(page.getByPlaceholder('dd')).toHaveValue(dd)
      await expect(page.getByPlaceholder('mm')).toHaveValue(mm)
      await expect(page.getByPlaceholder('yyyy')).toHaveValue(yyyy)
      await expect(page.locator('#child____gender-form-input')).toHaveText(
        'Female'
      )
    })
  })
})
