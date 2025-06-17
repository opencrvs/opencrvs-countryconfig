import { expect, Page, test } from '@playwright/test'
import { drawSignature, getToken, goToSection, loginToV2 } from '../../helpers'
import { faker } from '@faker-js/faker'
import { fillChildDetails, openBirthDeclaration } from '../v2-birth/helpers'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../v2-test-data/birth-declaration'
import { selectAction } from '../../v2-utils'
import {
  navigateToCertificatePrintAction,
  selectRequesterType
} from '../v2-print-certificate/birth/helpers'

test.describe('Form state', () => {
  test.describe
    .serial('Declaration form state or annotation is not persisted to a new event', async () => {
    let childName = ''
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      await loginToV2(page)
    })

    test('Create a draft', async () => {
      await openBirthDeclaration(page)
      childName = await fillChildDetails(page)

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
    })

    test('Form states and annotations are not persisted', async () => {
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
  })

  test.describe
    .serial('Declaration form state or annotation is not persisted to another events action', async () => {
    let page: Page
    let actionableEventChildName = ''

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })
    test('Login', async () => {
      await loginToV2(page)
    })

    // First create a draft event, which we will come back to later
    test('Create a draft', async () => {
      await openBirthDeclaration(page)
      actionableEventChildName = await fillChildDetails(page)
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
    })

    test('Form states and annotations are not persisted', async () => {
      await page
        .getByRole('button', { name: actionableEventChildName, exact: true })
        .click()

      await selectAction(page, 'Declare')

      await expect(
        page.getByTestId('row-value-child.firstname')
      ).not.toHaveText('Required for registration')
      await expect(page.getByTestId('row-value-child.surname')).not.toHaveText(
        'Required for registration'
      )
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        'Required for registration'
      )
      // Comment should be empty and sign button should be visible
      await expect(page.locator('#review____comment')).toHaveValue('')
      await expect(page.getByRole('button', { name: 'Sign' })).toBeVisible()
    })
  })

  test.describe
    .serial('Action annotation state is not persisted to another action instance', async () => {
    let declaration: Declaration
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('Login', async () => {
      await loginToV2(page)
    })

    test('Create a declaration', async () => {
      const token = await getToken(
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      declaration = (await createDeclaration(token)).declaration
      await page.reload()
    })
    test('Form states and annotations are not persisted', async () => {
      expect(declaration).toBeDefined()

      await page.getByRole('button', { name: 'Ready to print' }).click()
      await navigateToCertificatePrintAction(page, declaration!)
      await selectRequesterType(page, 'Print and issue to someone else')

      await page
        .getByTestId('text__collector____OTHER____firstName')
        .fill(faker.person.firstName())

      await page.getByTestId('exit-button').click()

      await navigateToCertificatePrintAction(page, declaration!)

      await expect(
        page.getByTestId('select__collector____requesterId')
      ).not.toHaveText('Print and issue to someone else')

      await expect(
        page.getByTestId('text__collector____OTHER____firstName')
      ).not.toBeVisible()
    })
  })
})
