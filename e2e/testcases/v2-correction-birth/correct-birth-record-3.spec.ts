import { expect, test, type Page } from '@playwright/test'
import {
  assignRecord,
  auditRecord,
  createPIN,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatName,
  getAction,
  getToken,
  goBackToReview,
  joinValuesWith,
  login
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { BirthDeclaration, BirthInputDetails } from '../birth/types'
import { CREDENTIALS } from '../../constants'
import { random } from 'lodash'
import {
  createDeclaration as createDeclarationV2,
  Declaration as DeclarationV2
} from '../v2-test-data/birth-declaration'
import { format, subYears, differenceInYears, parseISO } from 'date-fns'
import { formatV2ChildName } from '../v2-birth/helpers'

test.describe.serial(' Correct record - 3', () => {
  let declaration: DeclarationV2
  let trackingId: string | undefined
  let registrationNumber: string | undefined
  let eventId: string

  let page: Page

  const updatedMotherDetails = {
    firstNames: faker.person.firstName('female'),
    familyName: faker.person.lastName('female'),
    age: random(20, 45),
    email: faker.internet.email(),
    nationality: 'Nauru',
    id: faker.string.numeric(10),
    idType: 'National ID',
    nid: '1911901024',
    address: {
      province: 'Sulaka',
      district: 'Irundu',
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      zipCode: faker.location.zipCode()
    },
    maritalStatus: 'Married',
    educationLevel: 'Primary'
  }
  const updatedChildDetails = {
    placeOfBirth: 'Other',
    birthLocation: {
      province: 'Pualula',
      district: 'Ienge',
      town: faker.location.city(),
      residentialArea: faker.location.county(),
      street: faker.location.street(),
      number: faker.location.buildingNumber(),
      zipCode: faker.location.zipCode()
    }
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('3.0 Shortcut declaration', async () => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    const res = await createDeclarationV2(
      token,
      {
        'child.name': {
          firstname: faker.person.firstName(),
          surname: faker.person.lastName()
        },
        'informant.relation': 'BROTHER',
        'mother.name': {
          firstname: faker.person.firstName('female'),
          surname: faker.person.lastName('female')
        },
        'mother.dob': format(subYears(new Date(), 30), 'yyyy-MM-dd'),
        'mother.nid': faker.string.numeric(10),
        'mother.maritalStatus': 'SINGLE',
        'mother.educationLevel': 'NONE',
        'mother.address': {
          country: 'FAR',
          addressType: 'DOMESTIC',
          province: '73242958-c819-4404-b7fe-b594984c947c',
          district: '8ba7ff99-713d-462d-a590-7b8d4c874225',
          urbanOrRural: 'URBAN'
        },
        'father.name': {
          firstname: faker.person.firstName('female'),
          surname: faker.person.lastName('female')
        },
        'father.dob': format(subYears(new Date(), 30), 'yyyy-MM-dd'),
        'father.nid': faker.string.numeric(10),
        'father.maritalStatus': 'SINGLE',
        'father.educationLevel': 'NONE',
        'father.address': {
          country: 'FAR',
          addressType: 'DOMESTIC',
          province: '73242958-c819-4404-b7fe-b594984c947c',
          district: '8ba7ff99-713d-462d-a590-7b8d4c874225',
          urbanOrRural: 'URBAN'
        },
        'child.placeOfBirth': 'HEALTH_FACILITY',
        'child.birthLocation': 'e34f79ff-9287-41ff-ab3e-da562a207d69'
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )

    console.log(res.declaration)
    declaration = res.declaration
    trackingId = res.trackingId
    registrationNumber = res.registrationNumber
    eventId = res.eventId

    expect(trackingId).toBeDefined()
    expect(declaration).toBeDefined()
  })

  test.describe('3.1 Print > Ready to issue', async () => {
    test('3.1.1 Print', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)

      await auditRecord({
        page,
        name: `${formatV2ChildName(declaration)}`,
        trackingId
      })
      await assignRecord(page)

      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Print certified copy').click()

      await page
        .locator('#certificateTemplateId-form-input > span')
        .first()
        .click()

      await page.getByLabel('Print in advance').check()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Yes, print certificate' }).click()
      await page.getByRole('button', { name: 'Print', exact: true }).click()
    })

    test('3.1.2 Ready to issue', async () => {
      await page.getByRole('button', { name: 'Ready to issue' }).click()

      /*
       * Expected result: should
       * - be navigated to ready to isssue tab
       * - include the declaration in this tab
       */
      expect(page.url().includes('registration-home/readyToIssue')).toBeTruthy()
      await page.getByRole('button', { name: 'Outbox' }).click()
      await expectOutboxToBeEmpty(page)
      await page.getByRole('button', { name: 'Ready to issue' }).click()
      await expect(
        page.getByText(`${formatV2ChildName(declaration)}`).first()
      ).toBeVisible()
    })

    test('3.1.3 Record audit', async () => {
      await auditRecord({
        page,
        name: `${formatV2ChildName(declaration)}`,
        trackingId
      })

      await assignRecord(page)
      await page
        .getByRole('button', { name: 'Action', exact: true })
        .first()
        .click()

      /*
       * Expected result: should show correct record button in action menu
       */
      await expect(getAction(page, 'Correct record')).toBeVisible()

      await getAction(page, 'Correct record').click()
    })
  })

  test('3.2 Correction requester: child', async () => {
    await page.getByLabel('Child').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('3.3 Verify identity', async () => {
    /*
     * Expected result: should Confirm
     * First Name
     * Last Name
     * Date of Birth
     */
    await expect(
      page.getByText(`First name(s): ${declaration['child.name'].firstname}`)
    ).toBeVisible()
    await expect(
      page.getByText(`Last name: ${declaration['child.name'].surname}`)
    ).toBeVisible()
    await expect(
      page.getByText(
        `Date of Birth:
        ${formatDateTo_ddMMMMyyyy(declaration['child.dob'])}
        `
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Verified' }).click()

    /*
     * Expected result: should navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('3.4 Make correction', async () => {
    test.describe('3.4.1 Make correction on mother details', async () => {
      test('3.4.1 Change name', async () => {
        await page
          .locator('[data-test-id="change-button-mother.name"]')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's family name
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#familyNameEng')).toBeTruthy()

        await page
          .locator('#firstNamesEng')
          .fill(updatedMotherDetails.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(updatedMotherDetails.familyName)

        await goBackToReview(page)

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous name with strikethrough
         * - show updated name
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        const oldData = await page
          .locator('[data-test-id="change-button-mother.name"]')
          .getByRole('deletion')
          .all()

        await expect(oldData[0]).toHaveText(
          declaration['mother.name'].firstname
        )
        await expect(oldData[1]).toHaveText(declaration['mother.name'].surname)

        await expect(
          page
            .locator('[data-test-id="change-button-mother.name"]')
            .getByText(updatedMotherDetails.firstNames)
        ).toBeVisible()
        await expect(
          page
            .locator('[data-test-id="change-button-mother.name"]')
            .getByText(updatedMotherDetails.familyName)
        ).toBeVisible()
      })

      test('3.4.2 Change age', async () => {
        await page
          .locator('[data-test-id="change-button-mother.age"]')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's age
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#mother____age')).toBeTruthy()

        await page.locator('#mother____dobUnknown').click()
        await page
          .locator('#mother____age')
          .fill(updatedMotherDetails.age.toString())

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous gender with strikethrough
         * - show updated gender
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('[data-test-id="row-value-mother.age"]')
            .getByRole('deletion')
        ).toHaveText('-')
        await expect(
          page
            .locator('[data-test-id="row-value-mother.age"]')
            .getByText(joinValuesWith([updatedMotherDetails.age, 'years'], ' '))
        ).toBeVisible()
      })

      test('3.4.3 Change nationality', async () => {
        await page
          .locator('[data-test-id="change-button-mother.nationality"]')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's nationality
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#nationality')).toBeTruthy()

        await page.locator('#nationality').click()
        await page.getByText(updatedMotherDetails.nationality).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous nationality with strikethrough
         * - show updated nationality
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('[data-test-id="change-button-mother.nationality"]')
            .getByRole('deletion')
        ).toHaveText('Farajaland')

        await expect(
          page
            .locator('[data-test-id="change-button-mother.nationality"]')
            .getByText(updatedMotherDetails.nationality)
        ).toBeVisible()
      })

      test('3.4.4 Change id type', async () => {
        await page
          .locator('[data-test-id="change-button-mother.idType"]')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's id type
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#motherIdType')).toBeTruthy()

        await page.locator('#motherIdType').click()
        await page.getByText(updatedMotherDetails.idType).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous id type with strikethrough
         * - show updated id type
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('[data-test-id="change-button-mother.idType"]')
            .getByRole('deletion')
        ).toHaveText('National ID')

        await expect(
          page
            .locator('[data-test-id="change-button-mother.idType"]')
            .getByText(updatedMotherDetails.idType)
        ).toBeVisible()
      })

      test('3.4.5 Change id', async () => {
        await page
          .locator('[data-test-id="change-button-mother.nid"]')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's id
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#mother____nid')).toBeTruthy()

        await page.locator('#mother____nid').fill(updatedMotherDetails.id)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous id with strikethrough
         * - show updated id
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('[data-test-id="change-button-mother.nid"]')
            .getByRole('deletion')
        ).toHaveText(declaration['mother.nid'])

        await expect(
          page
            .locator('[data-test-id="change-button-mother.nid"]')
            .getByText(updatedMotherDetails.nid)
        ).toBeVisible()
      })

      test('3.4.6 Change usual place of residence', async () => {
        await page
          .locator('[data-test-id="change-button-mother"] #Usual')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's Usual place of resiedence
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#countryPrimary')).toBeTruthy()

        await page.locator('#statePrimaryMother').click()
        await page.getByText(updatedMotherDetails.address.province).click()

        await page.locator('#districtPrimaryMother').click()
        await page.getByText(updatedMotherDetails.address.district).click()

        await page
          .locator('#cityPrimaryMother')
          .fill(updatedMotherDetails.address.town)

        await page
          .locator('#addressLine1UrbanOptionPrimaryMother')
          .fill(updatedMotherDetails.address.residentialArea)

        await page
          .locator('#addressLine2UrbanOptionPrimaryMother')
          .fill(updatedMotherDetails.address.street)

        await page
          .locator('#addressLine3UrbanOptionPrimaryMother')
          .fill(updatedMotherDetails.address.number)

        await page
          .locator('#postalCodePrimaryMother')
          .fill(updatedMotherDetails.address.zipCode)

        await goBackToReview(page)

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous Usual place of resiedence with strikethrough
         * - show updated Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expectAddress(
          page.locator('[data-test-id="change-button-mother"] #Usual'),
          {
            ...declaration['mother.address'],
            country: 'Farajaland',
            state: 'Central',
            district: 'Ibombo'
          },
          true
        )

        await expect(
          page
            .locator('[data-test-id="change-button-mother"] #Usual')
            .getByText('Farajaland')
        ).toBeVisible()
        await expectAddress(
          page.locator('[data-test-id="change-button-mother"] #Usual'),
          updatedMotherDetails.address
        )
      })

      test('3.4.7 Change marital status', async () => {
        await page
          .locator('[data-test-id="change-button-mother"] #Marital')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's marital status
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#maritalStatus')).toBeTruthy()

        await page.locator('#maritalStatus').click()
        await page.getByText(updatedMotherDetails.maritalStatus).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous marital status with strikethrough
         * - show updated marital status
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('[data-test-id="change-button-mother"] #Marital')
            .getByRole('deletion')
        ).toHaveText(declaration['mother.maritalStatus'], {
          ignoreCase: true
        })

        await expect(
          page
            .locator('[data-test-id="change-button-mother"] #Marital')
            .getByText(updatedMotherDetails.maritalStatus)
        ).toBeVisible()
      })

      test('3.4.8 Change level of education', async () => {
        await page
          .locator('[data-test-id="change-button-mother"] #Level')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's level of education
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother')).toBeTruthy()
        expect(page.url().includes('#educationalAttainment')).toBeTruthy()

        await page.locator('#educationalAttainment').click()
        await page.getByText(updatedMotherDetails.educationLevel).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous level of education with strikethrough
         * - show updated level of education
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page
            .locator('[data-test-id="change-button-mother"] #Level')
            .getByRole('deletion')
        ).toHaveText('No schooling')

        await expect(
          page
            .locator('[data-test-id="change-button-mother"] #Level')
            .getByText(updatedMotherDetails.educationLevel)
        ).toBeVisible()
      })
    })
    test('3.4.2 Change place of delivery', async () => {
      await page
        .locator('#child-content #Place')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on childType
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child')).toBeTruthy()
      expect(page.url().includes('#placeOfBirth')).toBeTruthy()

      await page.locator('#placeOfBirth').click()
      await page.getByText(updatedChildDetails.placeOfBirth).click()

      await page.locator('#statePlaceofbirth').click()
      await page.getByText(updatedChildDetails.birthLocation.province).click()

      await page.locator('#districtPlaceofbirth').click()
      await page.getByText(updatedChildDetails.birthLocation.district).click()

      await page
        .locator('#cityPlaceofbirth')
        .fill(updatedChildDetails.birthLocation.town)

      await page
        .locator('#addressLine1UrbanOptionPlaceofbirth')
        .fill(updatedChildDetails.birthLocation.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPlaceofbirth')
        .fill(updatedChildDetails.birthLocation.street)

      await page
        .locator('#addressLine3UrbanOptionPlaceofbirth')
        .fill(updatedChildDetails.birthLocation.number)

      await page
        .locator('#postalCodePlaceofbirth')
        .fill(updatedChildDetails.birthLocation.zipCode)

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous place of birth with strikethrough
       * - show updated place of birth
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#child-content #Place').getByRole('deletion').nth(0)
      ).toHaveText('Health Institution')

      /*
        assertion fails
        await expect(
          page.locator('#child-content #Place').getByRole('deletion').nth(1)
        ).toHaveText('Chikobo Rural Health Centre')
      */
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.placeOfBirth)
      ).toBeVisible()
      await expect(
        page.locator('#child-content #Place').getByText('Farajaland')
      ).toBeVisible()
      await expectAddress(
        page.locator('#child-content #Place'),
        updatedChildDetails.birthLocation
      )
    })
  })

  test('3.5 Upload supporting documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should
     * - navigate to supporting document
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('supportingDocuments')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page.getByLabel('No supporting documents required').check()

    /*
     * Expected result: should enable the continue button
     */
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('3.6 Reason for correction', async () => {
    /*
     * Expected result: should
     * - navigate to reason for correction
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('reason')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page
      .getByLabel(
        'Informant did not provide this information (Material omission)'
      )
      .check()

    await page.locator('#additionalComment').fill(registrationNumber!)

    /*
     * Expected result: should enable the continue button
     */
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('3.7 Correction summary', async () => {
    /*
     * Expected result: should
     * - navigate to correction summary
     * - Send for approval button is disabled
     */
    expect(page.url().includes('summary')).toBeTruthy()
    expect(page.url().includes('correction')).toBeTruthy()

    await expect(
      page.getByRole('button', { name: 'Send for approval' })
    ).toBeDisabled()

    /*
     * Expected result: should show
     * - Original vs correction
     * - Requested by
     * - ID check
     * - Reason for request
     * - Comments
     */
    await expect(
      page.getByText(
        'Place of delivery (Child)' +
          'Health Institution' +
          '-' +
          '-' +
          '-' +
          '-' +
          '-' +
          '-' +
          '-' +
          '-' +
          '-' +
          updatedChildDetails.placeOfBirth +
          'Farajaland' +
          updatedChildDetails.birthLocation.province +
          updatedChildDetails.birthLocation.district +
          updatedChildDetails.birthLocation.town +
          updatedChildDetails.birthLocation.residentialArea +
          updatedChildDetails.birthLocation.street +
          updatedChildDetails.birthLocation.number +
          updatedChildDetails.birthLocation.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Full name (mother)' +
          `${declaration['mother.name'].firstname} ${declaration['mother.name'].surname}` +
          `${updatedMotherDetails.firstNames} ${updatedMotherDetails.familyName}`
      )
    ).toBeVisible()

    const updatedAge = differenceInYears(
      new Date(),
      parseISO(updatedMotherDetails.dob)
    )
    const originalAge = differenceInYears(
      new Date(),
      parseISO(declaration['mother.dob'])
    )

    await expect(
      page.getByText(
        joinValuesWith(['Age of mother (mother)', originalAge, updatedAge], '')
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Nationality (Mother)Farajaland' + updatedMotherDetails.nationality
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of ID (Mother)National ID' + updatedMotherDetails.idType
      )
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Mother)-' + updatedMotherDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residence (Mother)FarajalandCentralIbombo-' +
          'Farajaland' +
          updatedMotherDetails.address.province +
          updatedMotherDetails.address.district +
          updatedMotherDetails.address.town +
          updatedMotherDetails.address.residentialArea +
          updatedMotherDetails.address.street +
          updatedMotherDetails.address.number +
          updatedMotherDetails.address.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Marital status (Mother)' +
          declaration['mother.maritalStatus'] +
          updatedMotherDetails.maritalStatus
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Level of education (Mother)No schooling' +
          updatedMotherDetails.educationLevel
      )
    ).toBeVisible()

    await expect(
      page.getByText(`${formatV2ChildName(declaration)}`)
    ).toBeVisible()
    await expect(page.getByText('Verified')).toBeVisible()
    await expect(
      page.getByText(
        'Informant did not provide this information (Material omission)'
      )
    ).toBeVisible()
    await expect(page.getByText(registrationNumber!)).toBeVisible()

    await page.getByLabel('No').check()

    /*
     * Expected result: should enable the Send for approval button
     */
    await page.getByRole('button', { name: 'Send for approval' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    /*
     * Expected result: should
     * - be navigated to sent for approval tab
     * - include the declaration in this tab
     */
    expect(page.url().includes('registration-home/approvals')).toBeTruthy()
    await page.getByRole('button', { name: 'Outbox' }).click()
    await expectOutboxToBeEmpty(page)
    await page.getByRole('button', { name: 'Sent for approval' }).click()
    await expect(
      page.getByText(`${formatV2ChildName(declaration)}`).first()
    ).toBeVisible()
  })

  test.describe('3.8 Correction Approval', async () => {
    test.beforeAll(async ({ browser }) => {
      await page.close()

      page = await browser.newPage()

      await login(
        page,
        CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
        CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
      )
      await createPIN(page)
    })

    test('3.8.1 Record audit by local registrar', async () => {
      await auditRecord({
        page,
        name: `${formatV2ChildName(declaration)}`,
        trackingId
      })
      await assignRecord(page)
    })

    test('3.8.2 Correction review', async () => {
      await page.getByRole('button', { name: 'Action' }).first().click()
      await getAction(page, 'Review correction request').click()
      /*
       * Expected result: should show
       * - Submitter
       * - Requested by
       * - Reason for request
       * - Comments
       * - Original vs correction
       */

      await expect(page.getByText('Submitter' + 'Felix Katongo')).toBeVisible()

      await expect(
        page.getByText('Requested by' + `${formatV2ChildName(declaration)}`)
      ).toBeVisible()
      await expect(
        page.getByText(
          'Reason for request' +
            'Informant did not provide this information (Material omission)'
        )
      ).toBeVisible()

      await expect(
        page.getByText('Comments' + registrationNumber)
      ).toBeVisible()

      /*
      @ToDo: assert this after https://github.com/opencrvs/opencrvs-core/issues/7505 is solved
      await expect(
        page.getByText(
          'Place of delivery (Child)' +
            'Health Institution' +
            'Farajaland' +
            'Central' +
            'Ibombo' +
            '-' +
            '-' +
            '-' +
            '-' +
            '-' +
            '-' +
            'Residential address' +
            'Farajaland' +
            updatedChildDetails.birthLocation.province +
            updatedChildDetails.birthLocation.district +
            updatedChildDetails.birthLocation.town +
            updatedChildDetails.birthLocation.residentialArea +
            updatedChildDetails.birthLocation.street +
            updatedChildDetails.birthLocation.number +
            updatedChildDetails.birthLocation.zipCode
        )
      ).toBeVisible()
      */

      await expect(
        page.getByText(
          'Full name (mother)' +
            `${declaration['mother.name'].firstname} ${declaration['mother.name'].surname}` +
            `${updatedMotherDetails.firstNames} ${updatedMotherDetails.familyName}`
        )
      ).toBeVisible()

      const updatedAge = differenceInYears(
        new Date(),
        parseISO(updatedMotherDetails.dob)
      )
      const originalAge = differenceInYears(
        new Date(),
        parseISO(declaration['mother.dob'])
      )

      await expect(
        page.getByText(
          joinValuesWith(
            ['Age of mother (mother)', originalAge, updatedAge],
            ''
          )
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Nationality (Mother)Farajaland' + updatedMotherDetails.nationality
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Type of ID (Mother)National ID' + updatedMotherDetails.idType
        )
      ).toBeVisible()
      await expect(
        page.getByText('ID Number (Mother)-' + updatedMotherDetails.id)
      ).toBeVisible()

      await expect(
        page.getByText(
          'Usual place of residence (Mother)FarajalandCentralIbombo-' +
            'Farajaland' +
            updatedMotherDetails.address.province +
            updatedMotherDetails.address.district +
            updatedMotherDetails.address.town +
            updatedMotherDetails.address.residentialArea +
            updatedMotherDetails.address.street +
            updatedMotherDetails.address.number +
            updatedMotherDetails.address.zipCode
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Marital status (Mother)' +
            declaration['mother.maritalStatus'] +
            updatedMotherDetails.maritalStatus
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Level of education (Mother)No schooling' +
            updatedMotherDetails.educationLevel
        )
      ).toBeVisible()
    })

    test.skip('3.8.3 Approve correction', async () => {
      await page.getByRole('button', { name: 'Approve', exact: true }).click()
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()

      /*
       * Expected result: should
       * - be navigated to ready to print tab
       * - include the updated declaration in this tab
       */
      expect(page.url().includes('registration-home/print')).toBeTruthy()
      await page.getByRole('button', { name: 'Outbox' }).click()
      await expectOutboxToBeEmpty(page)
      await page.getByRole('button', { name: 'Ready to print' }).click()

      await expect(
        page.getByText(`${formatV2ChildName(declaration)}`).first()
      ).toBeVisible()
    })

    test.skip('3.8.4 Validate history in record audit', async () => {
      await auditRecord({
        page,
        name: `${formatV2ChildName(declaration)}`,
        trackingId
      })

      await assignRecord(page)

      /*
       * Expected result: should show in task history
       * - Correction requested
       * - Correction approved
       */

      await expect(
        page
          .locator('#listTable-task-history')
          .getByRole('button', { name: 'Correction requested' })
      ).toBeVisible()

      await expect(
        page
          .locator('#listTable-task-history')
          .getByRole('button', { name: 'Correction approved' })
      ).toBeVisible()
    })
  })
})
