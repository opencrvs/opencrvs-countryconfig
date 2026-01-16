import { expect, test, type Page } from '@playwright/test'

import { login, getToken, searchFromSearchBar } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'

async function getActionMenuOptions(page: Page, declaration: Declaration) {
  await searchFromSearchBar(page, formatV2ChildName(declaration))
  await page.getByRole('button', { name: 'Action', exact: true }).click()
  const options = await page.locator('#action-Dropdown-Content li').all()
  const textContents = await Promise.all(
    options.map((option) => option.textContent())
  )
  return textContents
}

test.describe('Action menu options', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  test.describe('Event status: DECLARED', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(
        CREDENTIALS.FIELD_AGENT.USERNAME,
        CREDENTIALS.FIELD_AGENT.PASSWORD
      )
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Registration Officer', async () => {
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Edit',
        'Validate declaration',
        'Reject',
        'Archive'
      ])
    })

    test('Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Register',
        'Edit',
        'Reject',
        'Archive',
        'Escalate'
      ])
    })
  })

  test.describe('Event status: DECLARED and flag: validated', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(
        CREDENTIALS.REGISTRAR.USERNAME,
        CREDENTIALS.REGISTRAR.PASSWORD
      )
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      declaration = res.declaration
    })

    test('Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Register',
        'Edit',
        'Reject',
        'Archive',
        'Escalate'
      ])
    })
  })

  test.describe('Event status: REGISTERED', async () => {
    let declaration: Declaration

    test.beforeAll(async () => {
      const token = await getToken(
        CREDENTIALS.REGISTRAR.USERNAME,
        CREDENTIALS.REGISTRAR.PASSWORD
      )
      const res = await createDeclaration(token, undefined)
      declaration = res.declaration
    })

    test('Registrar', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      const options = await getActionMenuOptions(page, declaration)
      expect(options).toStrictEqual([
        'Assign',
        'Escalate',
        'Print',
        'Correct record'
      ])
    })
  })
})
