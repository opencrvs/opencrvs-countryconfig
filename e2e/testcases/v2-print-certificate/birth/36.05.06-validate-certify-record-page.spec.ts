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
import { expectInUrl } from '../../../v2-utils'

async function selectIdType(page: Page, idType: string) {
  await page.locator('#collector____OTHER____idType').click()
  await page.getByText(idType, { exact: true }).click()
}

test.describe.serial('Validate collect payment page', () => {
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

  test('5.0.1 Log in', async () => {
    await loginToV2(page)
  })

  test('5.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  test('5.1 check collect payment page header', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')
  })

  test('5.2 should be able to select "No ID available" and no other ID field will be visible', async () => {
    await selectIdType(page, 'No ID available')
    await expect(page.locator('#collector____PASSPORT____details')).toBeHidden()
  })

  test('5.2 should be able to select any type of id and correspondent id input will be visible', async () => {
    await selectIdType(page, 'Passport')
    await expect(
      page.locator('#collector____PASSPORT____details')
    ).toBeVisible()

    await selectIdType(page, 'Other')
    await expect(
      page.locator('#collector____OTHER____idTypeOther')
    ).toBeVisible()
  })

  test('5.2 should be able to select National ID and correspondent id input will be visible with validation rules', async () => {
    await selectIdType(page, 'National ID')
    await page.fill('#collector____nid', '1234567')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()

    await expect(page.locator('#collector____nid_error')).toContainText(
      'The national ID can only be numeric and must be 10 digits long'
    )
    await page.fill('#collector____nid', '1235678922')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()
    await expect(page.locator('#collector____nid_error')).toBeHidden()
  })

  test('5.3 should be able to enter first name', async () => {
    await page.fill('#firstname', 'Muhammed Tareq')
    await expect(page.locator('#firstname')).toHaveValue('Muhammed Tareq')
  })

  test('5.4 should be able to enter last name', async () => {
    await page.fill('#surname', 'Aziz')
    await expect(page.locator('#surname')).toHaveValue('Aziz')
  })

  test('5.5 keep relationship null and continue', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .locator('#collector____OTHER____relationshipToChild_error')
        .getByText('Required for registration')
    ).toBeVisible()
  })

  test('5.6 should be able to enter relationship', async () => {
    await page.fill('#collector____OTHER____relationshipToChild', 'Uncle')
    await expect(
      page.locator('#collector____OTHER____relationshipToChild')
    ).toHaveValue('Uncle')
    await page.getByRole('heading', { name: 'Birth', exact: true }).click()
  })

  test.describe('6.0 Validate "Upload signed affidavit":', async () => {
    test('6.1 Should be able to add file and navigate to the "Ready to certify?" page.', async () => {
      const path = require('path')
      const attachmentPath = path.resolve(__dirname, './528KB-random.png')
      const inputFile = await page.locator(
        'input[name="collector____OTHER____signedAffidavit"][type="file"]'
      )
      await inputFile.setInputFiles(attachmentPath)
      await expect(
        page.getByRole('button', { name: 'Signed Affidavit' })
      ).toBeVisible()
      await expect(page.locator('#preview_delete')).toBeVisible()
      await page.getByRole('button', { name: 'Continue' }).click()
      await expectInUrl(
        page,
        `/print-certificate/${eventId}/pages/collector.collect.payment`
      )
    })
  })
})
