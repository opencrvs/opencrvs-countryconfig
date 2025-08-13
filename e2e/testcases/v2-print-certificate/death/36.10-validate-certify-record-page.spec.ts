import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../v2-test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '../death/helpers'
import { expectInUrl } from '../../../v2-utils'

test.describe.serial('10.0 Validate "Review" page', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    declaration = res.declaration
    eventId = res.eventId
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('10.0.1 Log in', async () => {
    await loginToV2(page)
  })

  test('10.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  test('10.1 Review page validations', async () => {
    await selectCertificationType(page, 'Death Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeVisible()
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'Print and issue certificate?'
    )
    await expect(page.locator('#confirm-print-modal')).toContainText(
      'A Pdf of the certificate will open in a new tab for printing and issuing.'
    )
  })

  test('10.2 On click cancel button, modal will be closed', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('#confirm-print-modal')).toBeHidden()
  })

  test('10.3 On click print button, user will navigate to a new tab from where user can download PDF', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()

    const popupPromise = page.waitForEvent('popup')
    await page.getByRole('button', { name: 'Print', exact: true }).click()
    const popup = await popupPromise
    const downloadPromise = popup.waitForEvent('download')
    const download = await downloadPromise

    // Check that the popup URL contains PDF content
    await expect(popup.url()).toBe('about:blank')
    await expect(download.suggestedFilename()).toMatch(/^.*\.pdf$/)

    await expectInUrl(page, `/events/overview/${eventId}`)
  })
})
