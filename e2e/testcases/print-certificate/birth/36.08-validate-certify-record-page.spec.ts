import { expect, test, type Page } from '@playwright/test'
import { BirthDeclaration } from '../../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('8.0 Validate "Payment" page', () => {
  let declaration: BirthDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 Payment page should correct payment fee based on selected template', async () => {
    const response = await getDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()

    await page.getByLabel('Print and issue to informant (Brother)').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/print/check/${declaration.id}/birth/informant`)
    ).toBeTruthy()

    await page.getByRole('button', { name: 'Verified' }).click()
    await expect(
      page.url().includes(`/print/payment/${declaration.id}/birth`)
    ).toBeTruthy()

    await expect(page.locator('#content-name')).toContainText('Collect payment')
    await expect(page.locator('#service')).toContainText(
      'Birth registration before 30 days of date of birth'
    )
    await expect(page.locator('#amountDue')).toContainText('$5.00')
    await expect(page.locator('#Continue')).toBeVisible()

    await page.goBack()
    await page.goBack()
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page
      .getByText('Birth Certificate Certified Copy', { exact: true })
      .click()
    await page.getByLabel('Print and issue to informant (Brother)').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/print/check/${declaration.id}/birth/informant`)
    ).toBeTruthy()

    await page.getByRole('button', { name: 'Verified' }).click()
    await expect(
      page.url().includes(`/review/${declaration.id}/birth`)
    ).toBeTruthy()
  })
})
