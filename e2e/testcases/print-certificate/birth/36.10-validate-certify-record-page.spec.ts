import { expect, test, type Page } from '@playwright/test'
import { BirthDeclaration } from '../../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('10.0 Validate "Review" page', () => {
  let declaration: BirthDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('10.1 Review page validations', async () => {
    const response = await getDeclarationForPrintCertificate(page)
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
    await expect(
      page.getByRole('button', { name: 'Yes, print certificate' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeVisible()
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'Print and issue certificate?'
    )
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'A PDF of the certificate will open in a new tab for you to print and issue'
    )
  })

  test('10.2 On click cancel button, modal will be closed', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeHidden()
  })

  test('10.3 On click print button, user will navigate to a new tab from where user can download PDF', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })
})
