import { test, expect, type Page } from '@playwright/test'
import {
  drawSignature,
  continueForm,
  createPIN,
  getRandomDate,
  goToSection,
  login,
  expectTextWithChangeLink,
  formatDateObjectTo_ddMMMMyyyy,
  expectOutboxToBeEmpty
} from '../../helpers'
import faker from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'

test.describe.serial('8. Validate declaration review page', () => {
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
    birthLocation: 'Bombwe Health Post',
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
        Country: 'Farajaland',
        Province: 'Pualula',
        District: 'Pili'
      }
    },
    father: {
      name: {
        firstNames: faker.name.firstName('male'),
        familyName: faker.name.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.random.numeric(10),
        type: 'National ID'
      },
      address: 'Same as mother'
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(
      page,
      CREDENTIALS.FIELD_AGENT.USERNAME,
      CREDENTIALS.FIELD_AGENT.PASSWORD
    )
    await createPIN(page)
    await page.click('#header_new_event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Field agent actions', async () => {
    test.describe('8.1.0 Fill up birth registration form', async () => {
      test('8.1.0.1 Fill child details', async () => {
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
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.child.birthDate.yyyy)

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

        await continueForm(page)
      })

      test('8.1.0.2 Fill informant details', async () => {
        await page.locator('#informantType').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()

        await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

        await page
          .locator('#registrationEmail')
          .fill(declaration.informantEmail)

        await continueForm(page)
      })

      test("8.1.0.3 Fill mother's details", async () => {
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
          .getByText(declaration.mother.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryMother').click()
        await page
          .getByText(declaration.mother.address.District, { exact: true })
          .click()

        await continueForm(page)
      })

      test("8.1.0.4 Fill father's details", async () => {
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

        await continueForm(page)
      })
    })

    test.describe('8.1.1 Navigate to declaration preview page', async () => {
      test('8.1.1.1 Verify information added on previous pages', async () => {
        await goToSection(page, 'preview')

        /*
         * Expected result: should include
         * - Child's First Name
         * - Child's Family Name
         * - Change button
         */
        await expect(page.locator('#child-content #Full')).toContainText(
          declaration.child.name.firstNames
        )
        await expectTextWithChangeLink(page.locator('#child-content #Full'), [
          declaration.child.name.familyName
        ])

        /*
         * Expected result: should include
         * - Child's Gender
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#child-content #Sex'), [
          declaration.child.gender
        ])

        /*
         * Expected result: should include
         * - Child's date of birth
         * - Change button
         */
        await expect(page.locator('#child-content #Date')).toContainText(
          formatDateObjectTo_ddMMMMyyyy(declaration.child.birthDate)
        )

        /*
         * Expected result: should include
         * - Child's Place of birth type
         * - Child's Place of birth details
         * - Change button
         */
        await expect(page.locator('#child-content #Place')).toContainText(
          declaration.placeOfBirth
        )
        await expectTextWithChangeLink(page.locator('#child-content #Place'), [
          declaration.birthLocation
        ])

        /*
         * Expected result: should include
         * - Child's Attendant at birth
         * - Change button
         */
        await expectTextWithChangeLink(
          page.locator('#child-content #Attendant'),
          [declaration.attendantAtBirth]
        )

        /*
         * Expected result: should include
         * - Child's Birth type
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#child-content #Type'), [
          declaration.birthType
        ])

        /*
         * Expected result: should include
         * - Child's Weight at birth
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#child-content #Weight'), [
          declaration.weightAtBirth.toString()
        ])

        /*
         * Expected result: should include
         * - Informant's relation to child
         * - Change button
         */
        await expectTextWithChangeLink(
          page.locator('#informant-content #Relationship'),
          [declaration.informantType]
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
         * - Mother's First Name
         * - Mother's Family Name
         * - Change button
         */
        await expect(page.locator('#mother-content #Full')).toContainText(
          declaration.mother.name.firstNames
        )
        await expectTextWithChangeLink(page.locator('#mother-content #Full'), [
          declaration.mother.name.familyName
        ])

        /*
         * Expected result: should include
         * - Mother's date of birth
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#mother-content #Date'), [
          formatDateObjectTo_ddMMMMyyyy(declaration.mother.birthDate)
        ])

        /*
         * Expected result: should include
         * - Mother's Nationality
         * - Change button
         */
        await expectTextWithChangeLink(
          page.locator('#mother-content #Nationality'),
          [declaration.mother.nationality]
        )
        /*
         * Expected result: should include
         * - Mother's Type of Id
         * - Mother's Id Number
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#mother-content #Type'), [
          declaration.mother.identifier.type
        ])
        await expectTextWithChangeLink(page.locator('#mother-content #ID'), [
          declaration.mother.identifier.id
        ])

        /*
         * Expected result: should include
         * - Mother's address
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#mother-content #Usual'), [
          declaration.mother.address.Country,
          declaration.mother.address.District,
          declaration.mother.address.Province
        ])

        /*
         * Expected result: should include
         * - Father's First Name
         * - Father's Family Name
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#father-content #Full'), [
          declaration.father.name.firstNames,
          declaration.father.name.familyName
        ])

        /*
         * Expected result: should include
         * - Father's date of birth
         * - Change button
         */
        await expect(page.locator('#father-content #Date')).toContainText(
          formatDateObjectTo_ddMMMMyyyy(declaration.father.birthDate)
        )
        await expect(page.locator('#father-content #Full')).toContainText(
          'Change'
        )

        /*
         * Expected result: should include
         * - Father's Nationality
         * - Change button
         */
        await expectTextWithChangeLink(
          page.locator('#father-content #Nationality'),
          [declaration.father.nationality]
        )
        /*
         * Expected result: should include
         * - Father's Type of Id
         * - Father's Id Number
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#father-content #Type'), [
          declaration.father.identifier.type
        ])
        await expectTextWithChangeLink(page.locator('#father-content #ID'), [
          declaration.father.identifier.id
        ])

        /*
         * Expected result: should include
         * - Father's address
         * - Change button
         */
        await expectTextWithChangeLink(page.locator('#father-content #Same'), [
          'Yes'
        ])
      })
    })

    test.describe('8.1.2 Click any "Change" link', async () => {
      test("8.1.2.1 Change child's name", async () => {
        await page.locator('#child-content #Full').getByText('Change').click()

        declaration.child.name = {
          firstNames: faker.name.firstName('male'),
          familyName: faker.name.lastName('male')
        }
        await page
          .locator('#firstNamesEng')
          .fill(declaration.child.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.child.name.familyName)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's name
         */
        await expect(page.locator('#child-content #Full')).toContainText(
          declaration.child.name.firstNames
        )
        await expect(page.locator('#child-content #Full')).toContainText(
          declaration.child.name.familyName
        )
      })

      test("8.1.2.2 Change child's gender", async () => {
        await page.locator('#child-content #Sex').getByText('Change').click()

        declaration.child.gender = 'Female'

        await page.locator('#gender').click()
        await page.getByText(declaration.child.gender, { exact: true }).click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's gender
         */
        await expect(page.locator('#child-content #Sex')).toContainText(
          declaration.child.gender
        )
      })

      test("8.1.2.3 Change child's birthday", async () => {
        await page.locator('#child-content #Date').getByText('Change').click()

        declaration.child.birthDate = getRandomDate(0, 200)
        await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.child.birthDate.yyyy)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's birthday
         */
        await expect(page.locator('#child-content #Date')).toContainText(
          formatDateObjectTo_ddMMMMyyyy(declaration.child.birthDate)
        )
      })

      test("8.1.2.4 Change child's birth location", async () => {
        await page.locator('#child-content #Place').getByText('Change').click()

        declaration.birthLocation = 'Chikonkomene Health Post'
        await page
          .locator('#birthLocation')
          .fill(declaration.birthLocation.slice(0, 3))
        await page.getByText(declaration.birthLocation).click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change child's place of birth
         */
        await expect(page.locator('#child-content #Place')).toContainText(
          declaration.birthLocation
        )
      })

      test('8.1.2.5 Change attendant at birth', async () => {
        await page
          .locator('#child-content #Attendant')
          .getByText('Change')
          .click()

        declaration.attendantAtBirth = 'Midwife'
        await page.locator('#attendantAtBirth').click()
        await page
          .getByText(declaration.attendantAtBirth, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change attendant at birth
         */
        await expect(page.locator('#child-content #Attendant')).toContainText(
          declaration.attendantAtBirth
        )
      })

      test('8.1.2.6 Change type of birth', async () => {
        await page.locator('#child-content #Type').getByText('Change').click()

        declaration.birthType = 'Twin'
        await page.locator('#birthType').click()
        await page
          .getByText(declaration.birthType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change type of birth
         */
        await expect(page.locator('#child-content #Type')).toContainText(
          declaration.birthType
        )
      })

      test("8.1.2.7 Change child's weight at birth", async () => {
        await page.locator('#child-content #Weight').getByText('Change').click()

        declaration.weightAtBirth = 2.7
        await page
          .locator('#weightAtBirth')
          .fill(declaration.weightAtBirth.toString())
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change weight at birth
         */
        await expect(page.locator('#child-content #Weight')).toContainText(
          declaration.weightAtBirth.toString()
        )
      })

      test('8.1.2.8 Change informant type', async () => {
        await page
          .locator('#informant-content #Relationship')
          .getByText('Change')
          .click()

        await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child
        declaration.informantType = 'Father'
        await page.locator('#informantType').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change informant type
         */
        await expect(
          page.locator('#informant-content #Relationship')
        ).toContainText(declaration.informantType)
      })

      test('8.1.2.9 Change registration email', async () => {
        await page
          .locator('#informant-content #Email')
          .getByText('Change')
          .click()

        declaration.informantEmail =
          declaration.father.name.firstNames.toLowerCase() +
          '.' +
          declaration.father.name.familyName.toLowerCase() +
          (Math.random() * 1000).toFixed(0) +
          '@gmail.com'
        await page
          .locator('#registrationEmail')
          .fill(declaration.informantEmail)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change registration email
         */
        await expect(page.locator('#informant-content #Email')).toContainText(
          declaration.informantEmail
        )
      })

      test("8.1.2.10 Change mother's name", async () => {
        await page.locator('#mother-content #Full').getByText('Change').click()

        declaration.mother.name.firstNames = faker.name.firstName('female')
        declaration.mother.name.familyName = faker.name.lastName('female')
        await page
          .locator('#firstNamesEng')
          .fill(declaration.mother.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.mother.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's name
         */
        await expect(page.locator('#mother-content #Full')).toContainText(
          declaration.mother.name.firstNames
        )
      })

      test("8.1.2.11 Change mother's birthday", async () => {
        await page.locator('#mother-content #Date').getByText('Change').click()

        declaration.mother.birthDate = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.mother.birthDate.yyyy)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's birthday
         */
        await expect(page.locator('#mother-content #Date')).toContainText(
          formatDateObjectTo_ddMMMMyyyy(declaration.mother.birthDate)
        )
      })

      test("8.1.2.12 Change mother's nationality", async () => {
        await page
          .locator('#mother-content #Nationality')
          .getByText('Change')
          .click()

        declaration.mother.nationality = 'Holy See'
        await page.locator('#nationality').click()
        await page
          .getByText(declaration.mother.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's nationality
         */
        await expect(
          page.locator('#mother-content #Nationality')
        ).toContainText(declaration.mother.nationality)
      })

      test("8.1.2.13 Change mother's ID type", async () => {
        await page.locator('#mother-content #Type').getByText('Change').click()

        declaration.mother.identifier.type = 'Passport'
        await page.locator('#motherIdType').click()
        await page
          .getByText(declaration.mother.identifier.type, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's ID type
         */
        await expect(page.locator('#mother-content #Type')).toContainText(
          declaration.mother.identifier.type
        )
      })

      test("8.1.2.14 Change mother's ID", async () => {
        await page.locator('#mother-content #ID').getByText('Change').click()
        declaration.mother.identifier.id = faker.random.numeric(10)
        await page
          .locator('#motherPassport')
          .fill(declaration.mother.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's ID
         */
        await expect(page.locator('#mother-content #ID')).toContainText(
          declaration.mother.identifier.id
        )
      })

      test("8.1.2.15 Change mother's address", async () => {
        await page.locator('#mother-content #Usual').getByText('Change').click()

        declaration.mother.address.Province = 'Sulaka'
        declaration.mother.address.District = 'Afue'
        await page.locator('#statePrimaryMother').click()
        await page
          .getByText(declaration.mother.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryMother').click()
        await page
          .getByText(declaration.mother.address.District, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change mother's address
         */
        await expect(page.locator('#mother-content #Usual')).toContainText(
          declaration.mother.address.District
        )
        await expect(page.locator('#mother-content #Usual')).toContainText(
          declaration.mother.address.Province
        )
      })

      test("8.1.2.16 Change father's name", async () => {
        await page.locator('#father-content #Full').getByText('Change').click()

        declaration.father.name.firstNames = faker.name.firstName('male')
        declaration.father.name.familyName = faker.name.lastName('male')
        await page
          .locator('#firstNamesEng')
          .fill(declaration.father.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.father.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's name
         */
        await expect(page.locator('#father-content #Full')).toContainText(
          declaration.father.name.firstNames
        )
      })

      test("8.1.2.17 Change father's birthday", async () => {
        await page.locator('#father-content #Date').getByText('Change').click()

        declaration.father.birthDate = getRandomDate(21, 200)
        await page.getByPlaceholder('dd').fill(declaration.father.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.father.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.father.birthDate.yyyy)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's birthday
         */
        await expect(page.locator('#father-content #Date')).toContainText(
          formatDateObjectTo_ddMMMMyyyy(declaration.father.birthDate)
        )
      })

      test("8.1.2.18 Change father's nationality", async () => {
        await page
          .locator('#father-content #Nationality')
          .getByText('Change')
          .click()

        declaration.father.nationality = 'Holy See'
        await page.locator('#nationality').click()
        await page
          .getByText(declaration.father.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's nationality
         */
        await expect(
          page.locator('#father-content #Nationality')
        ).toContainText(declaration.father.nationality)
      })

      test("8.1.2.19 Change father's ID type", async () => {
        await page.locator('#father-content #Type').getByText('Change').click()

        declaration.father.identifier.type = 'Passport'
        await page.locator('#fatherIdType').click()
        await page
          .getByText(declaration.father.identifier.type, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's ID type
         */
        await expect(page.locator('#father-content #Type')).toContainText(
          declaration.father.identifier.type
        )
      })

      test("8.1.2.20 Change father's ID", async () => {
        await page.locator('#father-content #ID').getByText('Change').click()
        declaration.father.identifier.id = faker.random.numeric(10)
        await page
          .locator('#fatherPassport')
          .fill(declaration.father.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should change father's ID
         */
        await expect(page.locator('#father-content #ID')).toContainText(
          declaration.father.identifier.id
        )
      })
    })

    test.describe('8.1.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.1.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.1.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.1.6 Fill up informant signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page)
      await page
        .locator('#informantSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('8.1.7 Click send button', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
    })

    test('8.1.8 Confirm the declaration to send for review', async () => {
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await page.getByRole('button', { name: 'Sent for review' }).click()
      await expectOutboxToBeEmpty(page)
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

  test.describe('8.2 Registration agent actions', async () => {
    test('8.2.1 Navigate to the declaration preview page', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
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
    test('8.2.1.1 Verify information added on previous pages', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Full'), [
        declaration.child.name.firstNames,
        declaration.child.name.familyName
      ])

      /*
       * Expected result: should include
       * - Child's Gender
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Sex'), [
        declaration.child.gender
      ])

      /*
       * Expected result: should include
       * - Child's date of birth
       * - Change button
       */
      await expect(page.locator('#child-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Place'), [
        declaration.placeOfBirth,
        declaration.birthLocation
      ])

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#child-content #Attendant'),
        [declaration.attendantAtBirth]
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Type'), [
        declaration.birthType
      ])

      /*
       * Expected result: should include
       * - Child's Weight at birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Weight'), [
        declaration.weightAtBirth.toString()
      ])

      /*
       * Expected result: should include
       * - Informant's relation to child
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Relationship'),
        [declaration.informantType]
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
       * - Mother's First Name
       * - Mother's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Full'), [
        declaration.mother.name.firstNames,
        declaration.mother.name.familyName
      ])

      /*
       * Expected result: should include
       * - Mother's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.mother.birthDate)
      ])

      /*
       * Expected result: should include
       * - Mother's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#mother-content #Nationality'),
        [declaration.mother.nationality]
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Type'), [
        declaration.mother.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#mother-content #ID'), [
        declaration.mother.identifier.id
      ])

      /*
       * Expected result: should include
       * - Mother's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Usual'), [
        declaration.mother.address.Country,
        declaration.mother.address.District,
        declaration.mother.address.Province
      ])

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Full'), [
        declaration.father.name.firstNames,
        declaration.father.name.familyName
      ])

      /*
       * Expected result: should include
       * - Father's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.father.birthDate)
      ])

      /*
       * Expected result: should include
       * - Father's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#father-content #Nationality'),
        [declaration.father.nationality]
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Type'), [
        declaration.father.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#father-content #ID'), [
        declaration.father.identifier.id
      ])

      /*
       * Expected result: should include
       * - Father's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Same'), [
        'Yes'
      ])
    })

    test.describe('8.2.2 Click any "Change" link', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.2.5 Validate the declaration send button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.2.6 Click send button', async () => {
      await page.getByRole('button', { name: 'Send for approval' }).click()
      await expect(page.getByText('Send for approval?')).toBeVisible()
    })

    test('8.2.7 Confirm the declaration to send for approval', async () => {
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await page.getByRole('button', { name: 'Sent for approval' }).click()
      await expectOutboxToBeEmpty(page)

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

  test.describe('8.3 Local registrar actions', async () => {
    test('8.3.1 Navigate to the declaration preview page', async () => {
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
    test('8.3.1.1 Verify information added on previous pages', async () => {
      /*
       * Expected result: should include
       * - Child's First Name
       * - Child's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Full'), [
        declaration.child.name.firstNames,
        declaration.child.name.familyName
      ])

      /*
       * Expected result: should include
       * - Child's Gender
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Sex'), [
        declaration.child.gender
      ])

      /*
       * Expected result: should include
       * - Child's date of birth
       * - Change button
       */
      await expect(page.locator('#child-content #Date')).toContainText(
        formatDateObjectTo_ddMMMMyyyy(declaration.child.birthDate)
      )

      /*
       * Expected result: should include
       * - Child's Place of birth type
       * - Child's Place of birth details
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Place'), [
        declaration.placeOfBirth,
        declaration.birthLocation
      ])

      /*
       * Expected result: should include
       * - Child's Attendant at birth
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#child-content #Attendant'),
        [declaration.attendantAtBirth]
      )

      /*
       * Expected result: should include
       * - Child's Birth type
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Type'), [
        declaration.birthType
      ])

      /*
       * Expected result: should include
       * - Child's Weight at birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#child-content #Weight'), [
        declaration.weightAtBirth.toString()
      ])

      /*
       * Expected result: should include
       * - Informant's relation to child
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Relationship'),
        [declaration.informantType]
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
       * - Mother's First Name
       * - Mother's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Full'), [
        declaration.mother.name.firstNames,
        declaration.mother.name.familyName
      ])

      /*
       * Expected result: should include
       * - Mother's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.mother.birthDate)
      ])

      /*
       * Expected result: should include
       * - Mother's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#mother-content #Nationality'),
        [declaration.mother.nationality]
      )

      /*
       * Expected result: should include
       * - Mother's Type of Id
       * - Mother's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Type'), [
        declaration.mother.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#mother-content #ID'), [
        declaration.mother.identifier.id
      ])

      /*
       * Expected result: should include
       * - Mother's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#mother-content #Usual'), [
        declaration.mother.address.Country,
        declaration.mother.address.District,
        declaration.mother.address.Province
      ])

      /*
       * Expected result: should include
       * - Father's First Name
       * - Father's Family Name
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Full'), [
        declaration.father.name.firstNames,
        declaration.father.name.familyName
      ])

      /*
       * Expected result: should include
       * - Father's date of birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.father.birthDate)
      ])

      /*
       * Expected result: should include
       * - Father's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#father-content #Nationality'),
        [declaration.father.nationality]
      )

      /*
       * Expected result: should include
       * - Father's Type of Id
       * - Father's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Type'), [
        declaration.father.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#father-content #ID'), [
        declaration.father.identifier.id
      ])

      /*
       * Expected result: should include
       * - Father's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#father-content #Same'), [
        'Yes'
      ])
    })

    const newFamilyNameForChild = faker.name.lastName('male')

    test("8.3.2.1 Update child's family name", async () => {
      await page
        .locator('#child-content #Full')
        .getByRole('button', { name: 'Change' })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()

      await page.locator('#familyNameEng').fill(newFamilyNameForChild)

      await page.getByRole('button', { name: 'Back to review' }).click()
    })

    test("8.3.2.2 Review child's changed family name", async () => {
      await expect(
        page.locator('#child-content #Full [data-test-id="row-value-Full"]')
      ).toContainText(
        `${declaration.child.name.firstNames} ${declaration.child.name.familyName}
            ${declaration.child.name.firstNames} ${newFamilyNameForChild}`,
        {
          useInnerText: true // makes line break intentional
        }
      )
    })

    test.describe('8.3.3 Validate supporting document', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.3.4 Validate additional comments box', async () => {
      test.skip('Skipped for now', async () => {})
    })
    test.describe('8.3.5 Validate the register button', async () => {
      test.skip('Skipped for now', async () => {})
    })

    test('8.3.6 Click send button', async () => {
      await page.getByRole('button', { name: 'Register' }).click()
      await expect(page.getByText('Register the birth?')).toBeVisible()
    })

    test('8.3.7 Confirm the declaration to ready for print', async () => {
      await page.locator('#submit_confirm').click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await page.getByRole('button', { name: 'Ready to print' }).click()
      await expectOutboxToBeEmpty(page)

      /*
       * Expected result: The declaration should be in Ready to print
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.child.name.firstNames} ${newFamilyNameForChild}`
        })
      ).toBeVisible()

      await expect(
        page
          .locator('div')
          .filter({
            has: page.getByRole('button', {
              name: `${declaration.child.name.firstNames} ${newFamilyNameForChild}`
            })
          })
          .filter({
            hasText: /seconds ago/ // should match the registration time
          })
      ).not.toHaveCount(0)
    })
  })
})
