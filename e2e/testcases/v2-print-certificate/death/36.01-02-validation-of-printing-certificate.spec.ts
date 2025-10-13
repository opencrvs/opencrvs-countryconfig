import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../v2-test-data/death-declaration'
import { navigateToCertificatePrintAction } from '../death/helpers'
import { REQUIRED_VALIDATION_ERROR } from '../../v2-birth/helpers'
import { expectInUrl } from '../../../v2-utils'

test.describe.serial('Certified copies', () => {
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
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0.1 Log in', async () => {
    await loginToV2(page)
  })

  test('1.0.2 Click on "Print certificate" from action menu', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Click continue without selecting collector type and template type', async () => {
      await expect(
        page.locator('#certificateTemplateId').getByText('Death Certificate')
      ).toBeVisible()
    })

    test('2.2 Click continue without selecting collector type', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()

      await expect(
        page
          .locator('#collector____requesterId_error')
          .getByText(REQUIRED_VALIDATION_ERROR)
      ).toBeVisible()
    })

    test('2.3 Click continue after selecting requester type and template type', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('#collector____requesterId').click()
      const selectOptionsLabels = [
        'Print and issue to Informant (Spouse)',
        'Print and issue to someone else'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }

      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      await expect(page.getByText('Certify record')).toBeVisible()

      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(page, '/pages/collector.identity.verify')
    })
  })
})
