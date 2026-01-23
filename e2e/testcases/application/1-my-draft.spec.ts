import { expect, test, type Page } from '@playwright/test'

import {
  formatName,
  goToSection,
  login,
  selectDeclarationAction
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { getRowByTitle } from '../print-certificate/birth/helpers'
import { ensureOutboxIsEmpty, selectAction } from '../../utils'

test.describe.serial('1: Validate my draft tab', () => {
  let page: Page
  const name = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.lastName('male')
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1 Record does not appear in draft ', async () => {
    await login(page, CREDENTIALS.FIELD_AGENT)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name)
    )
  })

  test('1.2 Create a draft', async () => {
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name.firstNames)
    await page.locator('#surname').fill(name.familyName)

    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
  })

  test('1.3 Record appears in draft ', async () => {
    await ensureOutboxIsEmpty(page)

    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).toContainText(
      formatName(name)
    )
  })

  test('1.4 Record does not appear in draft for other user: RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name)
    )
  })

  test('1.5 Record does not appear in draft for other user: LR ', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name)
    )
  })

  test('1.6 Record does not appear in draft after notifying ', async () => {
    await login(page, CREDENTIALS.FIELD_AGENT, true)
    await page.getByRole('button', { name: 'Drafts' }).click()

    await getRowByTitle(page, formatName(name))
      .getByRole('button', {
        name: 'Review'
      })
      .click()

    await selectAction(page, 'Declare')
    await goToSection(page, 'review')
    await selectDeclarationAction(page, 'Notify')

    await ensureOutboxIsEmpty(page)

    await expect(page.getByTestId('search-result')).toContainText('Drafts')
    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name)
    )
  })
})
