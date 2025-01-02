import { expect, test, type Page } from '@playwright/test'
import { DeathDeclaration } from '../../death/types'
import { getDeathDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('4.0 Validate "Certify record" page', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('4.1 continue with print in advance redirect to review page', async () => {
    const response = await getDeathDeclarationForPrintCertificate(page)
    declaration = response.declaration
    trackingId = response.trackingId
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()

    await page.getByText('Death Certificate', { exact: true }).click()
    await page.getByLabel('Print in advance').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/review/${declaration.id}/death`)
    ).toBeTruthy()
  })
})
