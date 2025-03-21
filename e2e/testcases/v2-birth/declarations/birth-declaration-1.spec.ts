import { test, expect, type Page } from '@playwright/test'
import {
  assignRecord,
  continueForm,
  drawSignature,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateObjectTo_ddMMMMyyyy,
  formatDateObjectTo_dMMMMyyyy,
  formatName,
  getAction,
  getRandomDate,
  goToSection,
  loginToV2
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('1. Birth declaration case - 1', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    attendantAtBirth: 'Physician',
    birthType: 'Single',
    weightAtBirth: 2.4,
    placeOfBirth: 'Health Institution',
    birthLocation: 'Golden Valley Rural Health Centre',
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
      name: {
        firstNames: faker.person.firstName('female'),
        familyName: faker.person.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      },
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling'
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling',
      address: {
        sameAsMother: true
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
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.1 Fill child details', async () => {
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
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.slice(0, 3))
      await page.getByText(declaration.birthLocation).click()

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

      await page
        .locator('#child____weightAtBirth')
        .fill(declaration.weightAtBirth.toString())

      await continueForm(page)
    })

    test('1.1.2 Fill informant details', async () => {
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

    test("1.1.3 Fill mother's details", async () => {
      await page
        .locator('#mother____firstname')
        .fill(declaration.mother.name.firstNames)
      await page
        .locator('#mother____surname')
        .fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____nid')
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

      await page.locator('#town').fill(declaration.mother.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.mother.address.residentialArea)
      await page.locator('#street').fill(declaration.mother.address.street)
      await page.locator('#number').fill(declaration.mother.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.mother.address.postcodeOrZip)

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

    test("1.1.4 Fill father's details", async () => {
      await page
        .locator('#father____firstname')
        .fill(declaration.father.name.firstNames)
      await page
        .locator('#father____surname')
        .fill(declaration.father.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.father.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.father.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.father.birthDate.yyyy)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____nid')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.locator('#father____addressSameAs_YES').click()

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

    test('1.1.5 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('1.1.6 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.firstname')).toHaveText(
        declaration.child.name.firstNames
      )

      await expect(page.getByTestId('row-value-child.surname')).toHaveText(
        declaration.child.name.familyName
      )

      /*
       * Expected result: should include
       * - Child's Gender
       */
      await expect(page.getByTestId('row-value-child.gender')).toHaveText(
        declaration.child.gender
      )

      /*
       * Expected result: should include
       * - Child's date of birth
       */
      await expect(page.getByTestId('row-value-child.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       */
      await expect(page.getByTestId('row-value-child.placeOfBirth')).toHaveText(
        declaration.placeOfBirth
      )
      await expect(
        page.getByTestId('row-value-child.birthLocation')
      ).toHaveText(declaration.birthLocation)

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       */
      await expect(
        page.getByTestId('row-value-child.attendantAtBirth')
      ).toHaveText(declaration.attendantAtBirth)

      /*
       * Expected result: should include
       * - Child's Birth type
       */
      await expect(page.getByTestId('row-value-child.birthType')).toHaveText(
        declaration.birthType
      )

      /*
       * Expected result: should include
       * - Child's Weight at birth
       */
      await expect(
        page.getByTestId('row-value-child.weightAtBirth')
      ).toHaveText(declaration.weightAtBirth.toString())

      /*
       * Expected result: should include
       * - Informant's relation to child
       */

      await expect(page.getByTestId('row-value-informant.relation')).toHaveText(
        declaration.informantType
      )

      /*
       * Expected result: should include
       * - Informant's Email
       */
      await expect(page.getByTestId('row-value-informant.email')).toHaveText(
        declaration.informantEmail
      )

      /*
       * Expected result: should include
       * - Mother's First Name
       * - Mother's Family Name
       */
      await expect(page.getByTestId('row-value-mother.firstname')).toHaveText(
        declaration.mother.name.firstNames
      )

      await expect(page.getByTestId('row-value-mother.surname')).toHaveText(
        declaration.mother.name.familyName
      )

      /*
       * Expected result: should include
       * - Mother's date of birth
       */
      await expect(page.getByTestId('row-value-mother.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.mother.birthDate)
      )

      /*
       * Expected result: should include
       * - Mother's Nationality
       */
      await expect(page.getByTestId('row-value-mother.nationality')).toHaveText(
        declaration.mother.nationality
      )

      /*
       * Expected result: should include
       * - Mother's Marital status
       */
      await expect(
        page.getByTestId('row-value-mother.maritalStatus')
      ).toHaveText(declaration.mother.maritalStatus)

      /*
       * Expected result: should include
       * - Mother's level of education
       */
      await expect(
        page.getByTestId('row-value-mother.educationalAttainment')
      ).toHaveText(declaration.mother.levelOfEducation)

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       */
      await expect(page.getByTestId('row-value-mother.idType')).toHaveText(
        declaration.mother.identifier.type
      )

      await expect(page.getByTestId('row-value-mother.nid')).toHaveText(
        declaration.mother.identifier.id
      )

      /*
       * Expected result: should include
       * - Mother's address
       */
      // @TODO: There is a bug on V2, where it shows an empty 'Usual place of residence' field on the review page
      await Promise.all(
        Object.values(declaration.mother.address).map((val) =>
          expect(
            page.getByTestId('row-value-mother.address').getByText(val)
          ).toBeVisible()
        )
      )

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       */
      await expect(page.getByTestId('row-value-father.firstname')).toHaveText(
        declaration.father.name.firstNames
      )

      await expect(page.getByTestId('row-value-father.surname')).toHaveText(
        declaration.father.name.familyName
      )

      /*
       * Expected result: should include
       * - Father's date of birth
       */
      await expect(page.getByTestId('row-value-father.dob')).toHaveText(
        formatDateObjectTo_dMMMMyyyy(declaration.father.birthDate)
      )

      /*
       * Expected result: should include
       * - Father's Nationality
       */
      await expect(page.getByTestId('row-value-father.nationality')).toHaveText(
        declaration.father.nationality
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       */
      await expect(page.getByTestId('row-value-father.idType')).toHaveText(
        declaration.father.identifier.type
      )

      await expect(page.getByTestId('row-value-father.nid')).toHaveText(
        declaration.father.identifier.id
      )

      /*
       * Expected result: should include
       * - Father's Marital status
       */
      await expect(
        page.getByTestId('row-value-father.maritalStatus')
      ).toHaveText(declaration.father.maritalStatus)

      /*
       * Expected result: should include
       * - Father's level of education
       */
      await expect(
        page.getByTestId('row-value-father.educationalAttainment')
      ).toHaveText(declaration.father.levelOfEducation)

      /*
       * Expected result: should include
       * - Father's address
       */
      await expect(
        page.getByTestId('row-value-father.addressSameAs')
      ).toHaveText('Yes')
    })
    test('1.1.7 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature-form-input')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('1.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('All events')).toBeVisible()

      /*
       * @TODO: When workflows are implemented on V2, this should navigate to correct workflow first.
       */
      await expect(
        page.getByRole('button', {
          name: formatName(declaration.child.name)
        })
      ).toBeVisible()
    })
  })

  // @TODO: This is not yet supported on V2, please add this test case when it is!
  test.describe.skip('1.2 Declaration Review by RA', async () => {
    test('1.2.1 Navigate to the declaration review page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: formatName(declaration.child.name)
        })
        .click()
      await assignRecord(page)
      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Review declaration').click()
    })

    test('1.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       */
      await expect(page.getByTestId('row-value-child.firstname')).toContainText(
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
      await expect(page.locator('#child-content #Place')).toContainText(
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
       * - Child's Weight at birth
       */
      await expect(page.locator('#child-content #Weight')).toContainText(
        declaration.weightAtBirth.toString()
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
      await expect(page.locator('#father-content #Same')).toContainText('Yes')
    })
  })
})
