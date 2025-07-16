import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { formatDateToLongString } from './utils'
import { getAllLocations, getLocationIdByName } from '../birth/helpers'
import { type } from '../../v2-utils'

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
      record.declaration['child.name'].firstname +
      ' ' +
      record.declaration['child.name'].surname
    facilityId = record.declaration['child.birthLocation'] ?? ''
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('3.1 - Validate log in and load search page', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test.describe.serial("3 - Validate search by Child's DOB & Gender", () => {
    test('3.1.1 - Validate filling DOB and gender filters', async () => {
      await page.getByText('Child details').click()

      await type(
        page,
        '[data-testid="text__firstname"]',
        record.declaration['child.name'].firstname
      )
      await type(
        page,
        '[data-testid="text__surname"]',
        record.declaration['child.name'].surname
      )

      await type(page, '[data-testid="child____dob-dd"]', dd)
      await type(page, '[data-testid="child____dob-mm"]', mm)
      await type(page, '[data-testid="child____dob-yyyy"]', yyyy)

      await page.locator('#child____gender').click()
      await page.getByText('Female', { exact: true }).click()

      await page.getByText('Event details').click()
      await page.locator('#child____placeOfBirth').click()
      await expect(
        page.getByText('Health Institution', { exact: true })
      ).toBeVisible()
      await page.getByText('Health Institution', { exact: true }).click()

      await page.locator('#child____birthLocation').fill('Ibombo Rural')
      await expect(page.getByText('Ibombo Rural Health Centre')).toBeVisible()
      await page.getByText('Ibombo Rural Health Centre').click()
    })

    test('3.1.2 - Validate search and show results', async () => {
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
      await expect(page.getByText(fullNameOfChild).last()).toBeVisible()
    })

    test('3.1.3 - Validate clicking on the search edit button', async () => {
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

test.describe
  .serial("Advanced Search - Birth Event Declaration - Child's Residential Address", () => {
  let page: Page
  let fullNameOfChild = ''
  let province = ''
  let district = ''
  let record: Awaited<ReturnType<typeof createDeclaration>>
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    const locations = await getAllLocations('ADMIN_STRUCTURE')
    province = getLocationIdByName(locations, 'Central')!
    district = getLocationIdByName(locations, 'Ibombo')!

    if (!province || !district) {
      throw new Error('Province or district not found')
    }

    record = await createDeclaration(
      token,
      {
        'child.dob': faker.date
          // Randomly chosen DOB between 2010-01-01 and 2020-12-31
          // Ensures the created record appears on the first page of search results
          .between({ from: '2010-01-01', to: '2020-12-31' })
          .toISOString()
          .split('T')[0],
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.address.privateHome': {
          addressType: 'DOMESTIC',
          country: 'FAR',
          province: province,
          district: district,
          urbanOrRural: 'URBAN',
          town: 'Dhaka'
        },
        'child.reason': 'Other', // needed for late dob value
        'child.gender': 'female'
      },
      'REGISTER',
      'PRIVATE_HOME'
    )

    fullNameOfChild =
      record.declaration['child.name'].firstname +
      ' ' +
      record.declaration['child.name'].surname
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('3.2 - Validate log in and load search page', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test.describe.serial("3 - Validate search by Child's Place of Birth", () => {
    test('3.2.1 - Validate filling Place of Birth', async () => {
      await page.getByText('Event details').click()

      await page.locator('#child____placeOfBirth').click()
      await expect(
        page.getByText('Residential address', { exact: true })
      ).toBeVisible()
      await page.getByText('Residential address', { exact: true }).click()

      await page.locator('#country').getByText('Farajaland')
      await page.locator('#province').getByText('Central')
      await page.locator('#district').getByText('Ibombo')

      await page.locator('#town').fill('Dhaka')
      await page.locator('#town').blur()
    })

    test('3.2.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)

      const searchParams = new URLSearchParams(page.url())
      const address = searchParams.get('child.address.privateHome')
      if (address !== null) {
        await expect(JSON.parse(address)).toBe({
          country: 'FAR',
          province: '579fa8c2-7bc9-4ca3-8163-9a66a0936a8d',
          district: 'e37806ef-ccf6-4ec0-ad9a-afd3d80d4655',
          urbanOrRural: 'URBAN',
          town: 'Dhaka',
          addressType: 'DOMESTIC'
        })
      }

      await expect(page.getByText('Search results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 birth')).toBeVisible()
      await expect(
        page.getByText(`Location of birth: Farajaland, Central, Ibombo, Dhaka`)
      ).toBeVisible()
      await expect(
        page.getByText('Place of delivery: Residential address')
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfChild).last()).toBeVisible()
    })

    test('3.2.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      const searchParams = new URLSearchParams(page.url())
      const address = searchParams.get('child.address.privateHome')
      if (address !== null) {
        await expect(JSON.parse(address)).toBe({
          country: 'FAR',
          province: '579fa8c2-7bc9-4ca3-8163-9a66a0936a8d',
          district: 'e37806ef-ccf6-4ec0-ad9a-afd3d80d4655',
          urbanOrRural: 'URBAN',
          town: 'Dhaka',
          addressType: 'DOMESTIC'
        })
      }
      await expect(page.url()).toContain(`child.placeOfBirth=PRIVATE_HOME`)
      await expect(page.url()).toContain(`eventType=v2.birth`)

      await expect(page.locator('#country')).toHaveText('Farajaland')
      await expect(page.locator('#province')).toHaveText('Central')
      await expect(page.locator('#district')).toHaveText('Ibombo')
      await expect(page.locator('#town')).toHaveValue('Dhaka')
    })
  })
})
