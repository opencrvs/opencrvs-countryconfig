import { expect, test } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { getToken, login, switchEventTab } from '../../helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { ensureAssigned } from '../../utils'
import { formatV2ChildName } from '../birth/helpers'

const testCases = [
  {
    credential: CREDENTIALS.FIELD_AGENT,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Hospital Official'
  },
  {
    credential: CREDENTIALS.COMMUNITY_LEADER,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Community Leader'
  },
  {
    credential: CREDENTIALS.REGISTRATION_OFFICER,
    action: ActionType.DECLARE,
    expectedAuditRole: 'Registration Officer'
  },
  {
    credential: CREDENTIALS.REGISTRAR,
    action: ActionType.REGISTER,
    expectedAuditRole: 'Registrar'
  }
]

test.describe('Roles in Record Audit', () => {
  for (const { credential, expectedAuditRole, action } of testCases) {
    test(expectedAuditRole, async ({ browser }) => {
      const page = await browser.newPage()
      const token = await getToken(credential.USERNAME, credential.PASSWORD)
      const res = await createDeclaration(token, undefined, action)

      await login(page, CREDENTIALS.REGISTRAR)

      await expect(page.locator('#content-name')).toHaveText(
        'Assigned to you',
        {
          timeout: 90000
        }
      )

      await page
        .getByRole('textbox', { name: 'Search for a record' })
        .fill(formatV2ChildName(res.declaration))

      await page.getByRole('button', { name: 'Search' }).click()
      await page
        .getByRole('button', {
          name: formatV2ChildName(res.declaration),
          exact: true
        })
        .click()

      await ensureAssigned(page)
      await switchEventTab(page, 'Audit')

      await expect(page.locator('#row_0')).toContainText(expectedAuditRole)
    })
  }
})
