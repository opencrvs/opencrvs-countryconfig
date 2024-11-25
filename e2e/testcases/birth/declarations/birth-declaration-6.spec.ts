import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  createPIN,
  drawSignature,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateObjectTo_ddMMMMyyyy,
  getRandomDate,
  goToSection,
  joinValuesWith,
  login
} from '../../../helpers'
import faker from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('6. Birth declaration case - 6', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.name.firstName() + " O'Neil",
        familyName: faker.name.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Traditional birth attendant',
    birthType: 'Higher multiple delivery',
    placeOfBirth: 'Other',
    birthLocation: {
      country: 'Greenland',
      state: faker.address.state(),
      district: faker.address.county(),
      town: faker.address.city(),
      addressLine1: faker.address.county(),
      addressLine2: faker.address.streetName(),
      addressLine3: faker.address.buildingNumber(),
      postcodeOrZip: faker.address.zipCode()
    },
    informantType: 'Sister',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      age: 17,
      nationality: 'Guernsey',
      identifier: {
        type: 'None'
      },
      address: {
        country: 'Haiti',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    father: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      age: 25,
      nationality: 'Farajaland',
      identifier: {
        type: 'None'
      },
      address: {
        country: 'Guam',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      },
      maritalStatus: 'Separated',
      levelOfEducation: 'Tertiary'
    },
    mother: {
      detailsDontExist: true,
      reason: 'Mother is a ghost'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('6.1 Declaration started by National Registrar', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.NATIONAL_REGISTRAR.USERNAME,
        CREDENTIALS.NATIONAL_REGISTRAR.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('6.1.1 Fill child details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.child.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.child.name.familyName)
      await page.locator('#gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()

      await page.locator('#countryPlaceofbirth').click()
      await page
        .getByText(declaration.birthLocation.country, {
          exact: true
        })
        .click()

      await page
        .locator('#internationalStatePlaceofbirth')
        .fill(declaration.birthLocation.state)
      await page
        .locator('#internationalDistrictPlaceofbirth')
        .fill(declaration.birthLocation.district)
      await page
        .locator('#internationalCityPlaceofbirth')
        .fill(declaration.birthLocation.town)
      await page
        .locator('#internationalAddressLine1Placeofbirth')
        .fill(declaration.birthLocation.addressLine1)
      await page
        .locator('#internationalAddressLine2Placeofbirth')
        .fill(declaration.birthLocation.addressLine2)
      await page
        .locator('#internationalAddressLine3Placeofbirth')
        .fill(declaration.birthLocation.addressLine3)
      await page
        .locator('#internationalPostalCodePlaceofbirth')
        .fill(declaration.birthLocation.postcodeOrZip)

      await page.locator('#attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.locator('#birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test('6.1.2 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      /*
       * Expected result: should show additional fields:
       * - Full Name
       * - Date of birth
       * - Nationality
       * - Id
       * - Usual place of residence
       */
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

    test("6.1.3 Fill mother's details", async () => {
      await page.getByLabel("Mother's details are not available").check()
      await page.locator('#reasonNotApplying').fill(declaration.mother.reason)

      await continueForm(page)
    })

    test("6.1.4 Fill father's details", async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.father.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.father.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#ageOfIndividualInYears')
        .fill(declaration.father.age.toString())

      await page.locator('#fatherIdType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page.locator('#countryPrimaryFather').click()
      await page
        .getByText(declaration.father.address.country, { exact: true })
        .click()
      await page
        .locator('#internationalStatePrimaryFather')
        .fill(declaration.father.address.state)
      await page
        .locator('#internationalDistrictPrimaryFather')
        .fill(declaration.father.address.district)
      await page
        .locator('#internationalCityPrimaryFather')
        .fill(declaration.father.address.town)
      await page
        .locator('#internationalAddressLine1PrimaryFather')
        .fill(declaration.father.address.addressLine1)
      await page
        .locator('#internationalAddressLine2PrimaryFather')
        .fill(declaration.father.address.addressLine2)
      await page
        .locator('#internationalAddressLine3PrimaryFather')
        .fill(declaration.father.address.addressLine3)
      await page
        .locator('#internationalPostalCodePrimaryFather')
        .fill(declaration.father.address.postcodeOrZip)

      await page.locator('#maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.locator('#educationalAttainment').click()
      await page
        .getByText(declaration.father.levelOfEducation, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('6.1.5 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('6.1.6 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.firstNames
      )
      await expect(page.locator('#child-content #Full')).toContainText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.locator('#child-content #Sex')).toContainText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.locator('#child-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expectAddress(
        page.locator('#child-content #Place'),
        declaration.birthLocation
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(page.locator('#child-content #Attendant')).toContainText(
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.locator('#child-content #Type')).toContainText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expect(
        page.locator('#informant-content #Relationship')
      ).toContainText(declaration.informantType)

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.locator('#informant-content #Email')).toContainText(
        declaration.informantEmail
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
       * - Informant's date of birth
       */
      await expect(page.locator('#informant-content #Age')).toContainText(
        joinValuesWith([declaration.informant.age, 'years'])
      )

      /*
       * Expected result: should include
       * - Informant's Nationality
       */
      await expect(
        page.locator('#informant-content #Nationality')
      ).toContainText(declaration.informant.nationality)

      /*
       * Expected result: should include
       * - Informant's address
       */
      await expectAddress(
        page.locator('#informant-content #Usual'),
        declaration.informant.address
      )

      /*
       * Expected result: should include
       * - Informant's Type of Id
       * - Informant's Id
       */
      await expect(page.locator('#informant-content #Type')).toContainText(
        declaration.informant.identifier.type
      )

      /*
       * Expected result: should include
       * - Mother's Details not available: true
       * - Reason of why mother's details not available
       */
      await expect(page.locator('#mother-content')).toContainText(
        "Mother's details are not availableYes"
      )
      await expect(page.locator('#mother-content #Reason')).toContainText(
        declaration.mother.reason
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.locator('#father-content #Full')).toContainText(
        declaration.father.name.firstNames
      )
      await expect(page.locator('#father-content #Full')).toContainText(
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.locator('#father-content #Age')).toContainText(
        joinValuesWith([declaration.father.age, 'years'])
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.locator('#father-content #Nationality')).toContainText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(page.locator('#father-content #Marital')).toContainText(
        declaration.father.maritalStatus
      )

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(page.locator('#father-content #Level')).toContainText(
        declaration.father.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       */
      await expect(page.locator('#father-content #Type')).toContainText(
        declaration.father.identifier.type
      )

      /*
       * Expected result: should include
       * - Father's address
       */
      await expectAddress(
        page.locator('#father-content #Usual'),
        declaration.father.address
      )
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
      await expect(page.getByText('Register the birth?')).toBeVisible()
      await page.locator('#submit_confirm').click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      await expectOutboxToBeEmpty(page)

      await page.getByRole('button', { name: 'Ready to print' }).click()

      /*
       * Expected result: The declaration should be in Ready to print
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })
})
