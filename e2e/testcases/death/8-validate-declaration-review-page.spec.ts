import { test, expect, type Page } from '@playwright/test'
import { createPIN, getRandomDate, goToSection, login } from '../../helpers'
import faker from '@faker-js/faker'
import { format } from 'date-fns'

test.describe.serial('8. Validate declaration review page', () => {
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
      address: {
        Country: 'Farajaland',
        Province: 'Pualula',
        District: 'Pili'
      }
    },
    event: {
      date: getRandomDate(0, 20),
      cause: {
        established: false,
        details: ''
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
    await login(page, 'k.bwalya', 'test')
    await createPIN(page)
    await page.click('#header_new_event')
    await page.getByLabel('Death').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('8.1 Field agent actions', async () => {
    test.describe('8.1.0 Fill up death registration form', async () => {
      test('8.1.0.1 Fill deceased details', async () => {
        await page
          .locator('#firstNamesEng')
          .fill(declaration.deceased.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.deceased.name.familyName)
        await page.locator('#gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()

        await page
          .getByPlaceholder('dd')
          .fill(declaration.deceased.birthDate.dd)
        await page
          .getByPlaceholder('mm')
          .fill(declaration.deceased.birthDate.mm)
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

        await page.locator('#statePrimaryDeceased').click()
        await page
          .getByText(declaration.deceased.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryDeceased').click()
        await page
          .getByText(declaration.deceased.address.District, { exact: true })
          .click()

        // waiting for 500ms before continuing,
        // otherwise some data entered in the page are lost
        await page.waitForTimeout(500)
        await page.getByRole('button', { name: 'Continue' }).click()
      })

      test('8.1.0.2 Fill event details', async () => {
        await page.getByPlaceholder('dd').fill(declaration.event.date.dd)
        await page.getByPlaceholder('mm').fill(declaration.event.date.mm)
        await page.getByPlaceholder('yyyy').fill(declaration.event.date.yyyy)

        await page.locator('#placeOfDeath').click()
        await page.getByText(declaration.event.place).click()

        await page.waitForTimeout(500)
        await page.getByRole('button', { name: 'Continue' }).click()
      })

      test('8.1.0.3 Fill informant details', async () => {
        await page.waitForTimeout(500)
        await page.locator('#informantType').click()
        await page
          .getByText(declaration.informantType, {
            exact: true
          })
          .click()

        await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

        await page
          .locator('#registrationEmail')
          .fill(declaration.informantEmail)

        await page.waitForTimeout(500)
        await page.getByRole('button', { name: 'Continue' }).click()
      })

      test('8.1.0.4 Fill spouse details', async () => {
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
    })

    test.describe('8.1.1 Navigate to declaration preview page', async () => {
      test('8.1.1.1 Verify informations added in previous pages', async () => {
        goToSection(page, 'preview')

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
         * - Deceased's address
         * - Change button
         */
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.Country
        )
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.District
        )
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.Province
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
         * - Cause of death has been established
         * - Change button
         */
        await expect(page.locator('#deathEvent-content #Cause')).toContainText(
          declaration.event.cause.established ? 'Yes' : 'No'
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
          'Change'
        )

        /*
         * Expected result: should include
         * - Informant type
         * - Change button
         */
        await expect(
          page.locator('#informant-content #Informant')
        ).toContainText(declaration.informantType)
        await expect(
          page.locator('#informant-content #Informant')
        ).toContainText('Change')

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
        await expect(
          page.locator('#spouse-content #Nationality')
        ).toContainText(declaration.spouse.nationality)
        await expect(
          page.locator('#spouse-content #Nationality')
        ).toContainText('Change')

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
        await expect(page.locator('#spouse-content #ID')).toContainText(
          'Change'
        )

        /*
         * Expected result: should include
         * - Spouse's address
         * - Change button
         */
        await expect(page.locator('#spouse-content #Usual')).toContainText(
          'Yes'
        )
      })
    })

    test.describe('8.1.2 Click any "Change" link', async () => {
      test("8.1.2.1 Change deceased's name", async () => {
        await page
          .locator('#deceased-content #Full')
          .getByText('Change')
          .click()
        declaration.deceased.name = {
          firstNames: faker.name.firstName('male'),
          familyName: faker.name.lastName('male')
        }
        await page
          .locator('#firstNamesEng')
          .fill(declaration.deceased.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.deceased.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's name
         */
        await expect(page.locator('#deceased-content #Full')).toContainText(
          declaration.deceased.name.firstNames
        )
        await expect(page.locator('#deceased-content #Full')).toContainText(
          declaration.deceased.name.familyName
        )
      })

      test("8.1.2.2 Change deceased's gender", async () => {
        await page.locator('#deceased-content #Sex').getByText('Change').click()
        declaration.deceased.gender = 'Female'
        await page.locator('#gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's gender
         */
        await expect(page.locator('#deceased-content #Sex')).toContainText(
          declaration.deceased.gender
        )
      })

      test("8.1.2.3 Change deceased's birthday", async () => {
        await page
          .locator('#deceased-content #Date')
          .getByText('Change')
          .click()
        declaration.deceased.birthDate = getRandomDate(5, 200)
        await page
          .getByPlaceholder('dd')
          .fill(declaration.deceased.birthDate.dd)
        await page
          .getByPlaceholder('mm')
          .fill(declaration.deceased.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.deceased.birthDate.yyyy)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's birthday
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
      })

      test("8.1.2.4 Change deceased's ID type", async () => {
        await page
          .locator('#deceased-content #Type')
          .getByText('Change')
          .click()
        declaration.deceased.identifier.type = 'Passport'
        await page.locator('#deceasedIdType').click()
        await page
          .getByText(declaration.deceased.identifier.type, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's ID type
         */
        await expect(page.locator('#deceased-content #Type')).toContainText(
          declaration.deceased.identifier.type
        )
      })
      test("8.1.2.5 Change deceased's ID", async () => {
        await page.locator('#deceased-content #ID').getByText('Change').click()
        declaration.deceased.identifier.id = faker.random.numeric(10)
        await page
          .locator('#deceasedPassport')
          .fill(declaration.deceased.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's ID
         */
        await expect(page.locator('#deceased-content #ID')).toContainText(
          declaration.deceased.identifier.id
        )
      })

      test("8.1.2.6 Change deceased's address", async () => {
        await page
          .locator('#deceased-content #Usual')
          .getByText('Change')
          .click()
        declaration.deceased.address.Province = 'Sulaka'
        declaration.deceased.address.District = 'Afue'
        await page.locator('#statePrimaryDeceased').click()
        await page
          .getByText(declaration.deceased.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryDeceased').click()
        await page
          .getByText(declaration.deceased.address.District, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's address
         */
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.District
        )
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.Province
        )
      })

      test.skip('8.1.2.7 Change informant type', async () => {
        await page
          .locator('#informant-content #Informant')
          .getByText('Change')
          .click()
        declaration.informantType = 'Father'
        await page.waitForTimeout(500)
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
          page.locator('#informant-content #Informant')
        ).toContainText(declaration.informantType)
      })

      test('8.1.2.8 Change registration email', async () => {
        await page
          .locator('#informant-content #Email')
          .getByText('Change')
          .click()
        declaration.informantEmail = faker.internet.email()
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

      test("8.1.2.9 Change spouse's name", async () => {
        await page.locator('#spouse-content #Full').getByText('Change').click()
        declaration.spouse.name.firstNames = faker.name.firstName('female')
        declaration.spouse.name.familyName = faker.name.lastName('female')
        await page
          .locator('#firstNamesEng')
          .fill(declaration.spouse.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.spouse.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's name
         */
        await expect(page.locator('#spouse-content #Full')).toContainText(
          declaration.spouse.name.firstNames
        )
      })
      test("8.1.2.10 Change spouse's birthday", async () => {
        await page.locator('#spouse-content #Date').getByText('Change').click()
        declaration.spouse.birthDate = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.spouse.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.spouse.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.spouse.birthDate.yyyy)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's birthday
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
      })
      test("8.1.2.11 Change spouse's nationality", async () => {
        await page
          .locator('#spouse-content #Nationality')
          .getByText('Change')
          .click()
        declaration.spouse.nationality = 'Holy See'
        await page.locator('#nationality').click()
        await page
          .getByText(declaration.spouse.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's nationality
         */
        await expect(
          page.locator('#spouse-content #Nationality')
        ).toContainText(declaration.spouse.nationality)
      })
      test("8.1.2.12 Change spouse's ID type", async () => {
        await page.locator('#spouse-content #Type').getByText('Change').click()
        declaration.spouse.identifier.type = 'Passport'
        await page.locator('#spouseIdType').click()
        await page
          .getByText(declaration.spouse.identifier.type, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's ID type
         */
        await expect(page.locator('#spouse-content #Type')).toContainText(
          declaration.spouse.identifier.type
        )
      })
      test("8.1.2.13 Change spouse's ID", async () => {
        await page.locator('#spouse-content #ID').getByText('Change').click()
        declaration.spouse.identifier.id = faker.random.numeric(10)
        await page
          .locator('#spousePassport')
          .fill(declaration.spouse.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's ID
         */
        await expect(page.locator('#spouse-content #ID')).toContainText(
          declaration.spouse.identifier.id
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

    test('8.1.6 Click send button', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
    })

    test('8.1.7 Confirm the declaration to send for review', async () => {
      await page.getByRole('button', { name: 'Confirm' }).click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await page.getByRole('button', { name: 'Sent for review' }).click()
      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })
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

  test.describe('8.2 Registration agent actions', async () => {
    test('8.2.1 Navigate to the declaration preview page', async () => {
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
    test('8.2.1.1 Verify informations added in previous pages', async () => {
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
       * - Deceased's address
       * - Change button
       */
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.Country
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.District
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.Province
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
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
      await expect(page.locator('#spouse-content #Usual')).toContainText('Yes')
    })

    test.describe('8.2.2 Click any "Change" link', async () => {
      test("8.2.2.1 Change deceased's name", async () => {
        await page
          .locator('#deceased-content #Full')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.name = {
          firstNames: faker.name.firstName('male'),
          familyName: faker.name.lastName('male')
        }
        await page
          .locator('#firstNamesEng')
          .fill(declaration.deceased.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.deceased.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's name
         */
        await expect(page.locator('#deceased-content #Full')).toContainText(
          declaration.deceased.name.firstNames
        )
        await expect(page.locator('#deceased-content #Full')).toContainText(
          declaration.deceased.name.familyName
        )
      })

      test("8.2.2.2 Change deceased's gender", async () => {
        await page.locator('#deceased-content #Sex').getByText('Change').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.deceased.gender = 'Male'
        await page.locator('#gender').click()
        await page
          .getByText(declaration.deceased.gender, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's gender
         */
        await expect(page.locator('#deceased-content #Sex')).toContainText(
          declaration.deceased.gender
        )
      })

      test("8.2.2.3 Change deceased's birthday", async () => {
        await page
          .locator('#deceased-content #Date')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.birthDate = getRandomDate(5, 200)
        await page
          .getByPlaceholder('dd')
          .fill(declaration.deceased.birthDate.dd)
        await page
          .getByPlaceholder('mm')
          .fill(declaration.deceased.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.deceased.birthDate.yyyy)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's birthday
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
      })

      test("8.2.2.4 Change deceased's ID type", async () => {
        await page
          .locator('#deceased-content #Type')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.identifier.type = 'Birth Registration Number'
        await page.locator('#deceasedIdType').click()
        await page
          .getByText(declaration.deceased.identifier.type, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's ID type
         */
        await expect(page.locator('#deceased-content #Type')).toContainText(
          declaration.deceased.identifier.type
        )
      })
      test("8.2.2.5 Change deceased's ID", async () => {
        await page.locator('#deceased-content #ID').getByText('Change').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.deceased.identifier.id = faker.random.numeric(10)
        await page
          .locator('#deceasedBirthRegistrationNumber')
          .fill(declaration.deceased.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's ID
         */
        await expect(page.locator('#deceased-content #ID')).toContainText(
          declaration.deceased.identifier.id
        )
      })

      test("8.2.2.6 Change deceased's address", async () => {
        await page
          .locator('#deceased-content #Usual')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.deceased.address.Province = 'Central'
        declaration.deceased.address.District = 'Itambo'
        await page.locator('#statePrimaryDeceased').click()
        await page
          .getByText(declaration.deceased.address.Province, { exact: true })
          .click()
        await page.locator('#districtPrimaryDeceased').click()
        await page
          .getByText(declaration.deceased.address.District, { exact: true })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change deceased's address
         */
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.District
        )
        await expect(page.locator('#deceased-content #Usual')).toContainText(
          declaration.deceased.address.Province
        )
      })

      test.skip('8.2.2.7 Change informant type', async () => {
        await page
          .locator('#informant-content #Informant')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informantType = 'Father'
        await page.waitForTimeout(500)
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
          page.locator('#informant-content #Informant')
        ).toContainText(declaration.informantType)
      })

      test('8.2.2.8 Change registration email', async () => {
        await page
          .locator('#informant-content #Email')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.informantEmail = faker.internet.email()
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

      test("8.2.2.9 Change spouse's name", async () => {
        await page.locator('#spouse-content #Full').getByText('Change').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.name.firstNames = faker.name.firstName('female')
        declaration.spouse.name.familyName = faker.name.lastName('female')
        await page
          .locator('#firstNamesEng')
          .fill(declaration.spouse.name.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(declaration.spouse.name.familyName)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's name
         */
        await expect(page.locator('#spouse-content #Full')).toContainText(
          declaration.spouse.name.firstNames
        )
      })
      test("8.2.2.10 Change spouse's birthday", async () => {
        await page.locator('#spouse-content #Date').getByText('Change').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.birthDate = getRandomDate(19, 200)
        await page.getByPlaceholder('dd').fill(declaration.spouse.birthDate.dd)
        await page.getByPlaceholder('mm').fill(declaration.spouse.birthDate.mm)
        await page
          .getByPlaceholder('yyyy')
          .fill(declaration.spouse.birthDate.yyyy)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's birthday
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
      })
      test("8.2.2.11 Change spouse's nationality", async () => {
        await page
          .locator('#spouse-content #Nationality')
          .getByText('Change')
          .click()
        await page.getByRole('button', { name: 'Continue' }).click()

        declaration.spouse.nationality = 'Japan'
        await page.locator('#nationality').click()
        await page
          .getByText(declaration.spouse.nationality, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's nationality
         */
        await expect(
          page.locator('#spouse-content #Nationality')
        ).toContainText(declaration.spouse.nationality)
      })
      test("8.2.2.12 Change spouse's ID type", async () => {
        await page.locator('#spouse-content #Type').getByText('Change').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.identifier.type = 'Birth Registration Number'
        await page.locator('#spouseIdType').click()
        await page
          .getByText(declaration.spouse.identifier.type, {
            exact: true
          })
          .click()
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's ID type
         */
        await expect(page.locator('#spouse-content #Type')).toContainText(
          declaration.spouse.identifier.type
        )
      })
      test("8.2.2.13 Change spouse's ID", async () => {
        await page.locator('#spouse-content #ID').getByText('Change').click()
        await page.getByRole('button', { name: 'Continue' }).click()
        declaration.spouse.identifier.id = faker.random.numeric(10)
        await page
          .locator('#spouseBirthRegistrationNumber')
          .fill(declaration.spouse.identifier.id)
        await page.getByRole('button', { name: 'Back to review' }).click()
        /*
         * Expected result: should change spouse's ID
         */
        await expect(page.locator('#spouse-content #ID')).toContainText(
          declaration.spouse.identifier.id
        )
      })
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
      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

      /*
       * Expected result: The declaration should be in sent for approval
       */
      await expect(
        page.getByRole('button', {
          name: `${declaration.deceased.name.firstNames} ${declaration.deceased.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('8.3 Local registrar actions', async () => {
    test('8.3.1 Navigate to the declaration preview page', async () => {
      await login(page, 'k.mweene', 'test')
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
    test('8.3.1.1 Verify informations added in previous pages', async () => {
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
       * - Deceased's address
       * - Change button
       */
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.Country
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.District
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
        declaration.deceased.address.Province
      )
      await expect(page.locator('#deceased-content #Usual')).toContainText(
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
      await expect(page.locator('#spouse-content #Usual')).toContainText('Yes')
    })

    test.describe('8.3.2 Click any "Change" link', async () => {
      test.skip('Skipped for now', async () => {})
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
      await expect(page.getByText('Register the death?')).toBeVisible()
    })

    test('8.3.7 Confirm the declaration to ready for print', async () => {
      await page.locator('#submit_confirm').click()
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to registration home
       */
      expect(page.url().includes('registration-home')).toBeTruthy()

      await page.getByRole('button', { name: 'Ready to print' }).click()
      await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
        timeout: 1000 * 30
      })

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
})
