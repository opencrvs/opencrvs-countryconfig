import { expect, test, type Page } from '@playwright/test'
import { BirthDeclaration } from '../../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('Certified copies', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0 Click on "Print certified copy" from action menu', async () => {
    const response = await getDeclarationForPrintCertificate(page)
    declaration = response.declaration
    trackingId = response.trackingId

    await expect(
      page
        .url()
        .includes(`/cert/collector/${declaration.id}/birth/certCollector`)
    ).toBeTruthy()
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Click continue without selecting collector type', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(
        page.getByText('Please select who is collecting the certificate')
      ).toBeVisible()
    })

    test('2.2 Click continue after selecting collector type', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await page.getByLabel('Print in advance').check()
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(
        page.getByText('Please select who is collecting the certificate')
      ).not.toBeVisible()
    })
  })
})
