import { Page } from '@playwright/test'

export async function selectAction(
  page: Page,
  action:
    | 'Print Certificate'
    | 'Declare'
    | 'Validate'
    | 'Register'
    | 'Assign'
    | 'Unassign'
) {
  await page.getByRole('button', { name: 'Action' }).click()
  await page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^${action}$`, 'i') })
    .click()
}
