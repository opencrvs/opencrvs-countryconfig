import { expect, test } from '@playwright/test'
import { CLIENT_V2_URL, CREDENTIALS } from '../../constants'
import { getToken, joinValuesWith, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssigned } from '../../v2-utils'

test.describe('Roles in Record Audit', () => {
  test('Hospital Clerk (Field Agent)', async ({ page }) => {
    const token = await getToken(
      CREDENTIALS.FIELD_AGENT.USERNAME,
      CREDENTIALS.FIELD_AGENT.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    const eventId = res.eventId

    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
    await page.goto(
      joinValuesWith([CLIENT_V2_URL, 'events', 'overview', eventId], '/')
    )

    await ensureAssigned(page)
    await expect(page.locator('#row_0')).toContainText('Hospital Clerk')
  })

  test('Community Leader (Another Field Agent)', async ({ page }) => {
    const token = await getToken(
      CREDENTIALS.ANOTHER_FIELD_AGENT.USERNAME,
      CREDENTIALS.ANOTHER_FIELD_AGENT.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    const eventId = res.eventId

    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
    await page.goto(
      joinValuesWith([CLIENT_V2_URL, 'events', 'overview', eventId], '/')
    )

    await ensureAssigned(page)
    await expect(page.locator('#row_0')).toContainText('Community Leader')
  })

  test('Registration Agent', async ({ page }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRATION_AGENT.USERNAME,
      CREDENTIALS.REGISTRATION_AGENT.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.VALIDATE)
    const eventId = res.eventId

    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
    await page.goto(
      joinValuesWith([CLIENT_V2_URL, 'events', 'overview', eventId], '/')
    )

    await ensureAssigned(page)
    await expect(page.locator('#row_0')).toContainText('Registration Agent')
  })

  test('Local Registrar', async ({ page }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.REGISTER)
    const eventId = res.eventId

    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
    await page.goto(
      joinValuesWith([CLIENT_V2_URL, 'events', 'overview', eventId], '/')
    )

    await ensureAssigned(page)
    await expect(page.locator('#row_0')).toContainText('Local Registrar')
  })
})
