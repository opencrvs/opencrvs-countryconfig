import { test, expect, type Page } from '@playwright/test'
import { formatName, goToSection, login } from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureOutboxIsEmpty } from '../../../utils'
import { selectDeclarationAction } from '../../../helpers'

test.describe.serial('Community leader notifies birth', () => {
  let page: Page

  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login as Community leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  test('Initiate birth declaration', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('Fill child details', async () => {
    await page.locator('#firstname').fill(childName.firstNames)
    await page.locator('#surname').fill(childName.familyName)
  })

  test('Continue to review', async () => {
    await goToSection(page, 'review')
  })

  test('Notify', async () => {
    await selectDeclarationAction(page, 'Notify')

    await ensureOutboxIsEmpty(page)
  })

  test('Open record', async () => {
    await page.getByText('Recent').click()

    await page
      .getByRole('button', {
        name: formatName(childName)
      })
      .click()
  })

  test('Assert that record is notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })
})
