import { Locator, Page, expect } from '@playwright/test'
import {
  AUTH_URL,
  CLIENT_URL,
  GATEWAY_HOST,
  SAFE_INPUT_CHANGE_TIMEOUT_MS,
  SAFE_OUTBOX_TIMEOUT_MS
} from './constants'
import { format, parseISO } from 'date-fns'
import { isArray, random } from 'lodash'

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
type CorrectionSection = 'summary'

export const goToSection = async (
  page: Page,
  section: DeclarationSection | CorrectionSection
) => {
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

/**
 * @page - page object
 * @sectionLocator - locator for the section e.g. mother / father
 * @sectionTitle - title of the section to  e.g. National ID / Passport
 * @buttonLocator - locator for the button to upload the image
 */
export const uploadImageToSection = async ({
  page,
  sectionLocator,
  sectionTitle,
  buttonLocator
}: {
  page: Page
  sectionLocator: Locator
  buttonLocator: Locator
  sectionTitle: string
}) => {
  await sectionLocator.getByText('Select...').click()
  await sectionLocator.getByText(sectionTitle, { exact: true }).click()

  await uploadImage(page, buttonLocator)
}

export const expectAddress = async (
  locator: Locator,
  address: { [key: string]: any },
  isDeletion?: boolean
) => {
  const addressKeys = [
    'country',

    'state',
    'province',

    'district',

    'village',
    'town',
    'city',

    'residentialArea',
    'addressLine1',

    'street',
    'addressLine2',

    'number',
    'addressLine3',

    'postcodeOrZip',
    'postalCode',
    'zipCode'
  ]

  if (isArray(address.line)) {
    address.addressLine1 = address.line[2]
    address.addressLine2 = address.line[1]
    address.addressLine3 = address.line[0]
  }

  const texts = addressKeys
    .map((key) => address[key])
    .filter((value) => Boolean(value))

  if (isDeletion) {
    const deletionLocators = await locator.getByRole('deletion').all()
    for (let i = 0; i < texts.length; i++) {
      await expect(deletionLocators[getDeletionPosition(i)]).toContainText(
        texts[i]
      )
    }
  } else await expectTexts(locator, texts)
}

/*
  The deletion section is formatted like bellow:
  	'-'
    'Farajaland'
    'Central'
    'Ibombo'
    ''
    'Example Town' / 'Example village'
    'Mitali Residential Area'
    '4/A'
    '1324'

*/
const getDeletionPosition = (i: number) => i + (i < 3 ? 1 : 2)

export const expectTexts = async (locator: Locator, texts: string[]) => {
  for (const text of texts) {
    await expect(locator).toContainText(text)
  }
}

export const expectTextWithChangeLink = async (
  locator: Locator,
  texts: string[]
) => {
  await expectTexts(locator, texts)
  await expect(locator).toContainText('Change')
}

export const getLocationNameFromFhirId = async (fhirId: string) => {
  const res = await fetch(`${GATEWAY_HOST}/location/${fhirId}`)
  const location = (await res.json()) as fhir.Location
  return location.name
}

export async function continueForm(page: Page, label: string = 'Continue') {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
  return page.getByText(label, { exact: true }).click()
}

export async function goBackToReview(page: Page) {
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)
  await page.getByRole('button', { name: 'Back to review' }).click()
}

export const formatDateTo_yyyyMMdd = (date: string) =>
  format(parseISO(date), 'yyyy-MM-dd')

export const formatDateTo_ddMMMMyyyy = (date: string) =>
  format(parseISO(date), 'dd MMMM yyyy')

/*
  Date() object takes 0-indexed month,
  but month coming to the method is 1-indexed
*/
export const formatDateObjectTo_ddMMMMyyyy = ({
  yyyy,
  mm,
  dd
}: {
  yyyy: string
  mm: string
  dd: string
}) => format(new Date(Number(yyyy), Number(mm) - 1, Number(dd)), 'dd MMMM yyyy')

/*
  Date() object takes 0-indexed month,
  but month coming to the method is 1-indexed
*/
export const formatDateObjectTo_yyyyMMdd = ({
  yyyy,
  mm,
  dd
}: {
  yyyy: string
  mm: string
  dd: string
}) => format(new Date(Number(yyyy), Number(mm) - 1, Number(dd)), 'yyyy-MM-dd')

export const joinValuesWith = (
  values: (string | number | null | undefined)[],
  separator = ' '
) => {
  return values.filter(Boolean).join(separator)
}

type PersonOrName = {
  firstNames: string
  familyName: string
  [key: string]: any
}
export const formatName = (name: PersonOrName) => {
  return joinValuesWith([name.firstNames, name.familyName])
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

export const expectOutboxToBeEmpty = async (page: Page) => {
  /*
   * This is to ensure the following condition is asserted
   * after the outbox has the declaration
   */
  await page.waitForTimeout(SAFE_INPUT_CHANGE_TIMEOUT_MS)

  await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
    timeout: SAFE_OUTBOX_TIMEOUT_MS
  })
}

// This suffix increases randomness of a name
export const generateRandomSuffix = () => {
  const vowels = 'aeiou'
  const consonants = 'bcdfghjklmnpqrstvwxyz'

  const randomVowel = vowels.charAt(Math.floor(Math.random() * vowels.length))
  const randomConsonant = consonants.charAt(
    Math.floor(Math.random() * consonants.length)
  )

  return randomConsonant + randomVowel
}
