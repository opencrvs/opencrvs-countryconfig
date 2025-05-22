import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { getAllLocations, getLocationIdByName } from '../birth/helpers'

test.describe
  .serial('Advanced Search - Birth Event Declaration - Child details', () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let fullNameOfChild = ''
  let facilityId = ''

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    const locations = await getAllLocations('HEALTH_FACILITY')
    facilityId = getLocationIdByName(locations, 'Shifwankula Health Post') ?? ''

    const record: Awaited<ReturnType<typeof createDeclaration>> =
      await createDeclaration(token, {
        'child.dob': faker.date
          // Randomly chosen DOB between 2010-01-01 and 2020-12-31
          // Ensures the created record appears on the first page of search results
          .between({ from: '2010-01-01', to: '2020-12-31' })
          .toISOString()
          .split('T')[0],
        'child.reason': 'Other', // needed for late dob value
        'child.gender': 'female',
        'child.placeOfBirth': 'FACILITY',
        'child.birthLocation': facilityId
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

  test.describe.serial('2.5 - Validate search by Child DOB & Gender', () => {
    test('2.5.1 - Validate filling DOB and gender filters', async () => {
      await page.getByText('Child details').click()

      await page.locator('[data-testid="child____dob-dd"]').fill(dd)
      await page.locator('[data-testid="child____dob-mm"]').fill(mm)
      await page.locator('[data-testid="child____dob-yyyy"]').fill(yyyy)

      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByText('Event details').click()
      await page.locator('#child____birthLocation').fill('Shifwankula')
      await expect(page.getByText('Shifwankula Health Post')).toBeVisible()
      await page.getByText('Shifwankula Health Post').click()
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.url()).toContain(
        `child.dob=${yyyy}-${mm}-${dd}&child.gender=female&child.birthLocation=${facilityId}`
      )
      await expect(page.getByText('Search Results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      await expect(
        page.getByText(`Child Date of birth: ${yyyy}-${mm}-${dd}`)
      ).toBeVisible()
      await expect(page.getByText('Child Sex: Female')).toBeVisible()
      await expect(
        page.getByText('Child Location of birth: Shifwankula Health Post')
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfChild)).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(
        `child.birthLocation=${facilityId}&child.dob=${yyyy}-${mm}-${dd}&child.gender=female&eventType=v2.birth`
      )
      await expect(page.locator('#tab_v2\\.birth')).toHaveText('Birth')

      await expect(page.getByTestId('child____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('child____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('child____dob-yyyy')).toHaveValue(yyyy)

      await expect(page.getByTestId('select__child____gender')).toContainText(
        'Female'
      )
      await expect(page.locator('#child____birthLocation')).toHaveValue(
        'Shifwankula Health Post'
      )
    })
  })
})
