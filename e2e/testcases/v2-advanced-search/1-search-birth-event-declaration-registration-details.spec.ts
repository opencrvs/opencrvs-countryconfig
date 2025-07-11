import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

const todayDate = `${new Date().getDate() < 10 ? '0' : ''}${new Date().getDate().toString()}`
const thisMonth = `${new Date().getMonth() < 9 ? '0' : ''}${(new Date().getMonth() + 1).toString()}`
const thisYear = new Date().getFullYear().toString()

test.describe
  .serial('Advanced Search - Birth Event Declaration - Registration details', () => {
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

  test('1.1 - Validate log in and load search page', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test.describe
    .serial('1.5 - Validate search by registration details search fields', () => {
    test('1.5.1 - Validate Place of registration filters, Date of registration Status of Record and Time Period', async () => {
      await page.getByText('Registration details').click()

      await page
        .locator('#event____legalStatuses____REGISTERED____createdAtLocation')
        .fill('Ibombo')
      await expect(page.getByText('Ibombo District Office')).toBeVisible()
      await page.getByText('Ibombo District Office').click()

      await page
        .locator(
          '[data-testid="event____legalStatuses____REGISTERED____acceptedAt-dd"]'
        )
        .fill(todayDate)
      await page
        .locator(
          '[data-testid="event____legalStatuses____REGISTERED____acceptedAt-mm"]'
        )
        .fill(thisMonth)
      await page
        .locator(
          '[data-testid="event____legalStatuses____REGISTERED____acceptedAt-yyyy"]'
        )
        .fill(thisYear)

      await expect(
        page.getByRole('button', { name: 'Exact date unknown' })
      ).toBeVisible()

      await expect(page.locator('#event____status')).toBeVisible()
      await page.locator('#event____status').click()
      await expect(page.getByText('Registered')).toBeVisible()
      await page.getByText('Registered').click()
      await expect(page.getByText('Registered')).toHaveCount(2)

      await expect(page.locator('#event____updatedAt')).toBeVisible()
      await page.locator('#event____updatedAt').click()
      await expect(page.getByText('Last 7 days', { exact: true })).toBeVisible()
      await page.getByText('Last 7 days', { exact: true }).click()
      await expect(page.getByText('Last 7 days')).toHaveCount(2)
    })

    test('1.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      // event____legalStatuses____REGISTERED____acceptedAt=2025-05-19&
      await expect(page.url()).toContain(
        `event.legalStatuses.REGISTERED.acceptedAt=${thisYear}-${thisMonth}-${todayDate}`
      )
      // event.legalStatuses.REGISTERED.createdAtLocation=ad207d45-3418-4771-af03-e0759572fcaa&
      await expect(page.url()).toContain(
        `event.legalStatuses.REGISTERED.createdAtLocation=`
      )
      // event.status=REGISTERED&
      await expect(page.url()).toContain(`event.status=REGISTERED&`)
      // event.updatedAt=2025-05-12%2C2025-05-19
      await expect(page.url()).toContain(`event.updatedAt=`)

      await expect(page.getByText('Search result')).toBeVisible()
      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      // Check for each pill
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      await expect(
        page.getByText(
          `Date of registration: ${thisYear}-${thisMonth}-${todayDate}`
        )
      ).toBeVisible()
      await expect(
        page.getByText('Place of registration: Ibombo District Office')
      ).toBeVisible()
      await expect(page.getByText('Status of record: Registered')).toBeVisible()
      await expect(page.getByText('Time period: Last 7 days')).toBeVisible()

      // Check for Edit button
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
    })

    test('1.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      // event____legalStatuses____REGISTERED____createdAt=2025-05-19&
      await expect(page.url()).toContain(
        `event.legalStatuses.REGISTERED.acceptedAt=${thisYear}-${thisMonth}-${todayDate}`
      )
      // event.legalStatuses.REGISTERED.createdAtLocation=ad207d45-3418-4771-af03-e0759572fcaa&
      await expect(page.url()).toContain(
        `event.legalStatuses.REGISTERED.createdAtLocation=`
      )
      // event.status=REGISTERED&
      await expect(page.url()).toContain(`event.status=REGISTERED&`)
      // event.updatedAt=2025-05-12%2C2025-05-19
      await expect(page.url()).toContain(`event.updatedAt=`)
      await expect(page.locator('#tab_v2\\.birth')).toHaveText('Birth')

      await expect(
        page.locator(
          '#event____legalStatuses____REGISTERED____createdAtLocation'
        )
      ).toHaveValue('Ibombo District Office')
      await expect(
        page.locator('#event____legalStatuses____REGISTERED____acceptedAt-dd')
      ).toHaveValue(todayDate)
      await expect(
        page.locator('#event____legalStatuses____REGISTERED____acceptedAt-mm')
      ).toHaveValue(thisMonth)
      await expect(
        page.locator('#event____legalStatuses____REGISTERED____acceptedAt-yyyy')
      ).toHaveValue(thisYear)
    })
  })
})
