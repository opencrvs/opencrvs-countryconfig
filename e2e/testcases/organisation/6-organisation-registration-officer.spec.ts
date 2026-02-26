import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable, verifyMembersEnabled } from '../birth/helpers'
test.describe.serial('6. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('6.1 Basic UI check', async () => {
    test('6.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('6.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ezhi/ }).click()
      const pageNavigator = page.getByRole('button', { name: '3', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Nthonkho Rural Health Centre/ })
      ).toBeDisabled()
    })
    test('6.1.2 Verify Province -> District -> District Office(No Data)', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()

      await expect(
        page.getByRole('button', { name: /Chishi Rural Health Centre/ })
      ).toBeDisabled()
    })
    test('6.1.3 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Ilanga District Office/ })
      ).toBeDisabled()
    })
    test('6.1.4 Verify team page member list of District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()

      const pageNavigator = page.getByRole('button', { name: '4', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()

      const enabledMembers = [
        'Mitchell Owen',
        'Emmanuel Mayuka',
        'Kennedy Mweene',
        'Kalusha Bwalya'
      ]

      await verifyMembersEnabled(page, enabledMembers)
    })
  })
})
