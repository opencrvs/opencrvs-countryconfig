import { Page, expect } from '@playwright/test'

export async function selectAction(
  page: Page,
  action:
    | 'Print certificate'
    | 'Declare'
    | 'Validate'
    | 'Register'
    | 'Assign'
    | 'Unassign'
    | 'Delete'
) {
  await ensureAssigned(page)

  // Keep retrying the click until the dropdown is visible
  let isVisible = false
  let attempts = 0
  const maxAttempts = 10

  while (!isVisible && attempts < maxAttempts) {
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    isVisible = await page
      .locator('#action-Dropdown-Content')
      .getByText(action, { exact: true })
      .isVisible()

    if (!isVisible) {
      // Small wait before retrying
      await page.waitForTimeout(500)
      attempts++
    }
  }

  await page
    .locator('#action-Dropdown-Content')
    .getByText(action, { exact: true })
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
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned'
    )
    await page.getByRole('button', { name: 'Action' }).click()
  }

  const assignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Assign$`, 'i') })
    .first()

  if (await assignAction.isVisible()) {
    await assignAction.click()
  }

  await expect(page.getByTestId('assignedTo-value')).not.toHaveText(
    'Not assigned'
  )
}

export async function expectInUrl(page: Page, assertionString: string) {
  await expect(page.url().includes(assertionString)).toBeTruthy()
}
