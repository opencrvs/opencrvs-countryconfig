import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { formatDateToLongString } from './utils'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Child's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let fullNameOfChild = ''
  let facilityId = ''
  let record: Awaited<ReturnType<typeof createDeclaration>>
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    record = await createDeclaration(
      token,
      {
        'child.dob': faker.date
          // Randomly chosen DOB between 2010-01-01 and 2020-12-31
          // Ensures the created record appears on the first page of search results
          .between({ from: '2010-01-01', to: '2020-12-31' })
          .toISOString()
          .split('T')[0],
        'child.reason': 'Other', // needed for late dob value
        'child.gender': 'female'
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )
    ;[yyyy, mm, dd] = record.declaration['child.dob'].split('-')
    fullNameOfChild =
      record.declaration['child.firstname'] +
      ' ' +
      record.declaration['child.surname']
    facilityId = record.declaration['child.birthLocation'] ?? ''
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

  test.describe.serial("2.5 - Validate search by Child's DOB & Gender", () => {
    test('2.5.1 - Validate filling DOB and gender filters', async () => {
      await page.getByText('Child details').click()

      await page.locator('[data-testid="child____dob-dd"]').fill(dd)
      await page.locator('[data-testid="child____dob-mm"]').fill(mm)
      await page.locator('[data-testid="child____dob-yyyy"]').fill(yyyy)

      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByText('Event details').click()
      await page.locator('#child____birthLocation').fill('Ibombo Rural')
      await expect(page.getByText('Ibombo Rural Health Centre')).toBeVisible()
      await page.getByText('Ibombo Rural Health Centre').click()
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.url()).toContain(`child.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(`child.gender=female`)
      await expect(page.url()).toContain(`child.birthLocation=${facilityId}`)
      await expect(page.getByText('Search results')).toBeVisible()

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
          "Child's Location of birth: Ibombo Rural Health Centre, Ibombo, Central, Farajaland"
        )
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfChild)).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(`child.birthLocation=${facilityId}`)
      await expect(page.url()).toContain(`child.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(`child.gender=female`)
      await expect(page.url()).toContain(`eventType=v2.birth`)
      await expect(page.locator('#tab_v2\\.birth')).toHaveText('Birth')

      await expect(page.getByTestId('child____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('child____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('child____dob-yyyy')).toHaveValue(yyyy)

      await expect(page.getByTestId('select__child____gender')).toContainText(
        'Female'
      )
      await expect(page.locator('#child____birthLocation')).toHaveValue(
        'Ibombo Rural Health Centre'
      )
    })
  })
})
