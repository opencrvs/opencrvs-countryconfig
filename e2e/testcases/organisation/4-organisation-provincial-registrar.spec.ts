import { test, type Page } from '@playwright/test'
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

  //User: Provincial Registrar(m.owen)
  //WIP: https://github.com/opencrvs/opencrvs-core/issues/11697 , This ticket is to be resolved to have complete test case.
  test.describe.serial('3.1 UI check', async () => {
    test.skip('3.1.0 Verify Province -> District -> District Office', async () => {
      //needs to be updated once the issue is resolved
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
    })
  })
})
