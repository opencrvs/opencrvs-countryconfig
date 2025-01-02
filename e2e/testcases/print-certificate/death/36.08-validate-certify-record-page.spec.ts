import { expect, test, type Page } from '@playwright/test'
import { DeathDeclaration } from '../../death/types'
import { getDeathDeclarationForPrintCertificate } from './certificate-helper'
import { format } from 'date-fns'
import { CLIENT_URL } from '../../../constants'

test.describe.serial('8.0 Validate "Payment" page', () => {
  let declaration: DeathDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 Payment page should correct payment fee based on selected template', async () => {
    const response = await getDeathDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page.getByText('Death Certificate', { exact: true }).click()
    await page.getByLabel('Print and issue to informant (Spouse)').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/print/check/${declaration.id}/death/informant`)
    ).toBeTruthy()

    await page.getByRole('button', { name: 'Verified' }).click()
    await expect(
      page.url().includes(`/print/payment/${declaration.id}/death`)
    ).toBeTruthy()

    await expect(page.locator('#content-name')).toContainText('Collect payment')
    await expect(page.locator('#service')).toContainText(
      'Death registration before 45 days of date of death'
    )
    await expect(page.locator('#amountDue')).toContainText('$3.00')
    await expect(page.locator('#Continue')).toBeVisible()

    await page.goBack()
    await page.goBack()
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page
      .getByText('Death Certificate Certified Copy', { exact: true })
      .click()
    await page.getByLabel('Print and issue to informant (Spouse)').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/print/check/${declaration.id}/death/informant`)
    ).toBeTruthy()

    await page.getByRole('button', { name: 'Verified' }).click()
    await expect(
      page.url().includes(`/review/${declaration.id}/death`)
    ).toBeTruthy()
  })
})
