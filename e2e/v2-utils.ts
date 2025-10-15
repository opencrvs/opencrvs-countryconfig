import { Page, expect } from '@playwright/test'
import {
  CLIENT_V2_URL,
  SAFE_INPUT_CHANGE_TIMEOUT_MS,
  SAFE_OUTBOX_TIMEOUT_MS
} from './constants'
import { isMobile } from './mobile-helpers'

type Workqueue =
  | 'Ready to print'
  | 'Ready for review'
  | 'Notifications'
  | 'Requires updates'
  | 'In external validation'
  | 'Assigned to you'
  | 'Recent'
  | 'Sent for review'
  | 'Outbox'

export async function navigateToWorkqueue(page: Page, workqueue: Workqueue) {
  if (isMobile(page)) {
    await page.goto(CLIENT_V2_URL)
    await page.getByRole('button', { name: 'Toggle menu', exact: true }).click()
  }

  await page.getByRole('button', { name: workqueue }).click()
}

export async function selectAction(
  page: Page,
  action:
    | 'Print'
    | 'Declare'
    | 'Validate'
    | 'Review'
    | 'Register'
    | 'Assign'
    | 'Unassign'
    | 'Delete'
    | 'Correct record'
    | 'View'
    | 'Archive'
) {
  if (
    (await page.getByTestId('status-value').innerText()) !== 'Draft' &&
    action !== 'View'
  ) {
    await ensureAssigned(page)
  }

  await page.getByRole('button', { name: 'Action', exact: true }).click()

  if (isMobile(page)) {
    await page.locator('#page-title').getByText(action, { exact: true }).click()
    return
  }

  await page
    .locator('#action-Dropdown-Content')
    .getByText(action, { exact: true })
    .click()
}

export async function ensureAssigned(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await page.getByRole('button', { name: 'Action' }).click()

  const unAssignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Unassign$`, 'i') })
    .first()

  let assignAction = page
    .locator('#action-Dropdown-Content li')
    .filter({ hasText: new RegExp(`^Assign$`, 'i') })
    .first()

  // Wait until either "Unassign" or "Assign" is visible
  await Promise.race([
    unAssignAction.waitFor({ state: 'visible' }),
    assignAction.waitFor({ state: 'visible' })
  ])

  if (await unAssignAction.isVisible()) {
    await unAssignAction.click()
    // Wait for the unassign modal to appear
    await page.getByRole('button', { name: 'Unassign', exact: true }).click()
    await expect(page.getByTestId('assignedTo-value')).toHaveText(
      'Not assigned',
      {
        timeout: SAFE_OUTBOX_TIMEOUT_MS
      }
    )
    await page.getByRole('button', { name: 'Action' }).click()

    assignAction = page
      .locator('#action-Dropdown-Content li')
      .filter({ hasText: new RegExp(`^Assign$`, 'i') })
      .first()
  }

  if (await assignAction.isVisible()) {
    await assignAction.click()
    // Wait for the assign modal to appear
    await page.getByRole('button', { name: 'Assign', exact: true }).click()
  }

  await expect(page.getByTestId('assignedTo-value')).not.toHaveText(
    'Not assigned',
    {
      timeout: SAFE_OUTBOX_TIMEOUT_MS
    }
  )
}

export async function expectInUrl(page: Page, assertionString: string) {
  await expect(page.url().includes(assertionString)).toBeTruthy()
}

export async function ensureOutboxIsEmpty(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await expect(page.locator('#navigation_workqueue_outbox')).toHaveText(
    'Outbox',
    {
      timeout: SAFE_OUTBOX_TIMEOUT_MS
    }
  )
}

export async function type(page: Page, locator: string, text: string) {
  await page.locator(locator).fill(text)
  await page.locator(locator).blur()
}
