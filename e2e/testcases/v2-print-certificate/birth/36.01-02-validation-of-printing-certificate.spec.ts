import { expect, test, type Page } from '@playwright/test'

import { loginToV2, getToken } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  CreateDeclarationResponse
} from './data/birth-declaration'

test.describe.serial('Print certificate', () => {
  let page: Page
  let birthDeclaration: CreateDeclarationResponse

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    birthDeclaration = await createDeclaration(token)
    page = await browser.newPage()
    await loginToV2(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0 Click on "Print certificate" from action menu', async () => {
    const childName = `${birthDeclaration.data['child.firstname']} ${birthDeclaration.data['child.surname']}`
    await page.getByRole('button', { name: childName }).click()
    await page.getByRole('button', { name: 'Action' }).click()
    await page.getByRole('listitem').click()
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Continue button is disabled when no template or requester type is selected', async () => {
      await expect(page.getByText('Certify record')).toBeVisible()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })

    test('2.2 Continue button is disabled when no requester type is selected', async () => {
      await page.reload({ waitUntil: 'networkidle' })

      await page.locator('#certificateTemplateId svg').click()

      await page
        .getByText('Birth Certificate Certified Copy', { exact: true })
        .click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })

    test('2.3 Continue button is enabled when both template and requester type are selected', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('#collector____requesterId div').nth(4).click()
      await page.getByText('Print and issue Informant', { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
  })
})
