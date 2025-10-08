import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { loginToV2 } from '../../../helpers'
import { getToken } from '../../../helpers'
import {
  createDeclaration,
  Declaration
} from '../../v2-test-data/birth-declaration'
import {
  selectRequesterType,
  selectCertificationType,
  navigateToCertificatePrintAction
} from './helpers'
import { ensureAssigned, expectInUrl } from '../../../v2-utils'

async function selectIdType(page: Page, idType: string) {
  await page.locator('#collector____OTHER____idType').click()
  await page.getByText(idType, { exact: true }).click()
}

test.describe
  .serial('Print to someone else using Alien Number as ID type', () => {
  let eventId: string
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    eventId = res.eventId
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Log in', async () => {
    await loginToV2(page)
  })

  test('Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  test('Fill details, including Alien Number', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')

    await selectIdType(page, 'Alien Number')
    await page.fill('#collector____ALIEN-NUMBER____details', '1234567')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()

    await page.fill('#firstname', 'Muhammed Tareq')
    await page.fill('#surname', 'Aziz')
    await page.fill('#collector____OTHER____relationshipToChild', 'Uncle')
  })

  test('Print', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()
  })

  test('Validate Certified -modal', async () => {
    await expectInUrl(page, `/events/overview/${eventId}`)
    await ensureAssigned(page)
    await page.getByRole('button', { name: 'Certified', exact: true }).click()

    await expect(page.getByText('Type' + 'Birth Certificate')).toBeVisible()
    await expect(
      page.getByText('Requester' + 'Print and issue to someone else')
    ).toBeVisible()
    await expect(page.getByText('Type of ID' + 'Alien Number')).toBeVisible()
    await expect(page.getByText('Alien Number' + '1234567')).toBeVisible()
    await expect(
      page.getByText("Collector's name" + 'Muhammed Tareq Aziz')
    ).toBeVisible()
    await expect(
      page.getByText('Relationship to child' + 'Uncle')
    ).toBeVisible()
  })
})
