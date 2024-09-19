import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  createPIN,
  drawSignature,
  expectOutboxToBeEmpty,
  expectTextWithChangeLink,
  formatDateObjectTo_ddMMMMyyyy,
  getRandomDate,
  goToSection,
  joinValuesWith,
  login,
  uploadImageToSection
} from '../../../helpers'
import faker from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('4. Death declaration case - 4', () => {
  let page: Page
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.name.firstName('female') + '_Nolas',
        familyName: faker.name.lastName('female')
      },
      gender: 'Female',
      age: 45,
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      maritalStatus: 'Divorced',
      address: {
        country: 'Guam',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    event: {
      manner: 'Homicide',
      date: getRandomDate(0, 20),
      cause: {
        established: true,
        source: 'Medically Certified Cause of Death'
      },
      place: 'Health Institution',
      deathLocation: 'Railway GRZ Urban Health Centre'
    },
    informantType: 'Son in law',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      age: 17,
      nationality: 'Malawi',
      identifier: {
        id: faker.random.numeric(10),
        type: 'Birth Registration Number'
      },
      address: {
        sameAsDeceased: false,
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Rural',
        village: faker.address.county()
      }
    },
    spouse: {
      name: {
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      age: 42,
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      address: {
        sameAsDeceased: false,
        country: 'Guam',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('4.1 Declaration started by RA', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('4.1.1 Fill deceased details', async () => {
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

    test('4.1.2 Fill event details', async () => {
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

      await page.locator('#placeOfDeath').click()
      await page.getByText(declaration.event.place, { exact: true }).click()

      await page
        .locator('#deathLocation')
        .fill(declaration.event.deathLocation.slice(0, 3))

      await page
        .getByText(declaration.event.deathLocation, { exact: true })
        .click()

      await continueForm(page)
    })

    test('4.1.3 Fill informant details', async () => {
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
        .locator('#informantBirthRegistrationNumber')
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

      await page.getByText('Rural', { exact: true }).click()

      await page
        .locator('#addressLine1RuralOptionPrimaryInformant')
        .fill(declaration.informant.address.village)

      await continueForm(page)
    })

    test('4.1.4 Fill spouse details', async () => {
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

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#countryPrimarySpouse').click()
      await page
        .getByText(declaration.spouse.address.country, { exact: true })
        .click()

      await page
        .locator('#internationalStatePrimarySpouse')
        .fill(declaration.spouse.address.state)
      await page
        .locator('#internationalDistrictPrimarySpouse')
        .fill(declaration.spouse.address.district)
      await page
        .locator('#internationalCityPrimarySpouse')
        .fill(declaration.spouse.address.town)
      await page
        .locator('#internationalAddressLine1PrimarySpouse')
        .fill(declaration.spouse.address.addressLine1)
      await page
        .locator('#internationalAddressLine2PrimarySpouse')
        .fill(declaration.spouse.address.addressLine2)
      await page
        .locator('#internationalAddressLine3PrimarySpouse')
        .fill(declaration.spouse.address.addressLine3)
      await page
        .locator('#internationalPostalCodePrimarySpouse')
        .fill(declaration.spouse.address.postcodeOrZip)

      await continueForm(page)
    })

    test('4.1.5 Upload supporting document', async () => {
      await goToSection(page, 'documents')

      const imageUploadSections = [
        ['uploadDocForDeceased', 'Birth certificate'],
        ['uploadDocForInformant', 'Other'],
        ['uploadDocForDeceasedDeath', 'Police certificate of death'],
        ['uploadDocForCauseOfDeath', 'Verbal autopsy report']
      ]

      for (const [locator, sectionTitle] of imageUploadSections) {
        await uploadImageToSection({
          page,
          sectionLocator: page.locator('#' + locator),
          sectionTitle,
          buttonLocator: page.locator(`button[name="${locator}"]`)
        })
      }
    })
    test('4.1.6 Verify information on preview page', async () => {
      await goToSection(page, 'preview')
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
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Type'), [
        declaration.deceased.identifier.type
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
       * - Place of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [declaration.event.place, declaration.event.deathLocation]
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
          declaration.informant.address.village
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
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Type'), [
        declaration.spouse.identifier.type
      ])

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Usual'), [
        declaration.spouse.address.country,
        declaration.spouse.address.district,
        declaration.spouse.address.state,
        declaration.spouse.address.town,
        declaration.spouse.address.addressLine1,
        declaration.spouse.address.addressLine2,
        declaration.spouse.address.addressLine3,
        declaration.spouse.address.postcodeOrZip
      ])
    })

    test('4.1.7 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('4.1.8 Send for approval', async () => {
      await page.getByRole('button', { name: 'Send for approval' }).click()
      await expect(page.getByText('Send for approval?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expectOutboxToBeEmpty(page)

      await page.getByRole('button', { name: 'Sent for approval' }).click()

      /*
       * Expected result: The declaration should be in sent for approval
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('4.2 Declaration Review by Local Registrar', async () => {
    test('4.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Review', exact: true }).click()
    })

    test('4.2.2 Verify information on review page', async () => {
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
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#deceased-content #Type'), [
        declaration.deceased.identifier.type
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
       * - Place of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.place
      )
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [declaration.event.deathLocation]
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
          declaration.informant.address.village
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
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Type'), [
        declaration.spouse.identifier.type
      ])

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#spouse-content #Usual'), [
        declaration.spouse.address.country,
        declaration.spouse.address.district,
        declaration.spouse.address.state,
        declaration.spouse.address.town,
        declaration.spouse.address.addressLine1,
        declaration.spouse.address.addressLine2,
        declaration.spouse.address.addressLine3,
        declaration.spouse.address.postcodeOrZip
      ])
    })
  })
})
