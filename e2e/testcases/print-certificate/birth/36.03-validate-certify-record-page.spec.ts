import { expect, test, type Page } from '@playwright/test'
import { format, parseISO } from 'date-fns'
import { BirthDeclaration } from '../../birth/types'
import { getDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('3.0 Validate "Certify record" page', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('3.1 should navigate to Verify their identity page', async () => {
    const response = await getDeclarationForPrintCertificate(page)
    declaration = response.declaration
    trackingId = response.trackingId
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()

    await page.getByLabel('Print and issue to informant (Brother)').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/print/check/${declaration.id}/birth/informant`)
    ).toBeTruthy()
  })

  test('3.2 should see informant Id, names, nationality and dob', async () => {
    await expect(
      page.url().includes(`/print/check/${declaration.id}/birth/informant`)
    ).toBeTruthy()

    await expect(page.locator('#content-name')).toContainText(
      'Verify their identity'
    )

    await expect(
      page.locator(`text="${declaration.informant.name[0].firstNames}"`)
    ).toBeVisible()

    await expect(
      page.locator(`text="${declaration.informant.name[0].familyName}"`)
    ).toBeVisible()

    await expect(
      page.locator(
        `text="${format(
          parseISO(declaration.informant.birthDate),
          'dd MMMM yyyy'
        )}"`
      )
    ).toBeVisible()

    await expect(page.getByRole('button', { name: 'Verified' })).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Identity does not match' })
    ).toBeVisible()
  })

  test('3.3 should navigate to collect payment page on "Verified" button click', async () => {
    await page.getByRole('button', { name: 'Verified' }).click()
    await expect(
      page.url().includes(`/print/payment/${declaration.id}/birth`)
    ).toBeTruthy()
    await page.goBack()
  })

  test('3.4 should open warning modal on "Identity does not match" button click', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await expect(page.locator('#withoutVerificationPrompt')).toContainText(
      'Print without proof of ID?',
      { useInnerText: true }
    )
  })

  test('3.5 click warning modal confirm button should take to payment page', async () => {
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(
      page.url().includes(`/print/payment/${declaration.id}/birth`)
    ).toBeTruthy()
    await page.goBack()
  })

  test('3.6 click warning modal cancel button should close the modal', async () => {
    await page.getByRole('button', { name: 'Identity does not match' }).click()
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.locator('#withoutVerificationPrompt')).toBeHidden()
    await page.goBack()
  })
})
