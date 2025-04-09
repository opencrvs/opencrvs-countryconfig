import { Page } from '@playwright/test'

export async function selectAction(
  page: Page,
  action: 'Print Certificate' | 'Declare' | 'Validate' | 'Register'
) {
  await page.getByRole('button', { name: 'Action' }).click()
  await page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: action })
    .click()
}
