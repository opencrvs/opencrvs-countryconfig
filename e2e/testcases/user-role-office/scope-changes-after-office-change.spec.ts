import { expect, test, type Page } from '@playwright/test'
import { ActionType } from '@opencrvs/toolkit/events'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import {
  drawSignature,
  getToken,
  login,
  logout,
  searchFromSearchBar
} from '../../helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { formatV2ChildName } from '../birth/helpers'

test.describe.serial(
  'Scope changes after office change - registrar should lose access to old office records',
  () => {
    let page: Page

    let trackingId: string
    let eventId: string
    let childName: string

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
      
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('k.mweene can initially access a record from Ibombo District Office', async () => {
      const token = await getToken(CREDENTIALS.REGISTRAR)
      const declaration = await createDeclaration(
        token,
        undefined,
        ActionType.DECLARE
      )

      trackingId = declaration.trackingId!
      eventId = declaration.eventId
      childName = formatV2ChildName(declaration.declaration)

      await login(page, CREDENTIALS.REGISTRAR)
      await searchFromSearchBar(page, childName, true)

      await expect(page.getByTestId('tracking-id-value')).toContainText(
        trackingId
      )
    })

    test('Local administrator moves k.mweene to Isamba District Office', async () => {
      await logout(page)
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)

      await page.getByRole('button', { name: 'Organisation' }).click()
      await page.getByRole('button', { name: 'Central' }).click()
      await page.getByRole('button', { name: 'Ibombo' }).click()
      await page.getByRole('button', { name: 'Ibombo District Office'}).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Ibombo District Office'
      )

      await page.getByRole('button', { name: 'Kennedy Mweene' }).click()
      await expect(page.locator('#content-name')).toHaveText('Kennedy Mweene')

      await page.locator('#sub-page-header-munu-button-dropdownMenu').click()
      await page.getByText('Edit details').click()
      await expect(page.getByText('Confirm details')).toBeVisible()

      await page.getByTestId('change-button-primaryOfficeId').click()
      await page.locator('#searchable-select-primaryOfficeId').click()
      await page.locator('#primaryOfficeId').fill('Isamba')
      await page.getByText('Isamba District Office').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      await page.locator('#role').click()
      await page.locator('#react-select-2-option-1').click()
      await page.getByRole('button', { name: 'Continue' }).click()

      // await expect(page.getByTestId('row-value-primaryOfficeId')).toHaveText(
      //   'Isamba District Office, Isamba, Central, Farajaland'
      // )
      // await expect(page.getByTestId('row-value-role')).toHaveText('Registrar')

      const signButton = page.getByRole('button', { name: 'Sign', exact: true })
      if (await signButton.isVisible()) {
        await signButton.click()
        await drawSignature(page, 'signature_canvas_element', false)
        await page.getByRole('button', { name: 'Apply' }).click()
      }

      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await page.getByTestId('confirm_office_change').click()


      await expect(page.getByTestId('office-link-value')).toHaveText(
        'Isamba District Office'
      )
    })

    test('k.mweene can no longer find the Ibombo record after the office change', async () => {
      await logout(page)
      await login(page, CREDENTIALS.REGISTRAR, true)

      await searchFromSearchBar(page, trackingId, false)
      await expect(
        page.getByRole('button', { name: trackingId, exact: true })
      ).not.toBeVisible()

      await page.goto(`${CLIENT_URL}/events/${eventId}`)
      await expect(
        page.getByText(`No event or draft found with id: ${eventId}`)
      ).toBeVisible({ timeout: 30_000 })
    })
  }
)
