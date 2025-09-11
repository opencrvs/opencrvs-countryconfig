import { test, type Page, expect } from '@playwright/test'
import { Declaration } from '../../v2-test-data/birth-declaration'
import { loginToV2 } from '../../../helpers'
import { createDeclaration } from '../../v2-test-data/birth-declaration'
import { CREDENTIALS } from '../../../constants'
import { getToken } from '../../../helpers'
import {
  navigateToCertificatePrintAction,
  selectRequesterType
} from './helpers'
import { selectCertificationType } from './helpers'

test.describe
  .serial("Validate 'Birth Certificate Certified Copy' PDF details", () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    // Create a declaration with a health facility place of birth
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await loginToV2(page)
  })

  test('Go to review', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Birth Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText(
      'Ibombo Rural Health Centre'
    )
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
})

test.describe.serial("Validate 'Birth Certificate' PDF details", () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    // Create a declaration
    const res = await createDeclaration(
      token,
      undefined,
      undefined,
      'HEALTH_FACILITY'
    )

    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await loginToV2(page)
  })

  test('Go to review', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Validate child place of birth', async () => {
    await expect(page.locator('#print')).toContainText(
      'Ibombo Rural Health Centre'
    )
    await expect(page.locator('#print')).toContainText(
      'Ibombo, Central, Farajaland'
    )
  })
})
