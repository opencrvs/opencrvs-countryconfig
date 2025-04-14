import { faker } from '@faker-js/faker'
import { expect, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { getToken, login, createPIN, getAction } from '../../../helpers'
import { DeathDeclaration } from '../../death/types'
import {
  createDeathDeclaration,
  DeathDeclarationInput,
  fetchDeclaration
} from '../../death/helpers'

export async function getDeathDeclarationForPrintCertificate(
  page: Page,
  options?: Record<string, any>
): Promise<{
  declaration: DeathDeclaration
  trackingId: string
}> {
  const token = await getToken(
    CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
    CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
  )

  const res = await createDeathDeclaration(
    token,
    options as DeathDeclarationInput
  )
  expect(res).toStrictEqual({
    trackingId: expect.any(String),
    compositionId: expect.any(String),
    isPotentiallyDuplicate: false,
    __typename: 'CreatedIds'
  })

  const trackingId = res.trackingId
  const declaration = (await fetchDeclaration(token, res.compositionId)).data
    .fetchDeathRegistration as DeathDeclaration

  if (!options?.isLoggedIn) {
    await login(
      page,
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createPIN(page)
  }

  await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
  await page.getByPlaceholder('Search for a tracking ID').press('Enter')
  await page.locator('#ListItemAction-0-icon').click()

  const assignRecordModal = await page.locator('#assign').isVisible()
  if (assignRecordModal) {
    await page.locator('#assign').click()
  }

  await page.locator('#name_0').click()
  await page.getByRole('button', { name: 'Action' }).first().click()
  await getAction(page, 'Print certified copy').click()

  return { declaration, trackingId }
}
