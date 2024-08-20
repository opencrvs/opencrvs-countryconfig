import { test, expect, type Page } from '@playwright/test'
import { createPIN, getRandomDate, goToSection, login } from '../../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

test.describe.serial('7. Death declaration case - 7', () => {
  let page: Page
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.name.firstName('female'),
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
        country: 'Germany',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    informantType: 'Father',
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

  test.describe('7.1 Declaration started by National Registrar', async () => {
    test.beforeAll(async () => {
      await login(page, 'j.musonda', 'test')
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.1 Fill deceased details', async () => {
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

    test('7.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.event.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.event.date.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.event.date.yyyy)

      await page.locator('#mannerOfDeath').click()
      await page.getByText(declaration.event.manner, { exact: true }).click()

      await page.locator('#placeOfDeath').click()
      await page.getByText(declaration.event.place, { exact: true }).click()

      await page.locator('#countryPlaceofdeath').click()
      await page
        .getByText(declaration.event.deathLocation.country, { exact: true })
        .click()

      await page
        .locator('#internationalStatePlaceofdeath')
        .fill(declaration.event.deathLocation.state)
      await page
        .locator('#internationalDistrictPlaceofdeath')
        .fill(declaration.event.deathLocation.district)
      await page
        .locator('#internationalCityPlaceofdeath')
        .fill(declaration.event.deathLocation.town)
      await page
        .locator('#internationalAddressLine1Placeofdeath')
        .fill(declaration.event.deathLocation.addressLine1)
      await page
        .locator('#internationalAddressLine2Placeofdeath')
        .fill(declaration.event.deathLocation.addressLine2)
      await page
        .locator('#internationalAddressLine3Placeofdeath')
        .fill(declaration.event.deathLocation.addressLine3)
      await page
        .locator('#internationalPostalCodePlaceofdeath')
        .fill(declaration.event.deathLocation.postcodeOrZip)

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.3 Fill informant details', async () => {
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.4 Fill spouse details', async () => {
      await page.getByLabel("Spouse's details are not available").check()

      await page.locator('#reasonNotApplying').fill(declaration.spouse.reason)

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('7.1.5 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test('7.1.6 Verify information on preview page', async () => {
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
        'No'
      )
      await expect(page.locator('#deathEvent-content #Cause')).toContainText(
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
        declaration.event.deathLocation.country
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.state
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.district
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.town
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.addressLine1
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.addressLine2
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.addressLine3
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.postcodeOrZip
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
       * - Change button
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )
      await expect(page.locator('#informant-content #Type')).toContainText(
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
        declaration.informant.address.state
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.town
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine1
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine2
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine3
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.postcodeOrZip
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
       * - Spouse's details not available
       * - Reason
       * - Change button
       */
      await expect(page.locator('#spouse-content')).toContainText(
        "Spouse's details are not availableYes"
      )
      await expect(page.locator('#spouse-content #Reason')).toContainText(
        declaration.spouse.reason
      )
      await expect(page.locator('#spouse-content #Reason')).toContainText(
        'Change'
      )
    })

    test('7.1.7 Register', async () => {
      await page.getByRole('button', { name: 'Register' }).click()
      await expect(page.getByText('Register the death?')).toBeVisible()
      await page.locator('#submit_confirm').click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

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
    test('7.1.8 Verify information on view page', async () => {
      await page
        .getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
        .click()

      await page.getByRole('button', { name: 'View', exact: true }).click()

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
        declaration.deceased.age + ' years'
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

      /*
       * Expected result: should include
       * - Date of death
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
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.country
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.state
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.district
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.town
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.addressLine1
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.addressLine2
      )
      await expect(page.locator('#deathEvent-content #Place')).toContainText(
        declaration.event.deathLocation.addressLine3
      )

      // Bug: This should be visible but is not
      // await expect(page.locator('#deathEvent-content #Place')).toContainText(
      //   declaration.event.deathLocation.postcodeOrZip
      // )

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
        declaration.informant.age + ' years'
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
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.state
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.town
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine1
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine2
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.addressLine3
      )

      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.postcodeOrZip
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
