import { Page, expect, test } from '@playwright/test'
import { goToSection, login } from '../../helpers'
import { openBirthDeclaration } from '../birth/helpers'

async function authenticateInformantWithESignet(page: Page) {
  await page.locator('#informant____verify').click()

  // Only tested with mosip-mock so far
  // https://github.com/opencrvs/mosip/blob/release-v1.8.0/packages/esignet-mock/src/index.ts#L166
  await expect(page).toHaveURL(/authorize/)
  // https://github.com/opencrvs/mosip/blob/release-v1.8.0/docs/mock-identities.json#L8
  await page.locator('#id-input').fill('1234567890')
  await page.locator('#authenticate').click()
  await expect(page).not.toHaveURL(/authorize/)
}

test.describe
  .serial('E-Signet LINK_BUTTON inserts and locks informant data', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page)
  })

  test('Name and DOB are inserted+disabled, National ID is unavailable', async () => {
    await openBirthDeclaration(page)
    await goToSection(page, 'informant')

    await page.locator('#informant____relation').click()
    await page.getByText('Brother', { exact: true }).click()

    await authenticateInformantWithESignet(page)

    await expect(page.getByText('ID Authenticated')).toBeVisible({
      timeout: 30_000
    })

    await expect(page.locator('#firstname')).toHaveValue('Charles')
    await expect(page.locator('#surname')).toHaveValue('Doe 2nd')
    await expect(page.locator('#firstname')).toBeDisabled()
    await expect(page.locator('#surname')).toBeDisabled()

    await expect(page.locator('#informant____dob-dd')).toHaveValue('29')
    await expect(page.locator('#informant____dob-mm')).toHaveValue('02')
    await expect(page.locator('#informant____dob-yyyy')).toHaveValue('2008')

    await expect(page.locator('#informant____dob-dd')).toBeDisabled()
    await expect(page.locator('#informant____dob-mm')).toBeDisabled()
    await expect(page.locator('#informant____dob-yyyy')).toBeDisabled()

    await expect(page.locator('#informant____nid')).toBeHidden()
  })
})
