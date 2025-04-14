import { Page } from '@playwright/test'

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
