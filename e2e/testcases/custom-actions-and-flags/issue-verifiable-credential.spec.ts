import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { getToken, login, searchFromSearchBar } from '../../helpers'
import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import {
  createDeclaration,
  type Declaration
} from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'
import {
  selectCertificationType,
  selectRequesterType
} from '../print-certificate/birth/helpers'

test.describe.serial('Issue verifiable credential', () => {
  let page: Page
  let declaration: Declaration
  let childName: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )

    const res = await createDeclaration(token)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page?.close()
  })

  test('Log in and navigate to the record', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await searchFromSearchBar(page, childName)
    await ensureAssigned(page)
  })

  test('Generate QR code from Issue verifiable credential custom action', async () => {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page
      .locator('#action-Dropdown-Content')
      .getByText('Issue a verifiable credential', { exact: true })
      .click()

    await page.locator('#requester____type').click()
    await page.getByText('Mother', { exact: true }).click()
    await page.getByRole('button', { name: 'Generate', exact: true }).click()

    const actionQrCode = page.getByRole('dialog').locator('img')
    await expect(actionQrCode).toBeVisible()
    await expect(actionQrCode).toHaveAttribute(
      'src',
      /^data:image\/png;base64,/
    )

    const acceptedOfferCheckbox = page.locator('#requester____acceptedVcOffer')
    await expect(acceptedOfferCheckbox).toBeVisible()

    const confirmButton = page.getByRole('button', { name: 'Confirm' })
    await expect(confirmButton).toBeDisabled()

    await acceptedOfferCheckbox.check()
    await expect(confirmButton).toBeEnabled()

    await confirmButton.click()
    await ensureOutboxIsEmpty(page)
  })

  test('Show verifiable credential QR code in Birth Certificate', async () => {
    await navigateToWorkqueue(page, 'Pending certification')
    await searchFromSearchBar(page, childName)
    await ensureAssigned(page)

    await selectAction(page, 'Print')
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()

    // known UX issue:
    // there is a background HTTP call to create the verifiable credential. We need to wait for it to succeed.
    const HTTP_CALL_RESPONSE_WAIT_MS = 500
    await page.waitForTimeout(HTTP_CALL_RESPONSE_WAIT_MS)

    await page.getByRole('button', { name: 'Continue' }).click()

    const certificateQrCode = page.locator(
      '#print image[data-testid="verifiable-credential-qr-code"]'
    )
    await expect(certificateQrCode).toBeVisible()

    const qrValue = await certificateQrCode.evaluate((element) => {
      return (
        element.getAttribute('href') || element.getAttribute('xlink:href') || ''
      )
    })

    expect(qrValue).toMatch(/^data:image\/png;base64,/)
  })
})
