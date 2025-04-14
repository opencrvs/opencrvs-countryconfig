import { Page, expect } from '@playwright/test'
import { Declaration } from './data/birth-declaration'
import { selectAction } from '../../../v2-utils'

export async function selectCertificationType(page: Page, type: string) {
  await page.locator('#certificateTemplateId svg').click()
  await page
    .locator('.react-select__menu')
    .getByText(type, { exact: true })
    .click()
}

export async function selectRequesterType(page: Page, type: string) {
  await page.locator('#collector____requesterId').click()
  await page.getByText(type, { exact: true }).click()
}

export async function expectInUrl(page: Page, assertionString: string) {
  await expect(page.url().includes(assertionString)).toBeTruthy()
}

export async function navigateToCertificatePrintAction(
  page: Page,
  declaration: Declaration
) {
  const childName = `${declaration['child.firstname']} ${declaration['child.surname']}`
  await page.getByRole('button', { name: childName }).click()
  await selectAction(page, 'Print Certificate')
}
