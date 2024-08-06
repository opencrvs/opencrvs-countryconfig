import { test, expect, type Page } from '@playwright/test'
import {
  createPIN,
  getRandomDate,
  goToSection,
  login,
  uploadImage
} from '../../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

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

  test.describe('3.1 Declaratin started by RA', async () => {
    test.beforeAll(async () => {
      await login(page, 'f.katongo', 'test')
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

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('3.1.2 Fill informant details', async () => {
      await page.waitForTimeout(500)
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

      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Continue' }).click()
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

      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Continue' }).click()
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

    test('3.1.5 Add documents', async () => {
      goToSection(page, 'documents')
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForChildDOB"]')
      )
      await page.locator('#uploadDocForMother').getByText('Select...').click()
      await page.getByText('National ID', { exact: true }).click()
      await uploadImage(page, page.locator('button[name="uploadDocForMother"]'))
      await page.locator('#uploadDocForFather').getByText('Select...').click()
      await page.getByText('Passport', { exact: true }).click()
      await uploadImage(page, page.locator('button[name="uploadDocForFather"]'))
      await page
        .locator('#uploadDocForInformant')
        .getByText('Select...')
        .click()
      await page.getByText('Birth certificate', { exact: true }).click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForInformant"]')
      )
      await page
        .locator('#uploadDocForProofOfLegalGuardian')
        .getByText('Select...')
        .click()
      await page
        .getByText('Proof of legal guardianship', { exact: true })
        .click()
      await uploadImage(
        page,
        page.locator('button[name="uploadDocForProofOfLegalGuardian"]')
      )
    })

    test('3.1.6 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test('3.1.7 Verify informations in preview page', async () => {
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
        format(
          new Date(
            Number(declaration.child.birthDate.yyyy),
            Number(declaration.child.birthDate.mm) - 1,
            Number(declaration.child.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.placeOfBirth
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.country
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.province
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.district
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.village
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
        format(
          new Date(
            Number(declaration.informant.birthDate.yyyy),
            Number(declaration.informant.birthDate.mm) - 1,
            Number(declaration.informant.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
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
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.province
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.town
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.residentialArea
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.street
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.number
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.postcodeOrZip
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
        format(
          new Date(
            Number(declaration.mother.birthDate.yyyy),
            Number(declaration.mother.birthDate.mm) - 1,
            Number(declaration.mother.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
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
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.country
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.district
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.state
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.town
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.addressLine1
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.addressLine2
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.addressLine3
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.postcodeOrZip
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
        format(
          new Date(
            Number(declaration.father.birthDate.yyyy),
            Number(declaration.father.birthDate.mm) - 1,
            Number(declaration.father.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
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

      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.country
      )
      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.district
      )
      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.province
      )
      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.village
      )
    })

    test('3.1.8 Send for approval', async () => {
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
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('3.2 Declaration Review by Local Registrar', async () => {
    test('3.2.1 Navigate to the declaration review page', async () => {
      await login(page, 'k.mweene', 'test')
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

    test('3.2.2 Verify informations in review page', async () => {
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
        format(
          new Date(
            Number(declaration.child.birthDate.yyyy),
            Number(declaration.child.birthDate.mm) - 1,
            Number(declaration.child.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.placeOfBirth
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.country
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.province
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.district
      )
      await expect(page.locator('#child-content #Place')).toContainText(
        declaration.birthLocation.village
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
        format(
          new Date(
            Number(declaration.informant.birthDate.yyyy),
            Number(declaration.informant.birthDate.mm) - 1,
            Number(declaration.informant.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
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
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.country
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.district
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.province
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.town
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.residentialArea
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.street
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.number
      )
      await expect(page.locator('#informant-content #Usual')).toContainText(
        declaration.informant.address.postcodeOrZip
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
        format(
          new Date(
            Number(declaration.mother.birthDate.yyyy),
            Number(declaration.mother.birthDate.mm) - 1,
            Number(declaration.mother.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
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
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.country
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.district
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.state
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.town
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.addressLine1
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.addressLine2
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.addressLine3
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.postcodeOrZip
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
        format(
          new Date(
            Number(declaration.father.birthDate.yyyy),
            Number(declaration.father.birthDate.mm) - 1,
            Number(declaration.father.birthDate.dd)
          ),
          'dd MMMM yyyy'
        )
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

      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.country
      )
      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.district
      )
      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.province
      )
      await expect(page.locator('#father-content #Usual')).toContainText(
        declaration.father.address.village
      )
    })
  })
})
