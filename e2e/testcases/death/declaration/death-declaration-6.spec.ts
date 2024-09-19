import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  createPIN,
  drawSignature,
  expectAddress,
  expectOutboxToBeEmpty,
  expectTextWithChangeLink,
  formatDateObjectTo_ddMMMMyyyy,
  getRandomDate,
  goToSection,
  joinValuesWith,
  login
} from '../../../helpers'
import faker from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('6. Death declaration case - 6', () => {
  let page: Page
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.name.firstName('female') + " O'Nila",
        familyName: faker.name.lastName('female')
      },
      gender: 'Female',
      age: 45,
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      maritalStatus: 'Not stated',
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
      manner: 'Manner undetermined',
      date: getRandomDate(0, 20),
      cause: {
        established: false
      },
      place: 'Other',
      deathLocation: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Rural',
        village: faker.address.county()
      }
    },
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      age: 17,
      nationality: 'Malawi',
      identifier: {
        type: 'None'
      },
      address: {
        sameAsDeceased: false,
        country: 'Comoros',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    spouse: {
      detailsAvailable: false,
      reason: 'Spouse ran away'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('6.1 Declaration started by Local Registrar', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('6.1.1 Fill deceased details', async () => {
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

    test('6.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.event.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.event.date.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.event.date.yyyy)

      await page.locator('#mannerOfDeath').click()
      await page.getByText(declaration.event.manner, { exact: true }).click()

      await page.locator('#placeOfDeath').click()
      await page.getByText(declaration.event.place, { exact: true }).click()

      await page.locator('#statePlaceofdeath').click()
      await page
        .getByText(declaration.event.deathLocation.province, { exact: true })
        .click()
      await page.locator('#districtPlaceofdeath').click()
      await page
        .getByText(declaration.event.deathLocation.district, { exact: true })
        .click()

      await page.getByLabel('Rural').check()

      await page
        .locator('#addressLine1RuralOptionPlaceofdeath')
        .fill(declaration.event.deathLocation.village)

      await continueForm(page)
    })

    test('6.1.3 Fill informant details', async () => {
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

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#countryPrimaryInformant').click()
      await page
        .getByText(declaration.informant.address.country, { exact: true })
        .click()

      await page
        .locator('#internationalStatePrimaryInformant')
        .fill(declaration.informant.address.state)
      await page
        .locator('#internationalDistrictPrimaryInformant')
        .fill(declaration.informant.address.district)
      await page
        .locator('#internationalCityPrimaryInformant')
        .fill(declaration.informant.address.town)
      await page
        .locator('#internationalAddressLine1PrimaryInformant')
        .fill(declaration.informant.address.addressLine1)
      await page
        .locator('#internationalAddressLine2PrimaryInformant')
        .fill(declaration.informant.address.addressLine2)
      await page
        .locator('#internationalAddressLine3PrimaryInformant')
        .fill(declaration.informant.address.addressLine3)
      await page
        .locator('#internationalPostalCodePrimaryInformant')
        .fill(declaration.informant.address.postcodeOrZip)

      await continueForm(page)
    })

    test('6.1.4 Fill spouse details', async () => {
      await page.getByLabel("Spouse's details are not available").check()

      await page.locator('#reasonNotApplying').fill(declaration.spouse.reason)

      await continueForm(page)
    })

    test('6.1.5 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('6.1.6 Verify information on preview page', async () => {
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
        ['No']
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#deathEvent-content #Place'),
        [
          declaration.event.place,
          declaration.event.deathLocation.country,
          declaration.event.deathLocation.province,
          declaration.event.deathLocation.district,
          declaration.event.deathLocation.village
        ]
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
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#informant-content #Type'), [
        declaration.informant.identifier.type
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
          declaration.informant.address.state,
          declaration.informant.address.district,
          declaration.informant.address.town,
          declaration.informant.address.addressLine1,
          declaration.informant.address.addressLine2,
          declaration.informant.address.addressLine3,
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
       * - Spouse's details not available
       * - Reason
       * - Change button
       */
      await expect(page.locator('#spouse-content')).toContainText(
        "Spouse's details are not availableYes"
      )
      await expectTextWithChangeLink(page.locator('#spouse-content #Reason'), [
        declaration.spouse.reason
      ])
    })

    test('6.1.7 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('6.1.8 Register', async () => {
      await page.getByRole('button', { name: 'Register' }).click()
      await expect(page.getByText('Register the death?')).toBeVisible()
      await page.locator('#submit_confirm').click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expectOutboxToBeEmpty(page)

      await page.getByRole('button', { name: 'Ready to print' }).click()

      /*
       * Expected result: The declaration should be in Ready to print
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('6.2 Declaration Review by Registration Agent', async () => {
    test('6.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'Ready to print' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'View', exact: true }).click()
    })

    test('6.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       */
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.firstNames
      )
      await expect(page.locator('#deceased-content #Full')).toContainText(
        declaration.deceased.name.familyName
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       */
      await expect(page.locator('#deceased-content #Sex')).toContainText(
        declaration.deceased.gender
      )

      /*
       * Expected result: should include
       * - Deceased's age
       */
      await expect(page.locator('#deceased-content #Age')).toContainText(
        joinValuesWith([declaration.deceased.age, 'years'])
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       */
      await expect(
        page.locator('#deceased-content #Nationality')
      ).toContainText(declaration.deceased.nationality)

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        declaration.deceased.identifier.type
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       */
      await expect(page.locator('#deceased-content #Marital')).toContainText(
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       */
      await expectAddress(
        page.locator('#deceased-content #Usual'),
        declaration.deceased.address
      )
      /*
       * Expected result: should include
       * - Date of death
       */
      await expect(page.locator('#deathEvent-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.event.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       */
      await expect(page.locator('#deathEvent-content #Manner')).toContainText(
        declaration.event.manner
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       */
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
        'No'
      )

      /*
       * Expected result: should include
       * - Place of death
       */
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.place
      )
      await expectAddress(
        page.locator('#deathEvent-content #Place'),
        declaration.event.deathLocation
      )

      /*
       * Expected result: should include
       * - Informant type
       */
      await expect(page.locator('#informant-content #Informant')).toContainText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       */
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.firstNames
      )
      await expect(page.locator('#informant-content #Full')).toContainText(
        declaration.informant.name.familyName
      )

      /*
       * Expected result: should include
       * - informant's age
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        joinValuesWith([declaration.informant.age, 'years'])
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       */
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - informant's Type of Id
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )

      /*
       * Expected result: should include
       * - informant's address
       */
      await expectAddress(
        page.locator('#informant-content #Usual'),
        declaration.informant.address
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Spouse's details not available
       * - Reason
       */
      await expect(page.locator('#spouse-content')).toContainText(
        "Spouse's details are not availableYes"
      )
      await expect(page.locator('#spouse-content #Reason')).toContainText(
        declaration.spouse.reason
      )
    })
  })
})
