import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
test.describe.serial('5. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('5.1 Basic UI check', async () => {
    test('5.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PERFORMANCE_MANAGER)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('5.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '3' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Musopelo Health Post/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Musopelo Health Post/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('5.1.2 Verify Province -> District -> District Office(No Data)', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()

      await page
        .getByRole('button', { name: /Chishi Rural Health Centre/ })
        .click()
      await expect(page.locator('#content-name')).toHaveText(
        /Chishi Rural Health Centre/
      )
      await expect(
        page.getByText('Funabuli, Pualula', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('5.1.3 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Ilanga District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ilanga District Office/
      )
      await expect(
        page.getByText('Ilanga, Sulaka', { exact: true })
      ).toBeVisible()
    })

    test('5.1.4 Verify team page member list of District Office', async () => {
      const members = [
        'Alex Ngonga',
        'Derrick Bulaya',
        'Joshua Mutale',
        'Patrick Gondwe'
      ]

      for (const member of members) {
        const row = page.getByRole('row', { name: new RegExp(member) })
        await expect(row.getByText('Active')).toBeVisible()
        await expect(row.getByRole('button', { name: member })).toBeDisabled()
      }
    })

    test('5.1.5 Verify Embassy Office', async () => {
      await page.getByRole('button', { name: 'Organisation' }).click()
      await page.getByRole('button', { name: 'France Embassy Office' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'France Embassy Office'
      )
      const row1 = page.getByRole('row', { name: /Tiwonge Mwila/ })
      await expect(row1.getByText('Active')).toBeVisible()
      await expect(row1.getByText('Embassy Official')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Tiwonge Mwila' })
      await expect(button1).toBeDisabled()
    })
  })
})
