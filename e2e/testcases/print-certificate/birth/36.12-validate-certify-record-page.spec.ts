import { expect, test, type Page } from '@playwright/test'
import { BirthDeclaration } from '../../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('12.0 Validate "Review" page', () => {
  let declaration: BirthDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('12.1 Review page click make correction', async () => {
    const response = await getDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page
      .getByText('Birth Certificate Certified Copy', { exact: true })
      .click()
    await page.getByLabel('Print in advance').check()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(
      page.url().includes(`/review/${declaration.id}/birth`)
    ).toBeTruthy()

    await expect(page.locator('#content-name')).toContainText(
      'Ready to certify?'
    )
    await expect(
      page.getByText(
        'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.'
      )
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'No, make correction' })
    ).toBeVisible()
  })

  test('12.2 Navigated to correction requester page', async () => {
    await page.getByRole('button', { name: 'No, make correction' }).click()
    await expect(
      page.url().includes(`/correction/${declaration.id}/corrector`)
    ).toBeTruthy()
  })

  test('12.3 Validate correction requester page', async () => {
    await page.getByText('Mother', { exact: true }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Verify their identity')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Verified' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Identity does not match' })
    ).toBeVisible()
  })
})
