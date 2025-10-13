import { expect, test, type Page } from '@playwright/test'
import { DeathDeclaration } from '../../death/types'
import { getDeathDeclarationForPrintCertificate } from './certificate-helper'

test.describe
  .serial('13.0 Validate the history section of record audit after printing', () => {
  let declaration: DeathDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('13.1 Go to printed declaration details page by Print in advance', async () => {
    const response = await getDeathDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page
      .getByText('Death Certificate Certified Copy', { exact: true })
      .click()
    await page.getByLabel('Print in advance').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.locator('#print-certificate').click()

    await page
      .getByPlaceholder('Search for a tracking ID')
      .fill(declaration.registration.trackingId)
    await page.getByPlaceholder('Search for a tracking ID').press('Enter')
    await page.locator('#ListItemAction-0-icon').click()

    const assignRecordModal = await page.locator('#assign').isVisible()
    if (assignRecordModal) {
      await page.locator('#assign').click()
    }
    await page.locator('#name_0').click()
    await expect(page.getByRole('button', { name: 'Certified' })).toBeVisible()

    await page.getByRole('button', { name: 'Certified' }).click()
    await expect(
      page.getByText('Death Certificate Certified Copy')
    ).toBeVisible()
  })
})
