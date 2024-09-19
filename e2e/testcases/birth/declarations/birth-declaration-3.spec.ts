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
  login,
  uploadImage,
  uploadImageToSection
} from '../../../helpers'
import faker from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('3. Birth declaration case - 3', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.name.firstName() + '_Peter',
        familyName: faker.name.lastName()
      },
      gender: 'Unknown',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Midwife',
    birthType: 'Triplet',
    placeOfBirth: 'Residential address',
    birthLocation: {
      country: 'Farajaland',
      province: 'Pualula',
      district: 'Funabuli',
      urbanOrRural: 'Rural',
      village: faker.address.county()
    },
    informantType: 'Grandfather',
    informantEmail: faker.internet.email(),
    informant: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      birthDate: getRandomDate(40, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Ama',
        urbanOrRural: 'Urban',
        town: faker.address.city(),
        residentialArea: faker.address.county(),
        street: faker.address.streetName(),
        number: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      }
    },
    mother: {
      name: {
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(9),
        type: 'Birth Registration Number'
      },
      address: {
        country: 'Djibouti',
        state: faker.address.state(),
        district: faker.address.county(),
        town: faker.address.city(),
        addressLine1: faker.address.county(),
        addressLine2: faker.address.streetName(),
        addressLine3: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      },
      maritalStatus: 'Widowed',
      levelOfEducation: 'Secondary'
    },
    father: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.random.numeric(11),
        type: 'Birth Registration Number'
      },
      maritalStatus: 'Widowed',
      levelOfEducation: 'Secondary',
      address: {
        sameAsMother: false,
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Rural',
        village: faker.address.county()
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('3.1 Declaration started by RA', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('3.1.1 Fill child details', async () => {
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
      await page.locator('#statePlaceofbirth').click()
      await page
        .getByText(declaration.birthLocation.province, {
          exact: true
        })
        .click()

      await page.locator('#districtPlaceofbirth').click()
      await page
        .getByText(declaration.birthLocation.district, {
          exact: true
        })
        .click()
      await page.getByLabel(declaration.birthLocation.urbanOrRural).check()
      await page
        .locator('#addressLine1RuralOptionPlaceofbirth')
        .fill(declaration.birthLocation.village)

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

    test('3.1.2 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

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

      await page.getByPlaceholder('dd').fill(declaration.informant.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.informant.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.informant.birthDate.yyyy)

      await page.locator('#informantIdType').click()
      await page
        .getByText(declaration.informant.identifier.type, { exact: true })
        .click()

      await page
        .locator('#informantNationalId')
        .fill(declaration.informant.identifier.id)

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

    test("3.1.3 Fill mother's details", async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.mother.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#motherIdType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#motherBirthRegistrationNumber')
        .fill(declaration.mother.identifier.id)

      await page.locator('#countryPrimaryMother').click()
      await page
        .getByText(declaration.mother.address.country, { exact: true })
        .click()
      await page
        .locator('#internationalStatePrimaryMother')
        .fill(declaration.mother.address.state)
      await page
        .locator('#internationalDistrictPrimaryMother')
        .fill(declaration.mother.address.district)
      await page
        .locator('#internationalCityPrimaryMother')
        .fill(declaration.mother.address.town)
      await page
        .locator('#internationalAddressLine1PrimaryMother')
        .fill(declaration.mother.address.addressLine1)
      await page
        .locator('#internationalAddressLine2PrimaryMother')
        .fill(declaration.mother.address.addressLine2)
      await page
        .locator('#internationalAddressLine3PrimaryMother')
        .fill(declaration.mother.address.addressLine3)
      await page
        .locator('#internationalPostalCodePrimaryMother')
        .fill(declaration.mother.address.postcodeOrZip)

      await page.locator('#maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await page.locator('#educationalAttainment').click()
      await page
        .getByText(declaration.mother.levelOfEducation, { exact: true })
        .click()
      await continueForm(page)
    })

    test("3.1.4 Fill father's details", async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.father.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.father.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.father.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.father.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.father.birthDate.yyyy)

      await page.locator('#fatherIdType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#fatherBirthRegistrationNumber')
        .fill(declaration.father.identifier.id)

      await page.locator('#nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.getByLabel('No', { exact: true }).check()
      await page.locator('#statePrimaryFather').click()
      await page
        .getByText(declaration.father.address.province, { exact: true })
        .click()
      await page.locator('#districtPrimaryFather').click()
      await page
        .getByText(declaration.father.address.district, { exact: true })
        .click()
      await page.getByLabel(declaration.father.address.urbanOrRural).check()
      await page
        .locator('#addressLine1RuralOptionPrimaryFather')
        .fill(declaration.father.address.village)

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

    test.describe('3.1.5 Add supporting documents', async () => {
      test('3.1.5.0 Go to supporting documents page', async () => {
        await goToSection(page, 'documents')
      })

      test('3.1.5.1 Upload proof of birth', async () => {
        await uploadImage(
          page,
          page.locator('button[name="uploadDocForChildDOB"]')
        )
      })

      test("3.1.5.2 Upload proof of mother's id", async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#uploadDocForMother'),
            sectionTitle,
            buttonLocator: page.locator('button[name="uploadDocForMother"]')
          })
        }
      })

      test("3.1.5.3 Upload proof of father's id", async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#uploadDocForFather'),
            sectionTitle,
            buttonLocator: page.locator('button[name="uploadDocForFather"]')
          })
        }
      })

      test("3.1.5.4 Upload proof of informant's id", async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#uploadDocForInformant'),
            sectionTitle,
            buttonLocator: page.locator('button[name="uploadDocForInformant"]')
          })
        }
      })

      test('3.1.5.5 Upload other', async () => {
        const imageUploadSectionTitles = [
          'Proof of legal guardianship',
          'Proof of assigned responsibility'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#uploadDocForProofOfLegalGuardian'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="uploadDocForProofOfLegalGuardian"]'
            )
          })
        }
      })
    })

    test('3.1.6 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('3.1.7 Verify information on preview page', async () => {
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
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.placeOfBirth
      )
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
      await expect(page.locator('#informant-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.informant.birthDate)
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
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.locator('#mother-content #Full')).toContainText(
        declaration.mother.name.firstNames
      )
      await expect(page.locator('#mother-content #Full')).toContainText(
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.locator('#mother-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.locator('#mother-content #Nationality')).toContainText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(page.locator('#mother-content #Marital')).toContainText(
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(page.locator('#mother-content #Level')).toContainText(
        declaration.mother.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.locator('#mother-content #Type')).toContainText(
        declaration.mother.identifier.type
      )

      await expect(page.locator('#mother-content #ID')).toContainText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */

      await expectAddress(
        page.locator('#mother-content #Usual'),
        declaration.mother.address
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
      await expect(page.locator('#father-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.father.birthDate)
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
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.locator('#father-content #Type')).toContainText(
        declaration.father.identifier.type
      )

      await expect(page.locator('#father-content #ID')).toContainText(
        declaration.father.identifier.id
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
       * - Father's address
       */
      await expectAddress(
        page.locator('#father-content #Usual'),
        declaration.father.address
      )
    })

    test('3.1.8 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('3.1.9 Send for approval', async () => {
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
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('3.2 Declaration Review by Local Registrar', async () => {
    test('3.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Review', exact: true }).click()
    })

    test('3.2.2 Verify information on review page', async () => {
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
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.placeOfBirth
      )
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
      await expect(page.locator('#informant-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.informant.birthDate)
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
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.locator('#mother-content #Full')).toContainText(
        declaration.mother.name.firstNames
      )
      await expect(page.locator('#mother-content #Full')).toContainText(
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.locator('#mother-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.locator('#mother-content #Nationality')).toContainText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(page.locator('#mother-content #Marital')).toContainText(
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(page.locator('#mother-content #Level')).toContainText(
        declaration.mother.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.locator('#mother-content #Type')).toContainText(
        declaration.mother.identifier.type
      )

      await expect(page.locator('#mother-content #ID')).toContainText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await expectAddress(
        page.locator('#mother-content #Usual'),
        declaration.mother.address
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
      await expect(page.locator('#father-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.father.birthDate)
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
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.locator('#father-content #Type')).toContainText(
        declaration.father.identifier.type
      )

      await expect(page.locator('#father-content #ID')).toContainText(
        declaration.father.identifier.id
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
       * - Father's address
       */ await expectAddress(
        page.locator('#father-content #Usual'),
        declaration.father.address
      )
    })
  })
})
