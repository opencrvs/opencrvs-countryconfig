import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
test.describe.serial('2. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  //User: Local System Admin(e.mayuka)
  //Scope: Ibombo, Central,Farajaland

  test.describe.serial('2.1 UI check', async () => {
    test('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('2.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Kapila Health Post/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Kapila Health Post/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('2.1.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '4' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ibombo District Office/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
    })
    test('2.1.3 Verify Team Members Status', async () => {
      const ibomboMembers = [
        'Mitchell Owen',
        'Emmanuel Mayuka',
        'Kennedy Mweene',
        'Felix Katongo',
        'Kalusha Bwalya'
      ]
      await verifyMembersClickable(
        page,
        ibomboMembers,
        'Ibombo District Office'
      )
    })
  })

  test.describe.serial('2.2 Out of Scope Access', async () => {
    test('2.2.1 Verify Province -> District -> Health Facility', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Itambo/ }).click()
      await expect(
        page.getByRole('button', { name: /KundamfumuRural Health Centre/ })
      ).toBeDisabled()
    })
    test('2.2.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()
      await expect(
        page.getByRole('button', { name: /Funabuli District Office/ })
      ).toBeDisabled()
    })

    //@TODO: https://github.com/opencrvs/opencrvs-core/issues/11756
    test.fail('2.2.3 Verify Embassy', async () => {
      await page.getByRole('button', { name: /Organisation/ }).click()

      await expect(
        page.getByRole('button', { name: /Farajaland Embassy/ })
      ).toBeDisabled()
    })
  })
})
