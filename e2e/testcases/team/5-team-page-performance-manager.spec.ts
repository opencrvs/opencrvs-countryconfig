import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial('5. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('5.1 Basic UI check', async () => {
    test('5.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PERFORMANCE_MANAGER)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText('HQ Office')

      await page.getByText('Embe, Pualula')
    })

    const team = [
      { name: 'Joseph Musonda', role: 'Registrar General', disabled: true },
      { name: 'Edgar Kazembe', role: 'Operations Manager', disabled: true },
      {
        name: 'Jonathan Campbell',
        role: 'National Administrator',
        disabled: true
      }
    ]

    test('5.1.1 Verify Team Members, Roles and their statuses', async () => {
      const rows = page.locator('#user_list tr:has(td)')
      await expect(rows).toHaveCount(team.length)

      for (let i = 0; i < team.length; i++) {
        const cells = rows.nth(i).locator('td')
        await expect(cells.nth(1)).toHaveText(team[i].name)
        await expect(cells.nth(2)).toHaveText(team[i].role)
        await expect(cells.nth(3)).toHaveText('Active')

        if (team[i].disabled) {
          await expect(
            rows.nth(i).getByRole('button', { name: team[i].name })
          ).toBeDisabled()
        }
      }
    })

    test('5.2.2 Verify for different locations', async () => {
      await page.getByRole('button', { name: /HQ Office/ }).click()
      await page.getByTestId('locationSearchInput').fill('Il')
      await page.getByText(/Ilanga District Office/).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Ilanga District Office'
      )

      await expect(
        page.getByText('Ilanga, Sulaka', {
          exact: true
        })
      ).toBeVisible()
    })
  })
})
