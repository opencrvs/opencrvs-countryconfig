import { expect, test, type Page } from '@playwright/test'
import { createPIN, getAction, getToken, login } from '../../helpers'
import faker from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'
import { format, subDays } from 'date-fns'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../birth/helpers'
import { BirthDeclaration, BirthInputDetails } from '../birth/types'

test.describe
  .serial("1. Click on 'Print certified copy' from action menu", () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  const updatedInformantDetails = {
    relationship: 'Sister',
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    birthDate: format(
      subDays(new Date(), Math.ceil(50 * Math.random() + 365 * 25)),
      'yyyy-MM-dd'
    ),
    email: faker.internet.email(),
    nationality: 'Nauru',
    id: faker.random.numeric(10),
    idType: 'Passport',
    address: {
      province: 'Sulaka',
      district: 'Irundu',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    }
  }
  const updatedChildDetails = {
    placeOfBirth: 'Residential address',
    birthLocation: {
      province: 'Pualula',
      district: 'Ienge',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    }
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0 Shortcut declaration', async () => {
    let token = await getToken('k.mweene', 'test')
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

    trackingId = res.trackingId

    token = await getToken('f.katongo', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchBirthRegistration as BirthDeclaration
  })
  test('1.1 Click continue without selecting collector type and template type', async () => {
    await login(
      page,
      CREDENTIALS.REGISTRATION_AGENT.USERNAME,
      CREDENTIALS.REGISTRATION_AGENT.PASSWORD
    )
    await createPIN(page)

    await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
    await page.getByPlaceholder('Search for a tracking ID').press('Enter')
    await page.locator('#ListItemAction-0-icon').click()
    await page.locator('#name_0').click()

    await page.getByRole('button', { name: 'Action' }).first().click()
    await getAction(page, 'Print certified copy').click()

    // await page.getByLabel('Print in advance').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Please select certificate type')).toBeVisible()
    await expect(
      page.getByText('Please select who is collecting the certificate')
    ).toBeVisible()
  })

  test('1.2 Click continue without selecting collector type', async () => {
    await page.reload({ waitUntil: 'networkidle' })
    await page.getByLabel('Print in advance').check()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByText('Please select certificate type')).toBeVisible()
  })

  test('1.3 Click continue without selecting template type', async () => {
    await page.reload({ waitUntil: 'networkidle' })

    await page
      .locator('#certificateTemplateId-form-input > span')
      .first()
      .click()
    await page.getByText('Birth Certificate').click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page.getByText('Please select who is collecting the certificate')
    ).toBeVisible()
  })
})
