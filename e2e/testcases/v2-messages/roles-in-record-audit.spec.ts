import { expect, test } from '@playwright/test'
import { CLIENT_V2_URL, CREDENTIALS } from '../../constants'
import { getToken, joinValuesWith, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssigned } from '../../v2-utils'

const testCases = [
  {
    credential: CREDENTIALS.FIELD_AGENT,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Hospital Clerk'
  },

  {
    credential: CREDENTIALS.ANOTHER_FIELD_AGENT,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Community Leader'
  },
  {
    credential: CREDENTIALS.REGISTRATION_AGENT,
    action: ActionType.VALIDATE,
    expectedAuditRole: 'Registration Agent'
  },
  {
    credential: CREDENTIALS.LOCAL_REGISTRAR,
    action: ActionType.REGISTER,
    expectedAuditRole: 'Local Registrar'
  }
]

test.describe('Roles in Record Audit', () => {
  for (const { credential, expectedAuditRole, action } of testCases) {
    test(expectedAuditRole, async ({ page }) => {
      const token = await getToken(credential.USERNAME, credential.PASSWORD)
      const res = await createDeclaration(token, undefined, action)
      const eventId = res.eventId

      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
      await page.goto(
        joinValuesWith([CLIENT_V2_URL, 'events', 'overview', eventId], '/')
      )

      await ensureAssigned(page)

      await expect(page.locator('#row_0')).toContainText(expectedAuditRole)
    })
  }
})
