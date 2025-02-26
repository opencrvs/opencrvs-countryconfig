import { expect, test, type Page } from '@playwright/test'
import { BirthDeclaration } from '../../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'
import { format } from 'date-fns'
import { CLIENT_URL } from '../../../constants'

test.describe.serial('7.0 Validate "Certify record" page', () => {
  let declaration: BirthDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 continue with "Print and issue to informant (Brother)" redirect to Collector details page', async () => {
    const response = await getDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page.getByText('Birth Certificate', { exact: true }).click()
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
  })

  test('7.2 should navigate to ready to certify page on continue button click', async () => {
    await page.locator('#Continue').click()
    await expect(
      page.url().includes(`/review/${declaration.id}/birth`)
    ).toBeTruthy()
  })

  test('7.3 should skip payment page if payment is 0', async () => {
    await page.goto(`${CLIENT_URL}/registration-home/print/1`)
    const response = await getDeclarationForPrintCertificate(page, {
      child: { birthDate: format(new Date(), 'yyyy-MM-dd') },
      isLoggedIn: true
    })
    declaration = response.declaration
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
