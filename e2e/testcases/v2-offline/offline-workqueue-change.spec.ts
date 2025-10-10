import { expect, test } from '@playwright/test'

import { loginToV2 } from '../../helpers'
import { mockNetworkConditions } from '../../mock-network-conditions'

test('Can Change Workqueue offline', async ({ page }) => {
  await loginToV2(page)
  await expect(page.getByText('Farajaland CRS')).toBeVisible({
    timeout: 60000
  })
  await expect(page.locator('#content-name')).toHaveText('Assigned to you')
  await mockNetworkConditions(page, 'offline')
  await page.getByRole('button', { name: 'Ready to print' }).click()
  await expect(page.locator('#content-name')).toHaveText('Ready to print')
})
