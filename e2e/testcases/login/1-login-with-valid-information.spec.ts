import { test, expect } from '@playwright/test'
import { dispatchAction } from '../../helpers'
import { LOGIN_URL } from '../../constants'

test.describe('1. Login with valid information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    /*
     * Wait until config for loading page has been loaded
     */
    await page.waitForSelector('#Box img', { state: 'attached' })
    await page.waitForFunction(() => {
      const img = document.querySelector<HTMLImageElement>('#Box img')!
      return img && img.src && img.src.trim() !== ''
    })
  })

  test('1.1. Navigate to the login URL', async ({ page }) => {
    // Expected result: User should be redirected to the login page
    await expect(page.locator('#login-step-one-box')).toBeVisible()
  })

  test('1.2. Enter your username and password', async ({ page }) => {
    await page.fill('#username', 'k.mweene')
    await page.fill('#password', 'test')
    await page.click('#login-mobile-submit')

    // Expected result: User should navigate to the next page to verify through mobile number or email address
    await expect(page.locator('#login-step-two-box')).toBeVisible()
  })

  test.describe.skip('1.3. Validate 2FA', () => {
    test('Validate the SMS for 2fa', async () => {})
    test('Validate the email for 2fa', async () => {})
  })

  test('1.4. Verify through by inputting the 2FA code', async ({ page }) => {
    await dispatchAction(page, {
      type: 'login/AUTHENTICATE',
      payload: {
        username: 'k.mweene',
        password: 'test'
      }
    })

    await page.fill('#code', '000000')
    await page.click('#login-mobile-submit')

    // Expected result: Must log in to the OPEN CRVS Page
    await expect(page.locator('#appSpinner')).toBeVisible()
  })
})
