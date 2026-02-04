import { expect, test, type Page } from '@playwright/test'

import { login, getToken, selectDeclarationAction } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  expectInUrl,
  navigateToWorkqueue,
  selectAction
} from '../../utils'
import { getRowByTitle } from '../print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'

test.describe.serial('4(b) Validate "Pending updates"-workqueue for RO', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER.USERNAME,
      CREDENTIALS.REGISTRATION_OFFICER.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('4.0.1 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('4.0.2 Navigate to record audit', async () => {
    await page.getByText('Pending registration').click()

    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()
  })

  test('4.0.3 Reject a declaration', async () => {
    await ensureAssigned(page)
    await selectAction(page, 'Reject')

    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

    await page.getByRole('button', { name: 'Send For Update' }).click()
  })

  test('4.1 Go to "Pending updates"-workqueue', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue.
    await page.getByText('Pending updates').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending updates'
    )
  })

  test('4.2 validate the list', async () => {
    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Update requested',
      ''
    ])

    const row = getRowByTitle(page, formatV2ChildName(declaration))

    const cells = row.locator(':scope > div')

    expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    expect(cells.nth(1)).toHaveText('Birth')
    expect(cells.nth(2)).toHaveText(declaration['child.dob'].split('T')[0])
  })

  test('4.3 Click a name', async () => {
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()

    // User should navigate to record audit page
    await expectInUrl(page, `events/${eventId}?workqueue=pending-updates`)
  })

  test('4.4 Click Edit -action', async () => {
    await ensureAssigned(page)
    await selectAction(page, 'Edit')
  })

  test('4.5 Complete declare with edits action', async () => {
    await page.getByTestId('change-button-child.weightAtBirth').click()
    await page.getByTestId('number__child____weightAtBirth').fill('2.6')
    await page.getByRole('button', { name: 'Back to review' }).click()

    await selectDeclarationAction(page, 'Declare with edits')

    // Should redirect back to "Pending updates"-workqueue
    await expect(page.locator('#content-name')).toHaveText('Pending updates')

    await ensureOutboxIsEmpty(page)

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })

  test('4.6 Assert record has correct flags', async () => {
    await navigateToWorkqueue(page, 'Recent')
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()
    await expect(page.getByTestId('flags-value')).toHaveText('Validated')
    await expect(page.getByTestId('flags-value')).not.toHaveText(
      'Edit in progress'
    )
  })
})
