import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { getToken, loginToV2 } from '../../../helpers'
import {
  createDeclaration,
  CreateDeclarationResponse
} from './data/birth-declaration'

test.describe.serial('4.0 Validate "Certify record" page', () => {
  let declaration: CreateDeclarationResponse
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    declaration = await createDeclaration(token)
    page = await browser.newPage()
    await loginToV2(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('4.1 continue with print in advance skips identity verification', async () => {
    const childName = `${declaration.data['child.firstname']} ${declaration.data['child.surname']}`
    await page.getByRole('button', { name: childName }).click()
    await page.getByRole('button', { name: 'Action' }).click()
    await page.getByRole('listitem').click()

    await page.locator('#certificateTemplateId svg').click()
    await page.getByText('Birth Certificate').nth(1).click()

    await page.locator('#collector____requesterId div').nth(4).click()
    await page.getByText('Print in advance', { exact: true }).click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('#content-name')).toContainText('Collect Payment')
  })
})
