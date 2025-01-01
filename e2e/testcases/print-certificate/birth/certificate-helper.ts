import { faker } from '@faker-js/faker'
import { expect, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { getToken, login, createPIN, getAction } from '../../../helpers'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../../birth/helpers'
import { BirthInputDetails, BirthDeclaration } from '../../birth/types'

export async function getDeclarationForPrintCertificate(
  page: Page,
  options?: Record<string, any>
): Promise<{
  declaration: BirthDeclaration
  trackingId: string
}> {
  const token = await getToken(
    CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
    CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
  )
  const declarationInput = {
    child: {
      firstNames: faker.person.firstName(),
      familyName: faker.person.firstName(),
      gender: 'male',
      ...(options && { birthDate: options.child.birthDate })
    },
    informant: {
      type: 'BROTHER'
    },
    attendant: {
      type: 'PHYSICIAN'
    },
    mother: {
      firstNames: faker.person.firstName(),
      familyName: faker.person.firstName()
    },
    father: {
      firstNames: faker.person.firstName(),
      familyName: faker.person.firstName()
    }
  } as ConvertEnumsToStrings<BirthInputDetails>

  const res = await createDeclaration(token, declarationInput)
  expect(res).toStrictEqual({
    trackingId: expect.any(String),
    compositionId: expect.any(String),
    isPotentiallyDuplicate: false,
    __typename: 'CreatedIds'
  })

  const trackingId = res.trackingId
  const declaration = (await fetchDeclaration(token, res.compositionId)).data
    .fetchBirthRegistration as BirthDeclaration

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
