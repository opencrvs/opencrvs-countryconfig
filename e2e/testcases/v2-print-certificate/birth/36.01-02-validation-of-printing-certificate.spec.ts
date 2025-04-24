import { expect, test, type Page } from '@playwright/test'

import { loginToV2, getToken } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../v2-test-data/birth-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType
} from './helpers'

test.describe.serial('Print certificate', () => {
  let page: Page
  let declaration: Declaration

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
    await loginToV2(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0 Click on "Print certificate" from action menu', async () => {
    await navigateToCertificatePrintAction(page, declaration)
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

      await selectCertificationType(page, 'Birth Certificate Certified Copy')

      await expect(page.getByText('Certify record')).toBeVisible()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })

    test('2.3 Continue button is enabled when both template and requester type are selected', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('#collector____requesterId').click()
      const selectOptionsLabels = [
        'Print and issue to Informant (Mother)',
        'Print and issue to someone else'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled()
    })
  })
})
