import { expect, test, type Page } from '@playwright/test'
import { DeathDeclaration } from '../../death/types'
import { getDeathDeclarationForPrintCertificate } from './certificate-helper'

test.describe.serial('7.0 Validate collect payment page', () => {
  let declaration: DeathDeclaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.1 check collect payment page header', async () => {
    const response = await getDeathDeclarationForPrintCertificate(page)
    declaration = response.declaration
    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page.getByLabel('Print and issue to someone else').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .url()
        .includes(`/collector/${declaration.id}/death/otherCertCollector`)
    ).toBeTruthy()
  })

  test('5.2 should be able to select "No ID available" and no other ID field will be visible', async () => {
    await page.locator('#iDType-form-input').click()
    await page.getByText('No ID available').click()
    await expect(page.locator('#iD-form-input')).toBeHidden()
  })

  test('5.2 should be able to select any type of id and correspondent id input will be visible', async () => {
    await page.locator('#iDType-form-input').click()
    await page.getByText('Passport', { exact: true }).click()
    await expect(page.locator('#iD-form-input')).toBeVisible()
    await expect(page.locator('#iD_label')).toContainText('Passport')

    await page.locator('#iDType-form-input').click()
    await page.getByText('Other', { exact: true }).click()
    await expect(page.locator('#iD-form-input')).toBeVisible()
    await expect(page.locator('#iDTypeOther-form-input')).toBeVisible()
    await expect(page.locator('#iDTypeOther_label')).toContainText(
      'Other type of ID'
    )
  })

  test('5.2 should be able to select National ID and correspondent id input will be visible with validation rules', async () => {
    await page.locator('#iDType-form-input').click()
    await page.getByText('National ID', { exact: true }).click()
    await page.fill('#iD', '1234567')

    await expect(page.locator('#iD')).toHaveValue('1234567')
    await page.locator('#lastName').click()
    await expect(page.locator('#iD_error')).toContainText(
      'The National ID can only be numeric and must be 10 digits long'
    )
    await page.fill('#iD', '1235678922')
    await expect(page.locator('#iD_error')).toBeHidden()
  })

  test('5.3 should be able to enter first name', async () => {
    await page.fill('#firstName', 'Muhammed Tareq')
    await expect(page.locator('#firstName')).toHaveValue('Muhammed Tareq')
  })

  test('5.4 should be able to enter lastname name', async () => {
    await page.fill('#lastName', 'Aziz')
    await expect(page.locator('#lastName')).toHaveValue('Aziz')
  })

  test('5.5 keep relationship null and continue', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.locator('#relationship_error')).toContainText('Required')
  })

  test('5.6 should be able to enter relationship', async () => {
    await page.fill('#relationship', 'Uncle')
    await expect(page.locator('#relationship')).toHaveValue('Uncle')
  })

  test("5.7 Fill all mandatory field and click 'Continue' should navigate to affidavit page", async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.url().includes(`/cert/collector/${declaration.id}/death/affidavit`)
    ).toBeTruthy()
  })

  test.describe('6.0 Validate "Upload signed affidavit" page:', async () => {
    test('6.1 Click continue without adding any file or clicking the checkbox should show error', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('6.2 Should be able to add file and navigate to the "Ready to certify?" page.', async () => {
      const path = require('path')
      const attachmentPath = path.resolve(__dirname, './528KB-random.png')
      const inputFile = await page.locator(
        'input[name="affidavitFile"][type="file"]'
      )
      await inputFile.setInputFiles(attachmentPath)
      await expect(
        page.getByRole('button', { name: 'Signed affidavit' })
      ).toBeVisible()
    })
  })
})
