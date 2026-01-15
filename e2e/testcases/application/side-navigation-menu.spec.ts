import { test, type Page, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe('Side navigation menu', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Check Registrar navigation items', async () => {
    await login(page, CREDENTIALS.LOCAL_REGISTRAR, false)

    const expectedWorkqueues = [
      'Outbox',
      'My drafts',
      'Assigned to you',
      'Recent',
      'Notifications',
      'Potential duplicate',
      'Pending updates',
      'Pending approval',
      'Pending registration',
      'Escalated',
      'In external validation',
      'Pending certification',
      'Pending issuance'
    ]

    // All workqueues are present on home page.
    for (const item of expectedWorkqueues) {
      await expect(await page.getByRole('button', { name: item })).toBeVisible()
    }

    const expectedItemsWithFrame = ['Organisation', 'Team']

    const expectedItemsWithoutFrame = [
      'Registrations Dashboard',
      'Completeness Dashboard',
      'Registry'
    ]

    for (const item of expectedItemsWithFrame) {
      await page.getByRole('button', { name: item }).click()

      // All workqueues are present on each page.
      for (const item of expectedWorkqueues) {
        await page.getByRole('button', { name: item })
      }

      // All workqueues are present on each page.
      for (const item of expectedItemsWithoutFrame) {
        await page.getByRole('button', { name: item })
      }
    }

    for (const item of expectedItemsWithoutFrame) {
      await page.getByRole('button', { name: item }).click()
      await expect(page.locator('Farajaland CRS')).toBeHidden()

      await page.getByRole('button').click()
    }
  })

  test('Check Registration Officer navigation items', async () => {
    await login(page, CREDENTIALS.REGISTRATION_AGENT, false)

    const expectedWorkqueues = [
      'Outbox',
      'My drafts',
      'Assigned to you',
      'Recent',
      'Notifications',
      'Pending validation',
      'Pending updates',
      'Pending approval',
      'Escalated',
      'In external validation',
      'Pending certification',
      'Pending issuance'
    ]

    // All workqueues are present on home page.
    for (const item of expectedWorkqueues) {
      await expect(await page.getByRole('button', { name: item })).toBeVisible()
    }

    const expectedItemsWithFrame = ['Organisation', 'Team']

    const expectedItemsWithoutFrame = [
      'Registrations Dashboard',
      'Completeness Dashboard',
      'Registry'
    ]

    for (const item of expectedItemsWithFrame) {
      await page.getByText(item).click()

      // All workqueues are present on each page. V1 have different workqueues, so we should notice.
      for (const item of expectedWorkqueues) {
        page.getByText(item)
      }
      // All workqueues are present on each page. V1 have different workqueues, so we should notice.
      for (const item of expectedItemsWithoutFrame) {
        page.getByText(item)
      }
    }

    for (const item of expectedItemsWithoutFrame) {
      await page.getByText(item).click()
      await expect(page.locator('Farajaland CRS')).toBeHidden()

      // Only one button available (X)
      await page.getByRole('button').click()
    }
  })

  test('Check National System Admin navigation items', async () => {
    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN, false)

    const expectedItemsWithFrame = ['Organisation', 'Team']

    const expectedItemsWithoutFrame = [
      'Registrations Dashboard',
      'Completeness Dashboard',
      'Registry'
    ]

    // Should not have any workqueues, check that none of the workqueues are present
    const exampleWorkqueues = [
      'Outbox',
      'My drafts',
      'Assigned to you',
      'Recent',
      'Notifications'
    ]

    const expectedNestedItemsWithFrame = [
      ['Communications', 'Email all users'],
      ['Configuration', 'Integrations']
    ]

    for (const item of expectedItemsWithFrame) {
      await page.getByRole('button', { name: item }).click()

      for (const item of exampleWorkqueues) {
        await expect(page.locator(item)).toBeHidden()
      }

      for (const items of expectedNestedItemsWithFrame) {
        page.getByRole('button', { name: items[0] })
        await expect(page.locator(items[1])).toBeHidden()
      }

      for (const item of expectedItemsWithoutFrame) {
        page.getByRole('button', { name: item })
      }
    }

    for (const items of expectedItemsWithFrame) {
      await expect(page.locator(items[1])).toBeHidden()

      await page.getByRole('button', { name: items[0] }).click()

      await page.getByRole('button', { name: items[1] }).click()
    }

    for (const item of expectedItemsWithoutFrame) {
      await page.getByRole('button', { name: item }).click()
      await expect(page.locator('Farajaland CRS')).toBeHidden()

      // Only one button available (X)
      await page.getByRole('button').click()
    }
  })
})
