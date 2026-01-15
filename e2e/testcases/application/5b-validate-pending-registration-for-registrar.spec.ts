import { expect, test, type Page } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import {
  ensureAssigned,
  ensureInExternalValidationIsEmpty,
  ensureOutboxIsEmpty,
  expectInUrl,
  selectAction
} from '../../utils'
import { getRowByTitle } from '../print-certificate/birth/helpers'

test.describe
  .serial('5(b) Validate "Pending registration"-workqueue for Registrar', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRATION_AGENT.USERNAME,
      CREDENTIALS.REGISTRATION_AGENT.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.0 Login', async () => {
    await login(page, CREDENTIALS.LOCAL_REGISTRAR)
  })

  test('5.1 Go to "Pending registration"-workqueue', async () => {
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue.
    await page.getByText('Pending registration').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending registration'
    )
  })

  test('5.2 validate the list', async () => {
    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Registration requested',
      ''
    ])

    const row = getRowByTitle(page, formatV2ChildName(declaration))
    const cells = row.locator(':scope > div')

    expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    expect(cells.nth(1)).toHaveText('Birth')
    expect(cells.nth(2)).toHaveText(declaration['child.dob'].split('T')[0])
  })

  test('5.4 Click a name', async () => {
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()

    await expectInUrl(page, `events/${eventId}?workqueue=pending-registration`)
  })

  test('5.5 Click register action', async () => {
    await ensureAssigned(page)
    await selectAction(page, 'Register')
    await expect(
      page.getByRole('heading', { name: 'Register?', exact: true })
    ).toBeVisible()
  })

  test('5.5 Complete Registration', async () => {
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Should redirect back to "Pending registration"-workqueue
    await expect(page.locator('#content-name')).toHaveText(
      'Pending registration'
    )

    await ensureOutboxIsEmpty(page)
    await ensureInExternalValidationIsEmpty(page)
    await expectInUrl(page, 'workqueue/pending-registration')

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()

    await page.getByText('Pending certification').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
  })
})
