import faker from '@faker-js/faker'
import { expect, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { getToken, login, createPIN, getAction } from '../../helpers'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../birth/helpers'
import { BirthInputDetails, BirthDeclaration } from '../birth/types'

export async function getDeclarationForPrintCertificate(page: Page): Promise<{
  declaration
  trackingId
}> {
  const token = await getToken(
    CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
    CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
  )
  const declarationInput = {
    child: {
      firstNames: faker.name.firstName(),
      familyName: faker.name.firstName(),
      gender: 'male'
    },
    informant: {
      type: 'BROTHER'
    },
    attendant: {
      type: 'PHYSICIAN'
    },
    mother: {
      firstNames: faker.name.firstName(),
      familyName: faker.name.firstName()
    },
    father: {
      firstNames: faker.name.firstName(),
      familyName: faker.name.firstName()
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

  await login(
    page,
    CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
    CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
  )
  await createPIN(page)

  await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
  await page.getByPlaceholder('Search for a tracking ID').press('Enter')
  await page.locator('#ListItemAction-0-icon').click()
  await page.locator('#name_0').click()

  await page.getByRole('button', { name: 'Action' }).first().click()
  await getAction(page, 'Print certified copy').click()

  return { declaration, trackingId }
}
