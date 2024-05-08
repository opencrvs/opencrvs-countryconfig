import { Page, expect } from '@playwright/test'
import { AUTH_URL, CLIENT_URL } from './constants'
type Store = {
  getState: () => any
  dispatch: (action: any) => void
}

export function dispatchAction(page: Page, reduxAction: any) {
  return page.evaluate<Store>((reduxAction) => {
    const root = window.document.getElementById('root')!
    const container = Object.entries(root).find(([x]) =>
      x.includes('reactContainer')
    )![1]

    if (!container) {
      throw new Error('React container not found')
    }

    const store = container.memoizedState?.element?.props?.store

    if (!store) {
      throw new Error('Redux store not found')
    }

    store.dispatch(reduxAction)
    return store
  }, reduxAction)
}

export async function login(page: Page, username: string, password: string) {
  const token = await getToken(username, password)
  await page.goto(`${CLIENT_URL}?token=${token}`)
  await expect(page.locator('#appSpinner')).toBeVisible()
}

export async function createPIN(page: Page) {
  await page.click('#pin-input')
  for (let i = 1; i <= 8; i++) {
    await page.type('#pin-input', `${i % 2}`)
  }
}

async function getToken(username: string, password: string) {
  const authUrl = `${AUTH_URL}/authenticate`
  const verifyUrl = `${AUTH_URL}/verifyCode`

  const authResponse = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })

  const authBody = await authResponse.json()
  const verifyResponse = await fetch(verifyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nonce: authBody.nonce,
      code: '000000'
    })
  })

  const verifyBody = await verifyResponse.json()
  return verifyBody.token
}
