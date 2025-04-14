import { expect, test, type Page } from '@playwright/test'
import { Declaration } from './data/birth-declaration'
import { selectAction } from '../../../v2-utils'
import { loginToV2 } from '../../../helpers'
import { createDeclaration } from './data/birth-declaration'
import { CREDENTIALS } from '../../../constants'
import { getToken } from '../../../helpers'
import {
  navigateToCertificatePrintAction,
  selectRequesterType
} from './helpers'
import { selectCertificationType } from './helpers'

test.describe.serial('10.0 Validate "Review" page', () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
    await loginToV2(page)

    await navigateToCertificatePrintAction(page, declaration)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('10.1 Review page validations', async () => {
    await selectCertificationType(page, 'Birth Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to informant')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeVisible()
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'Print and issue certificate?'
    )
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'A Pdf of the certificate will open in a new tab for printing and issuing.'
    )
  })

  test('10.2 On click cancel button, modal will be closed', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeHidden()
  })

  test('10.3 click print button, user will navigate to a new tab from where user can download PDF', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })
})
