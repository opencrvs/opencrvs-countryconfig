import { expect, test, type Page } from '@playwright/test'
import { formatName, getToken, login, searchFromSearchBar } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureAssigned, ensureOutboxIsEmpty, selectAction } from '../../utils'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { assertRecordInWorkqueue, formatV2ChildName } from '../birth/helpers'

test.describe.serial('Revoke and reinstate record', () => {
  let page: Page
  let declaration: Declaration
  let childName: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )
    declaration = (await createDeclaration(token)).declaration
    childName = formatV2ChildName(declaration)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  test('Navigate to the declaration overview page', async () => {
    await searchFromSearchBar(page, childName)
  })

  test('Revoke record', async () => {
    await ensureAssigned(page)
    await selectAction(page, 'Revoke registration')

    await expect(page.getByRole('button', { name: 'Confirm' })).toBeDisabled()

    await page.locator('#reason').fill('Revoking record for testing purposes.')

    await page.getByRole('button', { name: 'Confirm' }).click()
    await ensureOutboxIsEmpty(page)
  })

  test('Login as Registrar', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })

  test('Revoked record should not be visible in workqueues', async () => {
    await assertRecordInWorkqueue({
      page,
      name: childName,
      workqueues: [
        { title: 'Outbox', exists: false },
        { title: 'My drafts', exists: false },
        { title: 'Assigned to you', exists: false },
        { title: 'Recent', exists: false },
        { title: 'Notifications', exists: false },
        { title: 'Potential duplicate', exists: false },
        { title: 'Pending updates', exists: false },
        { title: 'Pending approval', exists: false },
        { title: 'Pending registration', exists: false },
        { title: 'Escalated', exists: false },
        { title: 'In external validation', exists: false },
        { title: 'Pending certification', exists: false },
        { title: 'Pending issuance', exists: false }
      ]
    })
  })

  test('Login again as Registrar General', async () => {
    await login(page, CREDENTIALS.REGISTRAR_GENERAL)
  })

  test('Assert "Revoked" -flag is present', async () => {
    await searchFromSearchBar(page, childName)
    await expect(page.getByText('Revoked')).toBeVisible()
  })

  test('Reinstate record', async () => {
    await selectAction(page, 'Reinstate registration')
    await page.getByRole('button', { name: 'Confirm' }).click()
    await ensureOutboxIsEmpty(page)
  })
})
