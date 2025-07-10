import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatDateObjectTo_dMMMMyyyy,
  getRandomDate,
  loginToV2,
  uploadImageToSection
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureOutboxIsEmpty, selectAction } from '../../../v2-utils'

test.describe.serial('2. Death declaration case - 2', () => {
  let page: Page
  async function expectRowValueWithChangeButton(
    fieldName: string,
    assertionText: string
  ) {
    await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
      assertionText
    )

    await expect(page.getByTestId(`change-button-${fieldName}`)).toBeVisible()
  }
  const declaration = {
    deceased: {
      name: {
        firstname: faker.person.firstName('female'),
        surname: faker.person.lastName('female')
      },
      gender: 'Female',
      age: 65,
      nationality: 'Guernsey',
      idType: 'Passport',
      passport: faker.string.numeric(10),
      maritalStatus: 'Married',
      address: {
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Zobwe',
        urbanOrRural: 'Rural',
        village: faker.location.county()
      }
    },
    eventDetails: {
      mannerOfDeath: 'Accident',
      date: getRandomDate(0, 20),
      causeOfDeathEstablished: true,
      sourceCauseDeath: 'Lay reported',
      description: "T'was an accident sire",
      placeOfDeath: "Deceased's usual place of residence"
    },
    informant: {
      relation: 'Son',
      email: faker.internet.email(),
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      dob: getRandomDate(50, 200),
      nationality: 'Farajaland',
      idType: 'National ID',
      nid: faker.string.numeric(10),
      addressSameAs: true
    },
    spouse: {
      name: {
        firstname: faker.person.firstName('male'),
        surname: faker.person.lastName('male')
      },
      age: 68,
      nationality: 'Canada',
      idType: 'Passport',
      passport: faker.string.numeric(10),
      addressSameAs: false,
      address: {
        country: 'Farajaland',
        province: 'Chuminga',
        district: 'Nsali',
        urbanOrRural: 'Urban',
        town: faker.location.city(),
        residentialArea: faker.location.county(),
        street: faker.location.street(),
        number: faker.location.buildingNumber(),
        postcodeOrZip: faker.location.zipCode()
      }
    }
  }
  const annotation = {
    review: {
      comment: "He was a great person, we'll miss him"
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

      await page.click('#header-new-event')
      await page.getByLabel('Death').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test('2.1.1 Fill deceased details', async () => {
      await page.locator('#firstname').fill(declaration.deceased.name.firstname)
      await page.locator('#surname').fill(declaration.deceased.name.surname)
      await page.locator('#deceased____gender').click()
      await page.getByText(declaration.deceased.gender, { exact: true }).click()

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#deceased____age')
        .fill(declaration.deceased.age.toString())

      await page.locator('#deceased____nationality').click()
      await page
        .getByText(declaration.deceased.nationality, { exact: true })
        .click()

      await page.locator('#deceased____idType').click()
      await page.getByText(declaration.deceased.idType, { exact: true }).click()

      await page
        .locator('#deceased____passport')
        .fill(declaration.deceased.passport)

      await page.locator('#deceased____maritalStatus').click()
      await page
        .getByText(declaration.deceased.maritalStatus, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.deceased.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.deceased.address.district, { exact: true })
        .click()
      await page.locator('#urbanOrRural_RURAL').click()
      await page.locator('#village').fill(declaration.deceased.address.village)
      await continueForm(page)
    })

    test('2.1.2 Fill event details', async () => {
      await page.getByPlaceholder('dd').fill(declaration.eventDetails.date.dd)
      await page.getByPlaceholder('mm').fill(declaration.eventDetails.date.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.eventDetails.date.yyyy)

      await page.getByLabel('Cause of death has been established').check()

      await page.locator('#eventDetails____sourceCauseDeath').click()
      await page
        .getByText(declaration.eventDetails.sourceCauseDeath, { exact: true })
        .click()

      await page.locator('#eventDetails____mannerOfDeath').click()
      await page
        .getByText(declaration.eventDetails.mannerOfDeath, { exact: true })
        .click()

      await page
        .locator('#eventDetails____description')
        .fill(declaration.eventDetails.description)

      await page.locator('#eventDetails____placeOfDeath').click()
      await page
        .getByText(declaration.eventDetails.placeOfDeath, { exact: true })
        .click()

      await continueForm(page)
    })

    test('2.1.3 Fill informant details', async () => {
      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informant.relation, {
          exact: true
        })
        .click()

      await page.waitForTimeout(500) // Temporary measurement untill the bug is fixed. BUG: rerenders after selecting relation with deceased

      await page
        .locator('#firstname')
        .fill(declaration.informant.name.firstname)
      await page.locator('#surname').fill(declaration.informant.name.surname)

      await page.getByPlaceholder('dd').fill(declaration.informant.dob.dd)
      await page.getByPlaceholder('mm').fill(declaration.informant.dob.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.informant.dob.yyyy)

      await page.locator('#informant____idType').click()
      await page
        .getByText(declaration.informant.idType, { exact: true })
        .click()

      await page.locator('#informant____nid').fill(declaration.informant.nid)

      await page
        .locator('#informant____email')
        .fill(declaration.informant.email)

      await continueForm(page)
    })

    test('2.1.4 Fill spouse details', async () => {
      await page.locator('#firstname').fill(declaration.spouse.name.firstname)
      await page.locator('#surname').fill(declaration.spouse.name.surname)

      await page.getByLabel('Exact date of birth unknown').check()

      await page
        .locator('#spouse____age')
        .fill(declaration.spouse.age.toString())

      await page.locator('#spouse____nationality').click()
      await page
        .getByText(declaration.spouse.nationality, { exact: true })
        .click()

      await page.locator('#spouse____idType').click()
      await page.getByText(declaration.spouse.idType, { exact: true }).click()

      await page
        .locator('#spouse____passport')
        .fill(declaration.spouse.passport)

      await page.locator('#spouse____addressSameAs_NO').check()

      await page.locator('#province').click()
      await page
        .getByText(declaration.spouse.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.spouse.address.district, { exact: true })
        .click()
      await page.locator('#town').fill(declaration.spouse.address.town)
      await page
        .locator('#residentialArea')
        .fill(declaration.spouse.address.residentialArea)
      await page.locator('#street').fill(declaration.spouse.address.street)
      await page.locator('#number').fill(declaration.spouse.address.number)
      await page
        .locator('#zipCode')
        .fill(declaration.spouse.address.postcodeOrZip)

      await continueForm(page)
    })

    test.describe('2.1.5 Upload supporting document', async () => {
      test('2.1.5.1 Upload proof for deceased', async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfDeceased'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfDeceased"]'
            )
          })
        }
      })

      test('2.1.5.2 Upload proof for informant', async () => {
        const imageUploadSectionTitles = [
          'National ID',
          'Passport',
          'Birth Certificate',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfInformant'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfInformant"]'
            )
          })
        }
      })

      test('2.1.5.3 Upload proof of death', async () => {
        const imageUploadSectionTitles = [
          'Attested letter of death',
          'Police certificate of death',
          'Hospital certificate of death',
          "Coroner's report",
          'Certified copy of burial receipt',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfDeath'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfDeath"]'
            )
          })
        }
      })

      test('2.1.5.4 Upload proof of cause of death', async () => {
        const imageUploadSectionTitles = [
          'Medically Certified Cause of Death',
          'Verbal autopsy report',
          'Other'
        ]

        for (const sectionTitle of imageUploadSectionTitles) {
          await uploadImageToSection({
            page,
            sectionLocator: page.locator('#documents____proofOfCauseOfDeath'),
            sectionTitle,
            buttonLocator: page.locator(
              'button[name="documents____proofOfCauseOfDeath"]'
            )
          })
        }
        await continueForm(page)
      })
    })

    test('2.1.6 Verify information on preview page', async () => {
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.gender',
        declaration.deceased.gender
      )

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.age',
        declaration.deceased.age.toString()
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.nationality',
        declaration.deceased.nationality
      )

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.idType',
        declaration.deceased.idType
      )
      await expectRowValueWithChangeButton(
        'deceased.passport',
        declaration.deceased.passport
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district +
          declaration.deceased.address.village
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.causeOfDeathEstablished',
        'Yes'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.sourceCauseDeath',
        declaration.eventDetails.sourceCauseDeath
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.description',
        declaration.eventDetails.description
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.placeOfDeath',
        declaration.eventDetails.placeOfDeath
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.informant.dob)
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValueWithChangeButton(
        'informant.nid',
        declaration.informant.nid
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValueWithChangeButton('informant.addressSameAs', 'Yes')

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.email',
        declaration.informant.email
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.name',
        declaration.spouse.name.firstname +
          ' ' +
          declaration.spouse.name.surname
      )

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.age',
        declaration.spouse.age.toString()
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.nationality',
        declaration.spouse.nationality
      )
      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.idType',
        declaration.spouse.idType
      )
      await expectRowValueWithChangeButton(
        'spouse.passport',
        declaration.spouse.passport
      )

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.province +
          declaration.spouse.address.district +
          declaration.spouse.address.town +
          declaration.spouse.address.residentialArea +
          declaration.spouse.address.street +
          declaration.spouse.address.number +
          declaration.spouse.address.postcodeOrZip
      )
    })

    test('2.1.7 Fill up informant signature', async () => {
      await page.locator('#review____comment').fill(annotation.review.comment)
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('2.1.8 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()
      await ensureOutboxIsEmpty(page)
      await expect(page.getByText('Farajaland CRS')).toBeVisible()

      /*
       * Expected result: should redirect to assigned to you workqueue
       */
      expect(page.url().includes('assigned-to-you')).toBeTruthy()

      await page.getByText('Sent for review').click()

      /*
       * Expected result: The declaration should be in sent for review
       */
      await expect(
        page.getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
      ).toBeVisible()
    })
  })
  test.describe('2.2 Declaration Review by RA', async () => {
    test('2.2.1 Navigate to the declaration review page', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

      await ensureOutboxIsEmpty(page)
      await page.getByText('Ready for review').click()

      await page
        .getByRole('button', {
          name:
            declaration.deceased.name.firstname +
            ' ' +
            declaration.deceased.name.surname
        })
        .click()
    })

    test('2.2.2 Verify information on review page', async () => {
      await selectAction(page, 'Validate')
      /*
       * Expected result: should include
       * - Deceased's First Name
       * - Deceased's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.name',
        declaration.deceased.name.firstname +
          ' ' +
          declaration.deceased.name.surname
      )

      /*
       * Expected result: should include
       * - Deceased's Gender
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.gender',
        declaration.deceased.gender
      )

      /*
       * Expected result: should include
       * - Deceased's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.age',
        declaration.deceased.age.toString()
      )

      /*
       * Expected result: should include
       * - Deceased's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.nationality',
        declaration.deceased.nationality
      )

      /*
       * Expected result: should include
       * - Deceased's Type of Id
       * - Deceased's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.idType',
        declaration.deceased.idType
      )
      await expectRowValueWithChangeButton(
        'deceased.passport',
        declaration.deceased.passport
      )

      /*
       * Expected result: should include
       * - Deceased's marital status
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.maritalStatus',
        declaration.deceased.maritalStatus
      )

      /*
       * Expected result: should include
       * - Deceased's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'deceased.address',
        declaration.deceased.address.country +
          declaration.deceased.address.province +
          declaration.deceased.address.district +
          declaration.deceased.address.village
      )

      /*
       * Expected result: should include
       * - Date of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.date',
        formatDateObjectTo_dMMMMyyyy(declaration.eventDetails.date)
      )

      /*
       * Expected result: should include
       * - Manner of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.mannerOfDeath',
        declaration.eventDetails.mannerOfDeath
      )

      /*
       * Expected result: should include
       * - Cause of death has been established
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.causeOfDeathEstablished',
        'Yes'
      )

      /*
       * Expected result: should include
       * - Source cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.sourceCauseDeath',
        declaration.eventDetails.sourceCauseDeath
      )

      /*
       * Expected result: should include
       * - Description cause of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.description',
        declaration.eventDetails.description
      )

      /*
       * Expected result: should include
       * - Place of death
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'eventDetails.placeOfDeath',
        declaration.eventDetails.placeOfDeath
      )

      /*
       * Expected result: should include
       * - Informant type
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.relation',
        declaration.informant.relation
      )

      /*
       * Expected result: should include
       * - Informant's First Name
       * - Informant's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.name',
        declaration.informant.name.firstname +
          ' ' +
          declaration.informant.name.surname
      )

      /*
       * Expected result: should include
       * - informant's date of birth
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.dob',
        formatDateObjectTo_dMMMMyyyy(declaration.informant.dob)
      )

      /*
       * Expected result: should include
       * - informant's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.nationality',
        declaration.informant.nationality
      )

      /*
       * Expected result: should include
       * - informant's Type of Id
       * - informant's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.idType',
        declaration.informant.idType
      )
      await expectRowValueWithChangeButton(
        'informant.nid',
        declaration.informant.nid
      )

      /*
       * Expected result: should include
       * - informant's address
       * - Change button
       */
      await expectRowValueWithChangeButton('informant.addressSameAs', 'Yes')

      /*
       * Expected result: should include
       * - Informant's Email
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'informant.email',
        declaration.informant.email
      )

      /*
       * Expected result: should include
       * - Spouse's First Name
       * - Spouse's Family Name
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.name',
        declaration.spouse.name.firstname +
          ' ' +
          declaration.spouse.name.surname
      )

      /*
       * Expected result: should include
       * - Spouse's age
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.age',
        declaration.spouse.age.toString()
      )

      /*
       * Expected result: should include
       * - Spouse's Nationality
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.nationality',
        declaration.spouse.nationality
      )
      /*
       * Expected result: should include
       * - Spouse's Type of Id
       * - Spouse's Id Number
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.idType',
        declaration.spouse.idType
      )
      await expectRowValueWithChangeButton(
        'spouse.passport',
        declaration.spouse.passport
      )

      /*
       * Expected result: should include
       * - Spouse's address
       * - Change button
       */
      await expectRowValueWithChangeButton(
        'spouse.address',
        declaration.spouse.address.country +
          declaration.spouse.address.province +
          declaration.spouse.address.district +
          declaration.spouse.address.town +
          declaration.spouse.address.residentialArea +
          declaration.spouse.address.street +
          declaration.spouse.address.number +
          declaration.spouse.address.postcodeOrZip
      )
    })
  })
})
