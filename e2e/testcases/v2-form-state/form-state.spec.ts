import { expect, test } from '@playwright/test'
import {
  drawSignature,
  formatName,
  getToken,
  goToSection,
  loginToV2
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { fillChildDetails, openBirthDeclaration } from '../v2-birth/helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { selectAction } from '../../v2-utils'

test.describe('Form state', () => {
  test.beforeEach(async ({ page }) => {
    await loginToV2(page)
  })

  test('Filled declaration form state or annotation is not persisted to a new event', async ({
    page
  }) => {
    await openBirthDeclaration(page)
    const childName = await fillChildDetails(page)

    await goToSection(page, 'review')

    // Fill annotation
    const sentence = faker.lorem.sentence(5)
    await page.locator('#review____comment').fill(sentence)
    await page.getByRole('button', { name: 'Sign' }).click()
    await drawSignature(page, true)
    await page.getByRole('button', { name: 'Apply' }).click()

    // Save & Exit draft
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(
      page.getByRole('button', { name: childName, exact: true })
    ).toBeVisible()

    await openBirthDeclaration(page)
    await goToSection(page, 'review')

    // Child name fields should be empty
    await expect(page.getByTestId('row-value-child.firstname')).toHaveText(
      'Required for registration'
    )
    await expect(page.getByTestId('row-value-child.surname')).toHaveText(
      'Required for registration'
    )
    // Comment should be empty and sign button should be visible
    await expect(page.locator('#review____comment')).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Sign' })).toBeVisible()
  })

  test('Filled declaration form state or annotation is not persisted to another events action', async ({
    page
  }) => {
    // First create a draft event, which we will come back to later
    await openBirthDeclaration(page)
    const actionableEventChildName = await fillChildDetails(page)
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Now create another draft and fill in more details, incl. annotation
    await openBirthDeclaration(page)
    await fillChildDetails(page)
    await page.getByRole('button', { name: 'Continue' }).click()
    await page
      .getByTestId('text__informant____email')
      .fill(faker.internet.email())

    await goToSection(page, 'review')

    // Fill annotation
    const sentence = faker.lorem.sentence(5)
    await page.locator('#review____comment').fill(sentence)
    await page.getByRole('button', { name: 'Sign' }).click()
    await drawSignature(page, true)
    await page.getByRole('button', { name: 'Apply' }).click()

    // Save & Exit draft
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await page
      .getByRole('button', { name: actionableEventChildName, exact: true })
      .click()

    await selectAction(page, 'Declare')

    await expect(page.getByTestId('row-value-informant.email')).toHaveText(
      'Required for registration'
    )
    // Comment should be empty and sign button should be visible
    await expect(page.locator('#review____comment')).toHaveValue('')
    await expect(page.getByRole('button', { name: 'Sign' })).toBeVisible()
  })
})
