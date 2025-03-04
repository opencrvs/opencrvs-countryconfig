import { test, expect, type Page } from '@playwright/test'
import {
  assignRecord,
  continueForm,
  createPIN,
  drawSignature,
  expectOutboxToBeEmpty,
  expectTextWithChangeLink,
  formatDateObjectTo_ddMMMMyyyy,
  getAction,
  getRandomDate,
  goToSection,
  joinValuesWith,
  login
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('3. Death declaration case - 3', () => {
  let page: Page
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.person.firstName('male') + ' the 2nd',
        familyName: faker.person.lastName('male')
      },
      gender: 'Unknown',
      age: 45,
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'Birth Registration Number'
      },
      maritalStatus: 'Widowed',
      address: {
        country: 'Guam',
        state: faker.location.state(),
        district: faker.location.county(),
        town: faker.location.city(),
        addressLine1: faker.location.county(),
        addressLine2: faker.location.street(),
        addressLine3: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    event: {
      manner: 'Suicide',
      date: getRandomDate(0, 20),
      cause: {
        established: true,
        source: 'Verbal autopsy',
        description: 'Hanging from ceiling'
      },
      place: "Deceased's usual place of residence"
    },
    informantType: 'Daughter',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      age: 17,
      nationality: 'Malawi',
      identifier: {
        id: faker.string.numeric(10),
        type: 'Passport'
      },
      address: {
        sameAsDeceased: false,
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },
    spouse: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 42,
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'Birth Registration Number'
      },
      address: {
        sameAsDeceased: false,
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Rural',
        village: faker.location.county()
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('3.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.FIELD_AGENT.USERNAME,
        CREDENTIALS.FIELD_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('3.1.1 Fill deceased details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.deceased.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.deceased.name.familyName)
      await page.locator('#gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#ageOfIndividualInYears')
        .fill(declaration.deceased.age.toString())

      await page.locator('#deceasedIdType').click()
      await page
        .getByText(declaration.deceased.identifier.type, { exact: true })
        .click()

      await page
        .locator('#deceasedBirthRegistrationNumber')
        .fill(declaration.deceased.identifier.id)

      await page.locator('#maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page.locator('#countryPrimaryDeceased').click()
      await page
        .getByText(declaration.deceased.address.country, { exact: true })
        .click()

      await page
        .locator('#internationalStatePrimaryDeceased')
        .fill(declaration.deceased.address.state)
      await page
        .locator('#internationalDistrictPrimaryDeceased')
        .fill(declaration.deceased.address.district)
      await page
        .locator('#internationalCityPrimaryDeceased')
        .fill(declaration.deceased.address.town)
      await page
        .locator('#internationalAddressLine1PrimaryDeceased')
        .fill(declaration.deceased.address.addressLine1)
      await page
        .locator('#internationalAddressLine2PrimaryDeceased')
        .fill(declaration.deceased.address.addressLine2)
      await page
        .locator('#internationalAddressLine3PrimaryDeceased')
        .fill(declaration.deceased.address.addressLine3)
      await page
        .locator('#internationalPostalCodePrimaryDeceased')
        .fill(declaration.deceased.address.postcodeOrZip)

      await continueForm(page)
    })

    test('3.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.event.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.event.date.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.event.date.yyyy)

      await page.locator('#mannerOfDeath').click()
      await page.getByText(declaration.event.manner, { exact: true }).click()

      page.getByLabel('Cause of death has been established').check()

      await page.locator('#causeOfDeathMethod').click()
      await page
        .getByText(declaration.event.cause.source, { exact: true })
        .click()
      await page
        .locator('#deathDescription')
        .fill(declaration.event.cause.description)

      await page.locator('#placeOfDeath').click()
      await page.getByText(declaration.event.place, { exact: true }).click()

      await continueForm(page)
    })

    test('3.1.3 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      await page
        .locator('#firstNamesEng')
        .fill(declaration.informant.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.informant.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#ageOfIndividualInYears')
        .fill(declaration.informant.age.toString())

      await page.locator('#nationality').click()
      await page
        .getByText(declaration.informant.nationality, { exact: true })
        .click()

      await page.locator('#informantIdType').click()
      await page
        .getByText(declaration.informant.identifier.type, { exact: true })
        .click()

      await page
        .locator('#informantPassport')
        .fill(declaration.informant.identifier.id)

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#statePrimaryInformant').click()
      await page
        .getByText(declaration.informant.address.province, { exact: true })
        .click()
      await page.locator('#districtPrimaryInformant').click()
      await page
        .getByText(declaration.informant.address.district, { exact: true })
        .click()

      await page
        .locator('#cityPrimaryInformant')
        .fill(declaration.informant.address.town)
      await page
        .locator('#addressLine1UrbanOptionPrimaryInformant')
        .fill(declaration.informant.address.residentialArea)
      await page
        .locator('#addressLine2UrbanOptionPrimaryInformant')
        .fill(declaration.informant.address.street)
      await page
        .locator('#addressLine3UrbanOptionPrimaryInformant')
        .fill(declaration.informant.address.number)
      await page
        .locator('#postalCodePrimaryInformant')
        .fill(declaration.informant.address.postcodeOrZip)

      await continueForm(page)
    })

    test('3.1.4 Fill spouse details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.spouse.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.spouse.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#ageOfIndividualInYears')
        .fill(declaration.spouse.age.toString())

      await page.locator('#spouseIdType').click()
      await page
        .getByText(declaration.spouse.identifier.type, { exact: true })
        .click()

      await page
        .locator('#spouseBirthRegistrationNumber')
        .fill(declaration.spouse.identifier.id)

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#statePrimarySpouse').click()
      await page
        .getByText(declaration.spouse.address.province, { exact: true })
        .click()
      await page.locator('#districtPrimarySpouse').click()
      await page
        .getByText(declaration.spouse.address.district, { exact: true })
        .click()

      await page.getByLabel('Rural').check()

      await page
        .locator('#addressLine1RuralOptionPrimarySpouse')
        .fill(declaration.spouse.address.village)

      await continueForm(page)
    })

    test('3.1.5 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('3.1.6 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Full'), [
        declaration.deceased.name.firstNames,
        declaration.deceased.name.familyName
      ])

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Sex'), [
        declaration.deceased.gender
      ])

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expect(page.locator('#deceased-content #Age')).toContainText(
        joinValuesWith([declaration.deceased.age, 'years'])
      )
      await expect(page.locator('#deceased-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deceased-content #Nationality'),
        [declaration.deceased.nationality]
      )
      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Type'), [
        declaration.deceased.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#deceased-content #ID'), [
        declaration.deceased.identifier.id
      ])

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deceased-content #Marital'),
        [declaration.deceased.maritalStatus]
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Usual'), [
        declaration.deceased.address.country,
        declaration.deceased.address.district,
        declaration.deceased.address.state,
        declaration.deceased.address.town,
        declaration.deceased.address.addressLine1,
        declaration.deceased.address.addressLine2,
        declaration.deceased.address.addressLine3,
        declaration.deceased.address.postcodeOrZip
      ])

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Date'),
        [formatDateObjectTo_ddMMMMyyyy(declaration.event.date)]
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Manner'),
        [declaration.event.manner]
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Cause'),
        ['Yes']
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Source'),
        [declaration.event.cause.source]
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Description'),
        [declaration.event.cause.description]
      )
      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [declaration.event.place]
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Informant'),
        [declaration.informantType]
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#informant-content #Full'), [
        declaration.informant.name.firstNames,
        declaration.informant.name.familyName
      ])

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        joinValuesWith([declaration.informant.age, 'years'])
      )
      await expect(page.locator('#informant-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Nationality'),
        [declaration.informant.nationality]
      )
      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#informant-content #Type'), [
        declaration.informant.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#informant-content #ID'), [
        declaration.informant.identifier.id
      ])

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Usual'),
        [
          declaration.informant.address.country,
          declaration.informant.address.province,
          declaration.informant.address.district,
          declaration.informant.address.town,
          declaration.informant.address.residentialArea,
          declaration.informant.address.street,
          declaration.informant.address.number,
          declaration.informant.address.postcodeOrZip
        ]
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Email'),
        [declaration.informantEmail]
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Full'), [
        declaration.spouse.name.firstNames,
        declaration.spouse.name.familyName
      ])

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */

      await expectTextWithChangeLink(page.locator('#spouse-content #Age'), [
        joinValuesWith([declaration.spouse.age, 'years'])
      ])

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#spouse-content #Nationality'),
        [declaration.spouse.nationality]
      )

      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Type'), [
        declaration.spouse.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#spouse-content #ID'), [
        declaration.spouse.identifier.id
      ])

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Usual'), [
        declaration.spouse.address.country,
        declaration.spouse.address.district,
        declaration.spouse.address.province,
        declaration.spouse.address.village
      ])
    })

    test('3.1.7 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('3.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expectOutboxToBeEmpty(page)

      await page.getByRole('button', { name: 'Sent for review' }).click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('3.2 Declaration Review by RA', async () => {
    test('3.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
        .click()
      await assignRecord(page)
      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Review declaration').click()
    })

    test('3.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Full'), [
        declaration.deceased.name.firstNames,
        declaration.deceased.name.familyName
      ])

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Sex'), [
        declaration.deceased.gender
      ])

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expect(page.locator('#deceased-content #Age')).toContainText(
        joinValuesWith([declaration.deceased.age, 'years'])
      )
      await expect(page.locator('#deceased-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deceased-content #Nationality'),
        [declaration.deceased.nationality]
      )
      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Type'), [
        declaration.deceased.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#deceased-content #ID'), [
        declaration.deceased.identifier.id
      ])

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deceased-content #Marital'),
        [declaration.deceased.maritalStatus]
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Usual'), [
        declaration.deceased.address.country,
        declaration.deceased.address.district,
        declaration.deceased.address.state,
        declaration.deceased.address.town,
        declaration.deceased.address.addressLine1,
        declaration.deceased.address.addressLine2,
        declaration.deceased.address.addressLine3,
        declaration.deceased.address.postcodeOrZip
      ])

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Date'),
        [formatDateObjectTo_ddMMMMyyyy(declaration.event.date)]
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Manner'),
        [declaration.event.manner]
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Cause'),
        ['Yes']
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Source'),
        [declaration.event.cause.source]
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Description'),
        [declaration.event.cause.description]
      )
      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [declaration.event.place]
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Informant'),
        [declaration.informantType]
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#informant-content #Full'), [
        declaration.informant.name.firstNames,
        declaration.informant.name.familyName
      ])

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        joinValuesWith([declaration.informant.age, 'years'])
      )
      await expect(page.locator('#informant-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Nationality'),
        [declaration.informant.nationality]
      )
      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#informant-content #Type'), [
        declaration.informant.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#informant-content #ID'), [
        declaration.informant.identifier.id
      ])

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Usual'),
        [
          declaration.informant.address.country,
          declaration.informant.address.province,
          declaration.informant.address.district,
          declaration.informant.address.town,
          declaration.informant.address.residentialArea,
          declaration.informant.address.street,
          declaration.informant.address.number,
          declaration.informant.address.postcodeOrZip
        ]
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Email'),
        [declaration.informantEmail]
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Full'), [
        declaration.spouse.name.firstNames,
        declaration.spouse.name.familyName
      ])

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Age'), [
        joinValuesWith([declaration.spouse.age, 'years'])
      ])

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#spouse-content #Nationality'),
        [declaration.spouse.nationality]
      )

      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Type'), [
        declaration.spouse.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#spouse-content #ID'), [
        declaration.spouse.identifier.id
      ])

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Usual'), [
        declaration.spouse.address.country,
        declaration.spouse.address.district,
        declaration.spouse.address.province,
        declaration.spouse.address.village
      ])
    })
  })
})
