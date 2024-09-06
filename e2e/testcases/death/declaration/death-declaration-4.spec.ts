import { test, expect, type Page } from '@playwright/test'
import {
  createPIN,
  drawSignature,
  getRandomDate,
  goToSection,
  login,
  uploadImage
} from '../../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

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
      await login(page, 'f.katongo', 'test')
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('4.1.3 Fill informant details', async () => {
      await page.waitForTimeout(500)
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('4.1.5 Upload supporting document', async () => {
      goToSection(page, 'documents')

      await page.locator('#uploadDocForDeceased').getByText('Select...').click()
      await page.getByText('Birth certificate', { exact: true }).click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForDeceased"]')
      )

      await page
        .locator('#uploadDocForInformant')
        .getByText('Select...')
        .click()
      await page.getByText('Other', { exact: true }).click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForInformant"]')
      )

      await page
        .locator('#uploadDocForDeceasedDeath')
        .getByText('Select...')
        .click()
      await page
        .getByText('Police certificate of death', { exact: true })
        .click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForDeceasedDeath"]')
      )

      await page
        .locator('#uploadDocForCauseOfDeath')
        .getByText('Select...')
        .click()
      await page.getByText('Verbal autopsy report', { exact: true }).click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForCauseOfDeath"]')
      )
    })
    test('4.1.6 Verify information on preview page', async () => {
      goToSection(page, 'preview')
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.firstNames
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.familyName
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        declaration.deceased.gender
      )
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expect(page.locator('#deceased-content #Age')).toContainText(
        declaration.deceased.age + ' years'
      )
      await expect(page.locator('#deceased-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText(declaration.deceased.nationality)
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText('Change')

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Change button
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        declaration.deceased.identifier.type
      )
      await expect(page.locator('#deceased-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expect(page.locator('#deceased-content #Marital')).toContainText(
        declaration.deceased.maritalStatus
      )
      await expect(page.locator('#deceased-content #Marital')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.country
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.district
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.state
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.town
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.addressLine1
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.addressLine2
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.addressLine3
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.postcodeOrZip
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.event.date.yyyy),
            Number(declaration.event.date.mm) - 1,
            Number(declaration.event.date.dd)
          ),
          'dd MMMM yyyy'
        )
      )
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Manner')).toContainText(
        declaration.event.manner
      )
      await expect(page.locator('#deathEvent-content #Manner')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'Yes'
      )
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Source')).toContainText(
        declaration.event.cause.source
      )
      await expect(page.locator('#deathEvent-content #Source')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.place
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expect(page.locator('#informant-content #Informant')).toContainText(
        declaration.informantType
      )
      await expect(page.locator('#informant-content #Informant')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.firstNames
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.familyName
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        declaration.informant.age + ' years'
      )
      await expect(page.locator('#informant-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText(declaration.informant.nationality)
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText('Change')

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )
      await expect(page.locator('#informant-content #Type')).toContainText(
        'Change'
      )
      await expect(page.locator('#informant-content #ID')).toContainText(
        declaration.informant.identifier.id
      )
      await expect(page.locator('#informant-content #ID')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.province
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.village
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        declaration.informantEmail
      )
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expect(page.locator('#spouse-content #Full')).toContainText(
        declaration.spouse.name.firstNames
      )
      await expect(page.locator('#spouse-content #Full')).toContainText(
        declaration.spouse.name.familyName
      )
      await expect(page.locator('#spouse-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expect(page.locator('#spouse-content #Age')).toContainText(
        declaration.spouse.age + ' years'
      )
      await expect(page.locator('#spouse-content #Age')).toContainText('Change')

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        declaration.spouse.nationality
      )
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Change button
       */
      await expect(page.locator('#spouse-content #Type')).toContainText(
        declaration.spouse.identifier.type
      )
      await expect(page.locator('#spouse-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.country
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.district
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.state
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.town
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.addressLine1
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.addressLine2
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.addressLine3
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.postcodeOrZip
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        'Change'
      )
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

      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

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
      await login(page, 'k.mweene', 'test')
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
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.firstNames
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.familyName
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        declaration.deceased.gender
      )
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expect(page.locator('#deceased-content #Age')).toContainText(
        declaration.deceased.age + ' years'
      )
      await expect(page.locator('#deceased-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText(declaration.deceased.nationality)
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText('Change')

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Change button
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        declaration.deceased.identifier.type
      )
      await expect(page.locator('#deceased-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expect(page.locator('#deceased-content #Marital')).toContainText(
        declaration.deceased.maritalStatus
      )
      await expect(page.locator('#deceased-content #Marital')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.country
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.district
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.state
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.town
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.addressLine1
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.addressLine2
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.addressLine3
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.postcodeOrZip
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.event.date.yyyy),
            Number(declaration.event.date.mm) - 1,
            Number(declaration.event.date.dd)
          ),
          'dd MMMM yyyy'
        )
      )
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Manner')).toContainText(
        declaration.event.manner
      )
      await expect(page.locator('#deathEvent-content #Manner')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'Yes'
      )
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Source')).toContainText(
        declaration.event.cause.source
      )
      await expect(page.locator('#deathEvent-content #Source')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.place
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expect(page.locator('#informant-content #Informant')).toContainText(
        declaration.informantType
      )
      await expect(page.locator('#informant-content #Informant')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.firstNames
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.familyName
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's age
       * - Change button
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        declaration.informant.age + ' years'
      )
      await expect(page.locator('#informant-content #Age')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText(declaration.informant.nationality)
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText('Change')

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )
      await expect(page.locator('#informant-content #Type')).toContainText(
        'Change'
      )
      await expect(page.locator('#informant-content #ID')).toContainText(
        declaration.informant.identifier.id
      )
      await expect(page.locator('#informant-content #ID')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */

      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.province
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.village
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        declaration.informantEmail
      )
      await expect(page.locator('#informant-content #Email')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expect(page.locator('#spouse-content #Full')).toContainText(
        declaration.spouse.name.firstNames
      )
      await expect(page.locator('#spouse-content #Full')).toContainText(
        declaration.spouse.name.familyName
      )
      await expect(page.locator('#spouse-content #Full')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expect(page.locator('#spouse-content #Age')).toContainText(
        declaration.spouse.age + ' years'
      )
      await expect(page.locator('#spouse-content #Age')).toContainText('Change')

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        declaration.spouse.nationality
      )
      await expect(page.locator('#spouse-content #Nationality')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Change button
       */
      await expect(page.locator('#spouse-content #Type')).toContainText(
        declaration.spouse.identifier.type
      )
      await expect(page.locator('#spouse-content #Type')).toContainText(
        'Change'
      )

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.country
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.district
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.state
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.town
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.addressLine1
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.addressLine2
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.addressLine3
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        declaration.spouse.address.postcodeOrZip
      )
      await expect(page.locator('#spouse-content #Usual')).toContainText(
        'Change'
      )
    })
  })
})
