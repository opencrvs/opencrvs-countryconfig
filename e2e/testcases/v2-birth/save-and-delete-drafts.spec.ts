import { expect, test, type Page } from '@playwright/test'
import { goToSection, loginToV2, logout } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { fillChildDetails, openBirthDeclaration } from './helpers'

test.describe('Save and delete drafts', () => {
  test.beforeEach(async ({ page }) => {
    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
    await openBirthDeclaration(page)
  })

  test('Save draft via Save & Exit', async ({ page }) => {
    const childName = await fillChildDetails(page)
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await expect(
      page.getByText(
        'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.getByRole('button', { name: childName, exact: true }).click()
    await expect(page.locator('#content-name')).toHaveText(childName)
  })

  test('Delete saved draft', async ({ page }) => {
    const childName = await fillChildDetails(page)
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.waitForTimeout(2000)
    await page.getByRole('button', { name: childName, exact: true }).click()
    await page.getByRole('button', { name: 'Action', exact: true }).click()
    await page.getByText('Declare').click()
    await page.locator('#event-menu-dropdownMenu').click()
    await page.getByText('Delete declaration').click()

    await expect(
      page.getByText('Are you sure you want to delete this declaration?')
    ).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })

  test('Exit without saving', async ({ page }) => {
    const childName = await fillChildDetails(page)
    await goToSection(page, 'review')
    await page.getByRole('button', { name: 'Exit', exact: true }).click()

    await expect(
      page.getByText(
        'You have unsaved changes on your declaration form. Are you sure you want to exit without saving?'
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Confirm', exact: true }).click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })

  test('Saved draft is not visible to other users', async ({ page }) => {
    const childName = await fillChildDetails(page)
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await expect(
      page.getByText(
        'All inputted data will be kept secure for future editing. Are you ready to save any changes to this declaration form?'
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).toBeVisible()

    await logout(page)
    await loginToV2(page, CREDENTIALS.NATIONAL_REGISTRAR)

    await expect(page.getByText('All events')).toBeVisible()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).not.toBeVisible()
  })
})
