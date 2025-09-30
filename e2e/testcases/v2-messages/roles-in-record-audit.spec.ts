import { expect, test } from '@playwright/test'
import { CLIENT_V2_URL, CREDENTIALS } from '../../constants'
import { auditRecord, getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssigned } from '../../v2-utils'
import { formatV2ChildName } from '../v2-birth/helpers'

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
    test(expectedAuditRole, async ({ browser }) => {
      const page = await browser.newPage()
      const token = await getToken(credential.USERNAME, credential.PASSWORD)
      const res = await createDeclaration(token, undefined, action)

      await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)

      await expect(page.locator('#content-name')).toHaveText(
        'Assigned to you',
        {
          timeout: 90000
        }
      )

      await page
        .getByRole('textbox', { name: 'Search for a tracking ID' })
        .fill(formatV2ChildName(res.declaration))

      await page.getByRole('button', { name: 'Search' }).click()
      await page
        .getByRole('button', {
          name: formatV2ChildName(res.declaration),
          exact: true
        })
        .click()

      await ensureAssigned(page)

      await expect(page.locator('#row_0')).toContainText(expectedAuditRole)
    })
  }
})
