import { test, expect, type Page } from '@playwright/test'
import { createPIN, getRandomDate, goToSection, login } from '../../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

test.describe.serial('1. Birth declaration case - 1', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
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
        firstNames: faker.name.firstName('female'),
        familyName: faker.name.lastName('female')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        urbanOrRural: 'Urban',
        town: faker.address.city(),
        residentialArea: faker.address.county(),
        street: faker.address.streetName(),
        number: faker.address.buildingNumber(),
        postcodeOrZip: faker.address.zipCode()
      },
      maritalStatus: 'Single',
      levelOfEducation: 'No schooling'
    },
    father: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.random.numeric(10),
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

  test.describe('1.1 Declaratin started by FA', async () => {
    test.beforeAll(async () => {
      await login(page, 'k.bwalya', 'test')
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.1 Fill child details', async () => {
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
      await page
        .locator('#birthLocation')
        .fill(declaration.birthLocation.slice(0, 3))
      await page.getByText(declaration.birthLocation).click()

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

      await page
        .locator('#weightAtBirth')
        .fill(declaration.weightAtBirth.toString())

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.2 Fill informant details', async () => {
      await page.waitForTimeout(500)
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test("1.1.3 Fill mother's details", async () => {
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
        .locator('#motherNationalId')
        .fill(declaration.mother.identifier.id)

      await page.locator('#statePrimaryMother').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#districtPrimaryMother').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()

      await page
        .locator('#cityPrimaryMother')
        .fill(declaration.mother.address.town)
      await page
        .locator('#addressLine1UrbanOptionPrimaryMother')
        .fill(declaration.mother.address.residentialArea)
      await page
        .locator('#addressLine2UrbanOptionPrimaryMother')
        .fill(declaration.mother.address.street)
      await page
        .locator('#addressLine3UrbanOptionPrimaryMother')
        .fill(declaration.mother.address.number)
      await page
        .locator('#postalCodePrimaryMother')
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

    test("1.1.4 Fill father's details", async () => {
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
        .locator('#fatherNationalId')
        .fill(declaration.father.identifier.id)

      await page.locator('#nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

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

    test('1.1.5 Go to preview', async () => {
      goToSection(page, 'preview')
    })

    test('1.1.6 Verify informations in preview page', async () => {
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
        declaration.mother.address.province
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.town
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.residentialArea
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.street
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.number
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
      await expect(page.locator('#father-content #Same')).toContainText('Yes')
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
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
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
          name: `${declaration.child.name.firstNames} ${declaration.child.name.familyName}`
        })
        .click()
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()
      await page.getByRole('button', { name: 'Review', exact: true }).click()
    })

    test('1.2.2 Verify informations in review page', async () => {
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
        declaration.mother.address.province
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.town
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.residentialArea
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.street
      )
      await expect(page.locator('#mother-content #Usual')).toContainText(
        declaration.mother.address.number
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
      await expect(page.locator('#father-content #Same')).toContainText('Yes')
    })
  })
})
