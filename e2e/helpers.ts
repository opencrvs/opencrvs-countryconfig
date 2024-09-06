import { Locator, Page, expect } from '@playwright/test'
import { AUTH_URL, CLIENT_URL, GATEWAY_HOST } from './constants'
import { random } from 'lodash'

export async function login(page: Page, username: string, password: string) {
  const token = await getToken(username, password)
  await page.goto(`${CLIENT_URL}?token=${token}`)
  await expect(
    page.locator('#appSpinner').or(page.locator('#pin-input'))
  ).toBeVisible()
}

export async function createPIN(page: Page) {
  await page.click('#pin-input')
  for (let i = 1; i <= 8; i++) {
    await page.type('#pin-input', `${i % 2}`)
  }
}

export async function getToken(username: string, password: string) {
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

type DeclarationSection =
  | 'child'
  | 'informant'
  | 'father'
  | 'mother'
  | 'documents'
  | 'preview'
  | 'groom'
  | 'bride'
  | 'marriageEvent'
  | 'witnessOne'
  | 'witnessTwo'

export const goToSection = async (page: Page, section: DeclarationSection) => {
  while (!page.url().includes(section)) {
    await page.getByRole('button', { name: 'Continue' }).click()
  }
}

/*
  Generates a random past date
  at least 'minAge' years ago
  and up to an additional 'range' days earlier
*/
export const getRandomDate = (minAge: number, range: number) => {
  const randomDate = new Date()
  randomDate.setDate(
    new Date().getDate() -
      Math.random() * range -
      minAge * 365 -
      (minAge + 3) / 4
  )
  const [yyyy, mm, dd] = randomDate.toISOString().split('T')[0].split('-')
  return { dd, mm, yyyy }
}

export async function ensureLoginPageReady(page: Page) {
  /*
   * Wait until config for loading page has been loaded
   */
  await page.waitForSelector('#Box img', { state: 'attached' })
  await page.waitForFunction(() => {
    const img = document.querySelector<HTMLImageElement>('#Box img')!
    return img && img.src && img.src.trim() !== ''
  })
}

export async function validateSectionButtons(page: Page) {
  await expect(page.getByText('Continue', { exact: true })).toBeVisible()
  await expect(page.getByText('Exit', { exact: true })).toBeVisible()
  await expect(page.getByText('Save & Exit', { exact: true })).toBeVisible()
  await expect(page.locator('#eventToggleMenuToggleButton')).toBeVisible()
}

export const uploadImage = async (
  page: Page,
  locator: Locator,
  image = './e2e/assets/528KB-random.png'
) => {
  const fileChooserPromise = page.waitForEvent('filechooser')
  await locator.click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(image)
}

export const getLocationNameFromFhirId = async (fhirId: string) => {
  const res = await fetch(`${GATEWAY_HOST}/location/${fhirId}`)
  const location = (await res.json()) as fhir.Location
  return location.name
}

export async function continueForm(page: Page) {
  /*
   * This timeout is to ensure that all previous actions have been completed
   * including filling inputs and that the changed values have been reflected
   * also to the Redux state. 500ms is selected as a safe value.
   */
  await page.waitForTimeout(500)
  return page.getByText('Continue', { exact: true }).click()
}

export const drawSignature = async (page: Page) => {
  const canvas = page.locator('#informantSignature_modal canvas')
  const rect = await canvas.boundingBox()

  expect(rect).toBeTruthy()
  if (rect) {
    const center = {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    }

    const points = Array(10)
      .fill(null)
      .map(() => ({
        x: random(0.05, 0.95),
        y: random(0.05, 0.95)
      }))

    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    for (const point of points) {
      await page.mouse.move(
        rect.x + point.x * rect.width,
        rect.y + point.y * rect.height
      )
    }
    await page.mouse.up()
  }
}
