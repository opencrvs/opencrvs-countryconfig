import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
test.describe.serial('3. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  //User: Registrar General(j.musonda)
  //WIP: https://github.com/opencrvs/opencrvs-core/issues/11697 , This ticket is to be resolved to have complete test case.

  test.describe.serial('3.1 UI check', async () => {
    test('3.1.0 Verify Province -> District -> District Office', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Embe/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /HQ Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(/HQ Office/)
      await expect(
        page.getByText('Embe, Pualula', { exact: true })
      ).toBeVisible()
    })
  })
})
