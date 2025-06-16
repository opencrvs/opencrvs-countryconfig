import { test, expect, type Page } from '@playwright/test'
import {
  assignRecord,
  continueForm,
  createPIN,
  drawSignature,
  expectOutboxToBeEmpty,
  expectTextWithChangeLink,
  formatDateObjectTo_ddMMMMyyyy,
  getAction,
  getRandomDate,
  goToSection,
  login
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'

test.describe.serial('1. Marriage declaration case - 1', () => {
  let page: Page
  const declaration = {
    informantType: 'Groom',
    informantEmail: faker.internet.email(),
    groom: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(20, 200),
      nationality: 'Farajaland',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      lastNameAtBirth: faker.person.lastName('male'),
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
      }
    },
    bride: {
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
      lastNameAtBirth: faker.person.lastName('female'),

      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },

    event: {
      date: getRandomDate(0, 2),
      typeOfMarriage: 'Monogamous',
      address: {
        country: 'Farajaland',
        province: 'Central',
        district: 'Ibombo',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    },

    witness1: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      relationshipToSpouses: "Head of groom's family"
    },

    witness2: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      relationshipToSpouses: "Head of groom's family"
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
      await login(
        page,
        CREDENTIALS.FIELD_AGENT.USERNAME,
        CREDENTIALS.FIELD_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.click('#header_new_event')
      await page.getByLabel('Marriage').click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('1.1.1 Fill informant details', async () => {
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with child

      await page.locator('#registrationEmail').fill(declaration.informantEmail)

      await continueForm(page)
    })

    test('1.1.2 Fill groom details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.groom.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.groom.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.groom.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.groom.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.groom.birthDate.yyyy)

      await page.locator('#groomIdType').click()
      await page
        .getByText(declaration.groom.identifier.type, { exact: true })
        .click()

      await page
        .locator('#groomNationalId')
        .fill(declaration.groom.identifier.id)

      await page
        .locator('#marriedLastNameEng')
        .fill(declaration.groom.lastNameAtBirth)

      await page.locator('#statePrimaryGroom').click()
      await page
        .getByText(declaration.groom.address.province, { exact: true })
        .click()

      await page.locator('#districtPrimaryGroom').click()
      await page
        .getByText(declaration.groom.address.district, { exact: true })
        .click()

      await page.getByLabel(declaration.groom.address.urbanOrRural).check()

      await page
        .locator('#cityPrimaryGroom')
        .fill(declaration.groom.address.town)

      await page
        .locator('#addressLine1UrbanOptionPrimaryGroom')
        .fill(declaration.groom.address.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPrimaryGroom')
        .fill(declaration.groom.address.street)

      await page
        .locator('#addressLine3UrbanOptionPrimaryGroom')
        .fill(declaration.groom.address.number)

      await page
        .locator('#postalCodePrimaryGroom')
        .fill(declaration.groom.address.postcodeOrZip)

      await continueForm(page)
    })

    test('1.1.3 Fill bride details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.bride.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.bride.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.bride.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.bride.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.bride.birthDate.yyyy)

      await page.locator('#brideIdType').click()
      await page
        .getByText(declaration.bride.identifier.type, { exact: true })
        .click()

      await page
        .locator('#brideNationalId')
        .fill(declaration.bride.identifier.id)

      await page
        .locator('#marriedLastNameEng')
        .fill(declaration.bride.lastNameAtBirth)

      await page.getByLabel(declaration.bride.address.urbanOrRural).check()

      await page
        .locator('#cityPrimaryBride')
        .fill(declaration.bride.address.town)

      await page
        .locator('#addressLine1UrbanOptionPrimaryBride')
        .fill(declaration.bride.address.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPrimaryBride')
        .fill(declaration.bride.address.street)

      await page
        .locator('#addressLine3UrbanOptionPrimaryBride')
        .fill(declaration.bride.address.number)

      await page
        .locator('#postalCodePrimaryBride')
        .fill(declaration.bride.address.postcodeOrZip)

      await continueForm(page)
    })

    test('1.1.4 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.event.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.event.date.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.event.date.yyyy)

      await page.locator('#typeOfMarriage').click()
      await page
        .getByText(declaration.event.typeOfMarriage, { exact: true })
        .click()

      await page.getByLabel(declaration.event.address.urbanOrRural).check()

      await page
        .locator('#cityPlaceofmarriage')
        .fill(declaration.event.address.town)

      await page
        .locator('#addressLine1UrbanOptionPlaceofmarriage')
        .fill(declaration.event.address.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPlaceofmarriage')
        .fill(declaration.event.address.street)

      await page
        .locator('#addressLine3UrbanOptionPlaceofmarriage')
        .fill(declaration.event.address.number)

      await page
        .locator('#postalCodePlaceofmarriage')
        .fill(declaration.event.address.postcodeOrZip)

      await continueForm(page)
    })

    test('1.1.5 Fill witness1 details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.witness1.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.witness1.name.familyName)

      await page.locator('#relationship').click()
      await page
        .getByText(declaration.witness1.relationshipToSpouses, { exact: true })
        .click()

      await continueForm(page)
    })

    test('1.1.6 Fill witness2 details', async () => {
      await page
        .locator('#firstNamesEng')
        .fill(declaration.witness2.name.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(declaration.witness2.name.familyName)

      await page.locator('#relationship').click()
      await page
        .getByText(declaration.witness2.relationshipToSpouses, { exact: true })
        .click()

      await continueForm(page)
    })

    test('1.1.7 Go to preview', async () => {
      await goToSection(page, 'preview')
    })

    test('1.1.8 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Informant'),
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
       * - Groom's Fullname
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Full'), [
        declaration.groom.name.firstNames,
        declaration.groom.name.familyName
      ])

      /*
       * Expected result: should include
       * - Groom's date of birth
       * - Change button
       */

      await expectTextWithChangeLink(page.locator('#groom-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.groom.birthDate)
      ])

      /*
       * Expected result: should include
       * - Groom's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#groom-content #Nationality'),
        [declaration.groom.nationality]
      )

      /*
       * Expected result: should include
       * - Groom's Type of ID
       * - Groom's ID Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Type'), [
        declaration.groom.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#groom-content #ID'), [
        declaration.groom.identifier.id
      ])

      /*
       * Expected result: should include
       * - Groom's Lastname At Birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Last'), [
        declaration.groom.lastNameAtBirth
      ])

      /*
       * Expected result: should include
       * - groom's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Usual'), [
        declaration.groom.address.country,
        declaration.groom.address.district,
        declaration.groom.address.province,
        declaration.groom.address.town,
        declaration.groom.address.residentialArea,
        declaration.groom.address.street,
        declaration.groom.address.number,
        declaration.groom.address.postcodeOrZip
      ])

      /*
       * Expected result: should include
       * - Bride's Fullname
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Full'), [
        declaration.bride.name.firstNames,
        declaration.bride.name.familyName
      ])

      /*
       * Expected result: should include
       * - Bride's date of birth
       * - Change button
       */

      await expectTextWithChangeLink(page.locator('#bride-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.bride.birthDate)
      ])

      /*
       * Expected result: should include
       * - Bride's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#bride-content #Nationality'),
        [declaration.bride.nationality]
      )

      /*
       * Expected result: should include
       * - Bride's Type of ID
       * - Bride's ID Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Type'), [
        declaration.bride.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#bride-content #ID'), [
        declaration.bride.identifier.id
      ])

      /*
       * Expected result: should include
       * - Bride's Lastname At Birth
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Last'), [
        declaration.bride.lastNameAtBirth
      ])

      /*
       * Expected result: should include
       * - bride's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Usual'), [
        declaration.bride.address.country,
        declaration.bride.address.district,
        declaration.bride.address.province,
        declaration.bride.address.town,
        declaration.bride.address.residentialArea,
        declaration.bride.address.street,
        declaration.bride.address.number,
        declaration.bride.address.postcodeOrZip
      ])

      /*
       * Expected result: should include
       * - Date of Marriage
       * - Change button
       */

      await expectTextWithChangeLink(
        page.locator('#marriageEvent-content #Date'),
        [formatDateObjectTo_ddMMMMyyyy(declaration.event.date)]
      )

      /*
       * Expected result: should include
       * - Type of Marriage
       * - Change button
       */

      await expectTextWithChangeLink(
        page.locator('#marriageEvent-content #Type'),
        [declaration.event.typeOfMarriage]
      )

      /*
       * Expected result: should include
       * - Place of Marriage
       * - Change button
       */

      await expectTextWithChangeLink(
        page.locator('#marriageEvent-content #Place'),
        [
          declaration.event.address.country,
          declaration.event.address.district,
          declaration.event.address.province,
          declaration.event.address.town,
          declaration.event.address.residentialArea,
          declaration.event.address.street,
          declaration.event.address.number,
          declaration.event.address.postcodeOrZip
        ]
      )

      /*
       * Expected result: should include
       * - Witness1 Name
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#witnessOne-content #Witness'),
        [
          declaration.witness1.name.firstNames,
          declaration.witness1.name.familyName
        ]
      )

      /*
       * Expected result: should include
       * - Witness1 Relationship to spouse
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#witnessOne-content #Relationship'),
        [declaration.witness1.relationshipToSpouses]
      )

      /*
       * Expected result: should include
       * - Witness2 Name
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#witnessTwo-content #Witness'),
        [
          declaration.witness2.name.firstNames,
          declaration.witness2.name.familyName
        ]
      )

      /*
       * Expected result: should include
       * - Witness2 Relationship to spouse
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#witnessTwo-content #Relationship'),
        [declaration.witness2.relationshipToSpouses]
      )
    })

    test('1.1.9 Fill up bride signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).nth(0).click()
      await drawSignature(page, 'brideSignature_modal')
      await page
        .locator('#brideSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('1.1.10 Fill up groom signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).nth(0).click()
      await drawSignature(page, 'groomSignature_modal')
      await page
        .locator('#groomSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('1.1.11 Fill up witnessOne signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).nth(0).click()
      await drawSignature(page, 'witnessOneSignature_modal')
      await page
        .locator('#witnessOneSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('1.1.12 Fill up witnessTwo signature', async () => {
      await page.getByRole('button', { name: 'Sign' }).nth(0).click()
      await drawSignature(page, 'witnessTwoSignature_modal')
      await page
        .locator('#witnessTwoSignature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('1.1.13 Send for review', async () => {
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
          name: `${declaration.groom.name.firstNames} ${declaration.groom.name.familyName} & ${declaration.bride.name.firstNames} ${declaration.bride.name.familyName}`
        })
      ).toBeVisible()
    })
  })

  test.describe('1.2 Declaration Review by RA', async () => {
    test('1.2.1 Navigate to the declaration review page', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)
      await page.getByRole('button', { name: 'Ready for review' }).click()
      await page
        .getByRole('button', {
          name: `${declaration.groom.name.firstNames} ${declaration.groom.name.familyName} & ${declaration.bride.name.firstNames} ${declaration.bride.name.familyName}`
        })
        .click()
      await assignRecord(page)
      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Review declaration').click()
    })

    test('1.2.2 Verify information on review page', async () => {
      /*
       * Expected result: should include
       * - Informant's type
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#informant-content #Informant'),
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
       * - Groom's First Name
       * - Groom's Family Name
       * - Change button
       */
      await expect(page.locator('#groom-content #Full')).toContainText(
        declaration.groom.name.firstNames
      )
      await expectTextWithChangeLink(page.locator('#groom-content #Full'), [
        declaration.groom.name.familyName
      ])

      /*
       * Expected result: should include
       * - Groom's birth date
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.groom.birthDate)
      ])

      /*
       * Expected result: should include
       * - Groom's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#groom-content #Nationality'),
        [declaration.groom.nationality]
      )

      /*
       * Expected result: should include
       * - Groom's Type of Id
       * - Groom's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Type'), [
        declaration.groom.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#groom-content #ID'), [
        declaration.groom.identifier.id
      ])
      /*
       * Expected result: should include
       * - Groom's Last Name at Birth
       * - Change button
       */
      await expect(page.locator('#groom-content #Last')).toContainText(
        declaration.groom.lastNameAtBirth
      )

      /*
       * Expected result: should include
       * - Groom's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#groom-content #Usual'), [
        declaration.groom.address.country,
        declaration.groom.address.district,
        declaration.groom.address.province,
        declaration.groom.address.town,
        declaration.groom.address.residentialArea,
        declaration.groom.address.street,
        declaration.groom.address.number,
        declaration.groom.address.postcodeOrZip
      ])

      /*
       * Expected result: should include
       * - Bride's First Name
       * - Bride's Family Name
       * - Change button
       */
      await expect(page.locator('#bride-content #Full')).toContainText(
        declaration.bride.name.firstNames
      )
      await expectTextWithChangeLink(page.locator('#bride-content #Full'), [
        declaration.bride.name.familyName
      ])

      /*
       * Expected result: should include
       * - Bride's birth date
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Date'), [
        formatDateObjectTo_ddMMMMyyyy(declaration.bride.birthDate)
      ])

      /*
       * Expected result: should include
       * - Bride's Nationality
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#bride-content #Nationality'),
        [declaration.bride.nationality]
      )

      /*
       * Expected result: should include
       * - Bride's Type of Id
       * - Bride's Id Number
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Type'), [
        declaration.bride.identifier.type
      ])
      await expectTextWithChangeLink(page.locator('#bride-content #ID'), [
        declaration.bride.identifier.id
      ])
      /*
       * Expected result: should include
       * - Bride's Last Name at Birth
       * - Change button
       */
      await expect(page.locator('#bride-content #Last')).toContainText(
        declaration.bride.lastNameAtBirth
      )

      /*
       * Expected result: should include
       * - Bride's address
       * - Change button
       */
      await expectTextWithChangeLink(page.locator('#bride-content #Usual'), [
        declaration.bride.address.country,
        declaration.bride.address.district,
        declaration.bride.address.province,
        declaration.bride.address.town,
        declaration.bride.address.residentialArea,
        declaration.bride.address.street,
        declaration.bride.address.number,
        declaration.bride.address.postcodeOrZip
      ])

      /*
       * Expected result: should include
       * - Date of marriage
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#marriageEvent-content #Date'),
        [formatDateObjectTo_ddMMMMyyyy(declaration.event.date)]
      )

      /*
       * Expected result: should include
       * - Type of marriage
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#marriageEvent-content #Type'),
        [declaration.event.typeOfMarriage]
      )

      /*
       * Expected result: should include
       * - Place of marriage
       * - Change button
       */
      await expectTextWithChangeLink(
        page.locator('#marriageEvent-content #Place'),
        [
          declaration.event.address.country,
          declaration.event.address.province,
          declaration.event.address.district,
          declaration.event.address.town,
          declaration.event.address.residentialArea,
          declaration.event.address.street,
          declaration.event.address.number,
          declaration.event.address.postcodeOrZip
        ]
      )

      /*
       * Expected result: should include
       * - WitnessOne's First Name
       * - WitnessOne's Family Name
       * - Change button
       */
      await expect(page.locator('#witnessOne-content #Witness')).toContainText(
        declaration.witness1.name.firstNames
      )
      await expectTextWithChangeLink(
        page.locator('#witnessOne-content #Witness'),
        [declaration.witness1.name.familyName]
      )

      /*
       * Expected result: should include
       * - WitnessOne's relationship
       * - Change button
       */

      await expect(
        page.locator('#witnessOne-content #Relationship')
      ).toContainText(declaration.witness1.relationshipToSpouses)

      /*
       * Expected result: should include
       * - WitnessTwo's First Name
       * - WitnessTwo's Family Name
       * - Change button
       */
      await expect(page.locator('#witnessTwo-content #Witness')).toContainText(
        declaration.witness2.name.firstNames
      )
      await expectTextWithChangeLink(
        page.locator('#witnessTwo-content #Witness'),
        [declaration.witness2.name.familyName]
      )

      /*
       * Expected result: should include
       * - WitnessTwo's relationship
       * - Change button
       */

      await expect(
        page.locator('#witnessTwo-content #Relationship')
      ).toContainText(declaration.witness2.relationshipToSpouses)
    })
  })
})
