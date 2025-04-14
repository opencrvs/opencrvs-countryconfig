import { expect, test, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { loginToV2 } from '../../../helpers'
import { getToken } from '../../../helpers'
import { createDeclaration, Declaration } from './data/birth-declaration'
import { selectAction } from '../../../v2-utils'
import { selectRequesterType } from './helpers'
import { selectCertificationType } from './helpers'

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
    await loginToV2(page)

    const childName = `${declaration['child.firstname']} ${declaration['child.surname']}`
    await page.getByRole('button', { name: childName }).click()
    await selectAction(page, 'Print Certificate')
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.1 check collect payment page header', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to someone else')
  })

  test('5.2 should be able to select "No ID available" and no other ID field will be visible', async () => {
    await selectIdType(page, 'No ID')
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
    await page.fill('#collector____NATIONAL_ID____details', '1234567')

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
      page.url().includes(`/cert/collector/${eventId}/birth/affidavit`)
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
