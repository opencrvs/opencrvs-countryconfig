import { test, expect, type Page } from '@playwright/test'
import { createPIN, getRandomDate, goToSection, login } from '../../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

test.describe.serial('1. Death declaration case - 1', () => {
  let page: Page
  const declaration = {
    deceased: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(75, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      maritalStatus: 'Single',
      dependants: 3,
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Zobwe',
        urbanOrRural: 'Urban',
        town: faker.address.city(),
        residentialArea: faker.address.county(),
        street: faker.address.streetName(),
        number: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    event: {
      manner: 'Natural causes',
      date: getRandomDate(0, 20),
      cause: {
        established: true,
        source: 'Physician'
      },
      place: "Deceased's usual place of residence"
    },
    informantType: 'Spouse',
    informantEmail: faker.internet.email(),
    spouse: {
      name: {
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      birthDate: getRandomDate(50, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: {
        sameAsDeceased: true
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, 'k.bwalya', 'test')
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.1 Fill deceased details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.deceased.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.deceased.name.familyName)
      await page.locator('#gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.deceased.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.deceased.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.deceased.birthDate.yyyy)

      await page.locator('#deceasedIdType').click()
      await page
        .getByText(declaration.deceased.identifier.type, { exact: true })
        .click()
      await page
        .locator('#deceasedNationalId')
        .fill(declaration.deceased.identifier.id)

      await page.locator('#maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page
        .locator('#numberOfDependants')
        .fill(declaration.deceased.dependants.toString())

      await page.locator('#statePrimaryDeceased').click()
      await page
        .getByText(declaration.deceased.address.province, { exact: true })
        .click()
      await page.locator('#districtPrimaryDeceased').click()
      await page
        .getByText(declaration.deceased.address.district, { exact: true })
        .click()

      await page
        .locator('#cityPrimaryDeceased')
        .fill(declaration.deceased.address.town)
      await page
        .locator('#addressLine1UrbanOptionPrimaryDeceased')
        .fill(declaration.deceased.address.residentialArea)
      await page
        .locator('#addressLine2UrbanOptionPrimaryDeceased')
        .fill(declaration.deceased.address.street)
      await page
        .locator('#addressLine3UrbanOptionPrimaryDeceased')
        .fill(declaration.deceased.address.number)
      await page
        .locator('#postalCodePrimaryDeceased')
        .fill(declaration.deceased.address.postcodeOrZip)

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.2 Fill event details', async () => {
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

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.3 Fill informant details', async () => {
      await page.waitForTimeout(500)
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.4 Fill spouse details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.spouse.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.spouse.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.spouse.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.spouse.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.spouse.birthDate.yyyy)

      await page.locator('#spouseIdType').click()
      await page
        .getByText(declaration.spouse.identifier.type, { exact: true })
        .click()

      await page
        .locator('#spouseNationalId')
        .fill(declaration.spouse.identifier.id)

      await page.waitForTimeout(500)
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.5 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test('1.1.6 Verify information on preview page', async () => {
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
       * - Deceased's date of death
       * - Change button
       */
      await expect(page.locator('#deceased-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.deceased.birthDate.yyyy),
            Number(declaration.deceased.birthDate.mm) - 1,
            Number(declaration.deceased.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )
      await expect(page.locator('#deceased-content #Date')).toContainText(
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
       * - Deceased's Id Number
       * - Change button
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        declaration.deceased.identifier.type
      )
      await expect(page.locator('#deceased-content #Type')).toContainText(
        'Change'
      )
      await expect(page.locator('#deceased-content #ID')).toContainText(
        declaration.deceased.identifier.id
      )
      await expect(page.locator('#deceased-content #ID')).toContainText(
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
       * - Number of Deceased's Dependants
       */
      await expect(page.locator('#deceased-content')).toContainText(
        'No. of dependants' + declaration.deceased.dependants.toString()
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
        declaration.deceased.address.province
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.town
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.residentialArea
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.street
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.number
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
       * - Spouse's date of death
       * - Change button
       */
      await expect(page.locator('#spouse-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.spouse.birthDate.yyyy),
            Number(declaration.spouse.birthDate.mm) - 1,
            Number(declaration.spouse.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )
      await expect(page.locator('#spouse-content #Date')).toContainText(
        'Change'
      )

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
       * - Spouse's Id Number
       * - Change button
       */
      await expect(page.locator('#spouse-content #Type')).toContainText(
        declaration.spouse.identifier.type
      )
      await expect(page.locator('#spouse-content #Type')).toContainText(
        'Change'
      )
      await expect(page.locator('#spouse-content #ID')).toContainText(
        declaration.spouse.identifier.id
      )
      await expect(page.locator('#spouse-content #ID')).toContainText('Change')

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Same')).toContainText('Yes')
    })

    test('1.1.7 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

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

  test.describe('1.2 Declaration Review by RA', async () => {
    test('1.2.1 Navigate to the declaration review page', async () => {
      await login(page, 'f.katongo', 'test')
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

    test('1.2.2 Verify information on review page', async () => {
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
       * - Deceased's date of death
       * - Change button
       */
      await expect(page.locator('#deceased-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.deceased.birthDate.yyyy),
            Number(declaration.deceased.birthDate.mm) - 1,
            Number(declaration.deceased.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )
      await expect(page.locator('#deceased-content #Date')).toContainText(
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
       * - Deceased's Id Number
       * - Change button
       */
      await expect(page.locator('#deceased-content #Type')).toContainText(
        declaration.deceased.identifier.type
      )
      await expect(page.locator('#deceased-content #Type')).toContainText(
        'Change'
      )
      await expect(page.locator('#deceased-content #ID')).toContainText(
        declaration.deceased.identifier.id
      )
      await expect(page.locator('#deceased-content #ID')).toContainText(
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
       * - Number of Deceased's Dependants
       * - Change button
       */
      await expect(page.locator('#deceased-content')).toContainText(
        'No. of dependants' + declaration.deceased.dependants.toString()
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
        declaration.deceased.address.province
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.town
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.residentialArea
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.street
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.number
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
       * - Spouse's date of death
       * - Change button
       */
      await expect(page.locator('#spouse-content #Date')).toContainText(
        format(
          new Date(
            Number(declaration.spouse.birthDate.yyyy),
            Number(declaration.spouse.birthDate.mm) - 1,
            Number(declaration.spouse.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )
      await expect(page.locator('#spouse-content #Date')).toContainText(
        'Change'
      )

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
       * - Spouse's Id Number
       * - Change button
       */
      await expect(page.locator('#spouse-content #Type')).toContainText(
        declaration.spouse.identifier.type
      )
      await expect(page.locator('#spouse-content #Type')).toContainText(
        'Change'
      )
      await expect(page.locator('#spouse-content #ID')).toContainText(
        declaration.spouse.identifier.id
      )
      await expect(page.locator('#spouse-content #ID')).toContainText('Change')

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expect(page.locator('#spouse-content #Same')).toContainText('Yes')
    })
  })
})
