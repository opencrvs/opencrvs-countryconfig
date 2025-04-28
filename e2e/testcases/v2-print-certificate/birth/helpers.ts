import { Page } from '@playwright/test'
import { Declaration } from '../../v2-test-data/birth-declaration'
import { ensureAssigned, selectAction } from '../../../v2-utils'

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

export async function navigateToCertificatePrintAction(
  page: Page,
  declaration: Declaration
) {
  const childName = `${declaration['child.firstname']} ${declaration['child.surname']}`
  await page.getByRole('button', { name: childName }).click()
  await ensureAssigned(page)
  await selectAction(page, 'Print Certificate')
}
