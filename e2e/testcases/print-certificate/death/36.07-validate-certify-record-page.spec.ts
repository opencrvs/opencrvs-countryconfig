import { expect, test, type Page } from '@playwright/test'
import { DeathDeclaration } from '../../death/types'
import { getDeathDeclarationForPrintCertificate } from './certificate-helper'
import { format } from 'date-fns'
import { CLIENT_URL } from '../../../constants'

test.describe.serial('7.0 Validate "Certify record" page', () => {
  let declaration: DeathDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 continue with "Print and issue to informant (Spouse)" redirect to Collector details page', async () => {
    const response = await getDeathDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
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
  })

  test('7.2 should navigate to ready to certify page on continue button click', async () => {
    await page.locator('#Continue').click()
    await expect(
      page.url().includes(`/review/${declaration.id}/death`)
    ).toBeTruthy()
  })

  test('7.3 should skip payment page if payment is 0', async () => {
    await page.goto(`${CLIENT_URL}/registration-home/print/1`)
    const response = await getDeathDeclarationForPrintCertificate(page, {
      event: { date: format(new Date(), 'yyyy-MM-dd') },
      isLoggedIn: true
    })
    declaration = response.declaration
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
