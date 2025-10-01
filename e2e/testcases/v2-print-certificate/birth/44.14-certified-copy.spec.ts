import { expect, test, type Page } from '@playwright/test'

import { Declaration } from '../../v2-test-data/birth-declaration'
import { getToken } from '../../../helpers'
import { createDeclaration } from '../../v2-test-data/birth-declaration'
import { CREDENTIALS } from '../../../constants'
import { loginToV2 } from '../../../helpers'
import {
  navigateToCertificatePrintAction,
  selectRequesterType
} from './helpers'
import { selectAction } from '../../../v2-utils'
import { formatV2ChildName } from '../../v2-birth/helpers'

test.describe.serial('44.14.0 Validate "Certified copy" option', () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('44.14.0.1 Log in', async () => {
    await loginToV2(page)
  })

  test('44.14.0.1 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  test('44.14.1 "Certified Copy" is not available in certificate types', async () => {
    await page.locator('#certificateTemplateId svg').click()
    await expect(
      page.getByText('Birth Certificate Certified Copy', { exact: true })
    ).toHaveCount(0)
    await page.locator('body').click()
  })

  test('44.14.2 Print certificate', async () => {
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })

  test('44.14.3 "Certified Copy" is now available in certificate types', async () => {
    await page
      .getByRole('textbox', { name: 'Search for a tracking ID' })
      .fill(formatV2ChildName(declaration))

    await page.getByRole('button', { name: 'Search' }).click()
    await page
      .getByRole('button', {
        name: formatV2ChildName(declaration),
        exact: true
      })
      .click()

    await selectAction(page, 'Print')
    await page.locator('#certificateTemplateId svg').click()
    await expect(
      page.getByText('Birth Certificate Certified Copy', { exact: true })
    ).toHaveCount(1)
  })
})
