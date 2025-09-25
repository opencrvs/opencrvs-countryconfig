import { expect, test, type Page } from '@playwright/test'

import { loginToV2, getToken, formatName } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../v2-test-data/birth-declaration'

import {
  selectCertificationType,
  selectRequesterType
} from '../v2-print-certificate/birth/helpers'
import { expectInUrl } from '../../v2-utils'

test.describe.serial('Navigating in and out of action', () => {
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

  test('Login', async () => {
    await loginToV2(page)
  })

  test("Navigate to the 'Ready to print' -workqueue", async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
  })

  test("Enter the 'Print' -action from workqueue", async () => {
    const childName = formatName({
      firstNames: declaration['child.name'].firstname,
      familyName: declaration['child.name'].surname
    })
    // Locate the row with correct name
    const row = page.locator('div', { hasText: childName }).first()

    // Click the "Assign record" button inside that row
    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .first()
      .click()

    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    // Click the "Review" button inside that row
    await row
      .getByRole('button', { name: 'Print', exact: true })
      .first()
      .click()
  })

  test('Navigate successfully through the print certificate action flow', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/review?templateId=v2.birth-certificate&workqueue=ready-to-print`
    )
  })

  test('After finishing action flow, user should be redirected back to the workqueue', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()

    await page.waitForURL(`**/workqueue/ready-to-print`)
    await expectInUrl(page, '/workqueue/ready-to-print')
  })

  test('Browser back button should take user to the front page instead of action flow', async () => {
    await page.goBack()
    await page.waitForURL(`**/workqueue/assigned-to-you`)
    await expectInUrl(page, '/workqueue/assigned-to-you')
  })

  test('Browser forward button should take user back to the workqueue', async () => {
    await page.goForward()
    await page.waitForURL(`**/workqueue/ready-to-print`)
    await expectInUrl(page, `/workqueue/ready-to-print`)
  })
})
