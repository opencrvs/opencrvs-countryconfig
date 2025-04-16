import { expect, test, type Page } from '@playwright/test'
import { formatName, goToSection, loginToV2 } from '../../helpers'
import { faker } from '@faker-js/faker'

async function openBirthDeclarationAndFillChildDetails(page: Page) {
  await loginToV2(page)
  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  return page
}

async function fillChildDetails(page: Page) {
  const firstName = faker.person.firstName('female')
  const lastName = faker.person.lastName('female')
  await page.locator('#child____firstname').fill(firstName)
  await page.locator('#child____surname').fill(lastName)

  return formatName({ firstNames: firstName, familyName: lastName })
}

test.describe('9. Save and delete drafts', () => {
  test.beforeEach(async ({ page }) => {
    await openBirthDeclarationAndFillChildDetails(page)
  })

  test('9.1 Save draft via Save & Exit', async ({ page }) => {
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
  })

  test('9.2 Delete saved draft', async ({ page }) => {
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

  test('9.3 Exit without saving', async ({ page }) => {
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
})
