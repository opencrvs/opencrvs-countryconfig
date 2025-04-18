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

export async function ensureAssigned(page: Page) {
  await page.getByRole('button', { name: 'Action' }).click()
  const unAssignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Unassign$`, 'i') })
    .first()

  if (await unAssignAction.isVisible()) {
    await unAssignAction.click()
    await page.getByRole('button', { name: 'Action' }).click()
  }

  const assignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Assign$`, 'i') })
    .first()

  if (await assignAction.isVisible()) {
    await assignAction.click()
  }
}
