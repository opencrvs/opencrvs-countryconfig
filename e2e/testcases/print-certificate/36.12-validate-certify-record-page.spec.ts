import { expect, test, type Page } from '@playwright/test'
import { BirthDeclaration } from '../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'
import { getAction } from '../../helpers'

test.describe.serial('12.0 Validate the following for "Review" page', () => {
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

  test('12.3 Validate correction requester page', async ({ page }) => {
    await page.getByRole('button', { name: 'Action' }).first().click()
    await getAction(page, 'Correct record').click()

    /*
     * Expected result: should
     * - Navigate to Correction Requester Page
     */
    await expect(page.getByText('Correction requester')).toBeVisible()
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('corrector')).toBeTruthy()

    /*
     * Expected result: should say
     * - Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.
     */
    await expect(
      page.getByText(
        'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.'
      )
    ).toBeVisible()
  })
})
