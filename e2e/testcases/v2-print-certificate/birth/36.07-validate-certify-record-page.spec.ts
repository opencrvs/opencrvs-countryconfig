import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { getToken } from '../../../helpers'
import { loginToV2 } from '../../../helpers'
import {
  createDeclaration,
  getDeclaration,
  Declaration
} from '../../v2-test-data/birth-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from './helpers'
import { expectInUrl } from '../../../v2-utils'

test.describe.serial('7.0 Validate "Certify record" page', () => {
  let eventId: string
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token, await getDeclaration('BROTHER'))
    eventId = res.eventId
    declaration = res.declaration
    page = await browser.newPage()
    await loginToV2(page)

    await navigateToCertificatePrintAction(page, declaration)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 continue with "Print and issue to Informant (Brother)" redirect to Collector details page', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Brother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )
    await page.getByRole('button', { name: 'Verified' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.collect.payment`
    )

    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(
      page.getByText('Birth registration before 30 days of date of birth')
    ).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
  })

  test('7.2 should navigate to ready to certify page on continue button click', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expectInUrl(
      page,
      `/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  // @TODO: this is not implemented in events v2 yet
  test.skip('7.3 should skip payment page if payment is 0', async () => {})
})
