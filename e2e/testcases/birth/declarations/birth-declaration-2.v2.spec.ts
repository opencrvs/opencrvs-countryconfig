import { test, expect, type Page } from '@playwright/test'
import {
  assignRecord,
  continueForm,
  createPIN,
  drawSignature,
  expectAddress,
  expectOutboxToBeEmpty,
  expectValueInTestId,
  expectValuesInTestId,
  formatDateObjectTo_ddMMMMyyyy,
  getAction,
  getRandomDate,
  goToSection,
  joinValuesWith,
  loginToV2
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('2. Birth declaration case - 2 - V2', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      gender: 'Female',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Nurse',
    birthType: 'Twin',
    placeOfBirth: 'Residential address',
    birthLocation: {
      country: 'Farajaland',
      province: 'Pualula',
      district: 'Funabuli',
      urbanOrRural: 'Urban',
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      postcodeOrZip: faker.location.zipCode()
    },
    informantType: 'Father',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      age: 21,
      nationality: 'Fiji',
      identifier: {
        id: faker.string.numeric(12),
        type: 'Passport'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        urbanOrRural: 'Rural',
        village: faker.location.county()
      },
      maritalStatus: 'Married',
      levelOfEducation: 'Primary'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      age: 25,
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(8),
        type: 'Passport'
      },
      maritalStatus: 'Married',
      levelOfEducation: 'Primary',
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Zobwe',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('2.1 Declaration started by FA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('2.1.1 Fill child details', async () => {
      await page
        .locator('#child____firstname')
        .fill(declaration.child.name.firstNames)
      await page
        .locator('#child____surname')
        .fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()

      await page
        .locator('#child____address-form-input #country-form-input input')
        .fill(declaration.birthLocation.country.slice(0, 3))
      await page
        .locator('#child____address-form-input #country-form-input')
        .getByText(declaration.birthLocation.country, { exact: true })
        .click()

      await page.locator('#child____address-form-input #province').click()
      await page
        .getByText(declaration.birthLocation.province, {
          exact: true
        })
        .click()

      await page.locator('#child____address-form-input #district').click()
      await page
        .getByText(declaration.birthLocation.district, {
          exact: true
        })
        .click()

      await page.locator('#town').fill(declaration.birthLocation.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.birthLocation.residentialArea)
      await page.locator('#street').fill(declaration.birthLocation.street)
      await page.locator('#number').fill(declaration.birthLocation.number)
      await page
        .locator('#zipCode')
        .fill(declaration.birthLocation.postcodeOrZip)

      await page.locator('#child____attendantAtBirth').click()
      await page
        .getByText(declaration.attendantAtBirth, {
          exact: true
        })
        .click()

      await page.locator('#child____birthType').click()
      await page
        .getByText(declaration.birthType, {
          exact: true
        })
        .click()

      await continueForm(page)
    })

    test('2.1.2 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test("2.1.3 Fill mother's details", async () => {
      await page
        .locator('#mother____firstname')
        .fill(declaration.mother.name.firstNames)
      await page
        .locator('#mother____surname')
        .fill(declaration.mother.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#mother____age')
        .fill(declaration.mother.age.toString())

      await page.locator('#mother____nationality').click()
      await page
        .getByText(declaration.mother.nationality, { exact: true })
        .click()

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____passport')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()

      await page.getByLabel('Rural').check()
      await page.locator('#village').fill(declaration.mother.address.village)

      await page.locator('#mother____maritalStatus').click()
      await page
        .getByText(declaration.mother.maritalStatus, { exact: true })
        .click()

      await page.locator('#mother____educationalAttainment').click()
      await page
        .getByText(declaration.mother.levelOfEducation, { exact: true })
        .click()

      await continueForm(page)
    })

    test("2.1.4 Fill father's details", async () => {
      await page
        .locator('#father____firstname')
        .fill(declaration.father.name.firstNames)
      await page
        .locator('#father____surname')
        .fill(declaration.father.name.familyName)

      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#father____age')
        .fill(declaration.father.age.toString())

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____passport')
        .fill(declaration.father.identifier.id)

      await page.getByLabel('No', { exact: true }).check()

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.father.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.father.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.father.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.father.address.district, { exact: true })
        .click()
      await page.getByLabel(declaration.father.address.urbanOrRural).check()
      await page.locator('#town').fill(declaration.father.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.father.address.residentialArea)
      await page.locator('#street').fill(declaration.father.address.street)
      await page.locator('#number').fill(declaration.father.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.father.address.postcodeOrZip)

      await page.locator('#father____maritalStatus').click()
      await page
        .getByText(declaration.father.maritalStatus, { exact: true })
        .click()

      await page.locator('#father____educationalAttainment').click()
      await page
        .getByText(declaration.father.levelOfEducation, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('2.1.5 Go To Review', async () => {
      await goToSection(page, 'review')
    })

    test('2.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expectValueInTestId(
        page,
        'row-value-child.firstname',
        declaration.child.name.firstNames
      )

      await expectValueInTestId(
        page,
        'row-value-child.surname',
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expectValueInTestId(
        page,
        'row-value-child.gender',
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expectValueInTestId(
        page,
        'row-value-child.dob',
        `${declaration.child.birthDate.yyyy}-${declaration.child.birthDate.mm}-${declaration.child.birthDate.dd}`
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expectValueInTestId(
        page,
        'row-value-child.placeOfBirth',
        declaration.placeOfBirth
      )

      await expectValuesInTestId(
        page,
        'row-value-child.address',
        Object.values(declaration.birthLocation)
      )

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expectValueInTestId(
        page,
        'row-value-child.attendantAtBirth',
        declaration.attendantAtBirth
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expectValueInTestId(
        page,
        'row-value-child.birthType',
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Informant's relation to child
       */
      await expectValueInTestId(
        page,
        'row-value-informant.relation',
        declaration.informantType
      )
      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expectValueInTestId(
        page,
        'row-value-informant.email',
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expectValueInTestId(
        page,
        'row-value-mother.firstname',
        declaration.mother.name.firstNames
      )

      await expectValueInTestId(
        page,
        'row-value-mother.surname',
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's age
       */
      // @TODO: this should pass, but 'years' postfix is not yet implemented on V2
      // await expectValueInTestId(
      //   page,
      //   'row-value-mother.age',
      //   joinValuesWith([declaration.mother.age, 'years'])
      // )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expectValueInTestId(
        page,
        'row-value-mother.nationality',
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expectValueInTestId(
        page,
        'row-value-mother.maritalStatus',
        declaration.mother.maritalStatus
      )

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expectValueInTestId(
        page,
        'row-value-mother.educationalAttainment',
        declaration.mother.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expectValueInTestId(
        page,
        'row-value-mother.idType',
        declaration.mother.identifier.type
      )

      await expectValueInTestId(
        page,
        'row-value-mother.passport',
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      await expectValuesInTestId(
        page,
        'row-value-mother.address',
        Object.values(declaration.mother.address)
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expectValueInTestId(
        page,
        'row-value-father.firstname',
        declaration.father.name.firstNames
      )

      await expectValueInTestId(
        page,
        'row-value-father.surname',
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      // @TODO: this should pass, but 'years' postfix is not yet implemented on V2
      // await expectValueInTestId(
      //   page,
      //   'row-value-father.age',
      //   joinValuesWith([declaration.father.age, 'years'])
      // )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expectValueInTestId(
        page,
        'row-value-father.nationality',
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expectValueInTestId(
        page,
        'row-value-father.idType',
        declaration.father.identifier.type
      )

      await expectValueInTestId(
        page,
        'row-value-father.passport',
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expectValueInTestId(
        page,
        'row-value-father.maritalStatus',
        declaration.father.maritalStatus
      )

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expectValueInTestId(
        page,
        'row-value-father.educationalAttainment',
        declaration.father.levelOfEducation
      )

      /*
       * Expected result: should include
       * - Father's address
       */
      await expectValuesInTestId(
        page,
        'row-value-father.address',
        Object.values(declaration.father.address)
      )
    })

    test('2.1.7 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature-form-input')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    // @TODO: there is field validation bugs on the checkboxes on V2, so we can not send to review yet
    test.skip('2.1.8 Send for review', async () => {
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
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  // @TODO: This is not yet supported on V2, please add this test case when it is!
  test.describe.skip('2.2 Declaration Review by RA', async () => {
    test('2.2.1 Navigate to the declaration review page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
        .click()
      await assignRecord(page)
      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Review declaration').click()
    })

    test('2.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.locator('#child.firstname')).toContainText(
        declaration.child.name.firstNames
      )
      await expect(page.locator('#child.surname')).toContainText(
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
       * - Mother's age
       */
      await expect(page.locator('#mother-content #Age')).toContainText(
        joinValuesWith([declaration.mother.age, 'years'])
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
  })
})
