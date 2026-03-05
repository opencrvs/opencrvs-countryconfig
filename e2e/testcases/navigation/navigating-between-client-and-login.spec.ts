import { expect, test } from '@playwright/test'
import { CLIENT_URL, CREDENTIALS, LOGIN_URL } from '../../constants'
import { createPIN, ensureLoginPageReady, logout } from '../../helpers'

test('Navigating between client and login', async ({ page }) => {
  await test.step('Go to client unauthenticated', async () => {
    await page.goto(CLIENT_URL)
    await page.waitForURL((url) => url.origin === LOGIN_URL)
    await ensureLoginPageReady(page)
  })

  await test.step('Login step one', async () => {
    await page.fill('#username', CREDENTIALS.REGISTRAR.USERNAME)
    await page.fill('#password', CREDENTIALS.REGISTRAR.PASSWORD)
    await page.click('#login-mobile-submit')
  })

  await test.step('Login step two', async () => {
    await page.fill('#code', '000000')
    await page.click('#login-mobile-submit')
    await page.waitForURL((url) => url.origin === CLIENT_URL)
  })

  await test.step('Logout', async () => {
    await createPIN(page)

    await logout(page)
    await page.waitForURL((url) => url.origin === LOGIN_URL)
  })
})
