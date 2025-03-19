import { expect, test, type Page } from '@playwright/test'

import { loginToV2, getToken } from '../../helpers'
import { EVENT_API_URL, CREDENTIALS } from '../../constants'
import { birthDeclaration } from './data/birth-declaration'

async function createDeclaration(token: string) {
  await fetch(`${EVENT_API_URL}/event.actions.declare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(birthDeclaration)
  })

  await fetch(`${EVENT_API_URL}/event.actions.validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(birthDeclaration)
  })

  const response = await fetch(`${EVENT_API_URL}/event.actions.register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(birthDeclaration)
  })

  const res = await response.json()

  return res
}

test.describe.serial('Print certificate', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createDeclaration(token)
    page = await browser.newPage()
    await loginToV2(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0 Click on "Print certificate" from action menu', async () => {
    await page.getByRole('button', { name: 'Firstname Lastname' }).click()
    await page.getByRole('button', { name: 'Action' }).click()
    await page.getByRole('listitem').click()
  })

  test.describe('2.0 Validate "Certify record" page', async () => {
    test('2.1 Continue button is disabled when no template or requester type is selected', async () => {
      await expect(page.getByText('Print certified copy')).toBeVisible()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })

    test('2.2 Continue button is disabled when no requester type is selected', async () => {
      await page.reload({ waitUntil: 'networkidle' })

      await page.locator('#templateId svg').click()

      await page
        .getByText('Birth Certificate Certified Copy', { exact: true })
        .click()

      await expect(page.getByText('Print certified copy')).toBeVisible()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })

    test('2.3 Continue button is disabled when no template type is selected', async () => {
      await page.reload({ waitUntil: 'networkidle' })
      await page.locator('#collector____requesterId div').nth(4).click()
      await page.getByText('Print and issue Informant', { exact: true }).click()

      await expect(page.getByText('Print certified copy')).toBeVisible()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()
    })
  })
})
