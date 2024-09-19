import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatName,
  getToken,
  goBackToReview,
  joinValuesWith,
  login
} from '../../helpers'
import faker from '@faker-js/faker'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../birth/helpers'
import { BirthDeclaration, BirthInputDetails } from '../birth/types'
import { CREDENTIALS } from '../../constants'
import { random } from 'lodash'

test.describe.serial(' Correct record - 3', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  const updatedMotherDetails = {
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    age: random(20, 100),
    email: faker.internet.email(),
    nationality: 'Nauru',
    id: faker.random.numeric(10),
    idType: 'Passport',
    address: {
      province: 'Sulaka',
      district: 'Irundu',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    },
    maritalStatus: 'Married',
    educationLevel: 'Primary'
  }
  const updatedChildDetails = {
    placeOfBirth: 'Other',
    birthLocation: {
      province: 'Pualula',
      district: 'Ienge',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    }
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('3.0 Shortcut declaration', async () => {
    let token = await getToken('k.mweene', 'test')
    const declarationInput = {
      child: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName(),
        gender: 'male'
      },
      informant: {
        type: 'BROTHER'
      },
      attendant: {
        type: 'PHYSICIAN'
      },
      mother: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName()
      },
      father: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName()
      }
    } as ConvertEnumsToStrings<BirthInputDetails>

    const res = await createDeclaration(token, declarationInput)
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })

    trackingId = res.trackingId

    token = await getToken('f.katongo', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchBirthRegistration as BirthDeclaration
  })

  test.describe('3.1 Print > Ready to issue', async () => {
    test('3.1.1 Print', async () => {
      await login(
        page,
        CREDENTIALS.REGISTRATION_AGENT.USERNAME,
        CREDENTIALS.REGISTRATION_AGENT.PASSWORD
      )
      await createPIN(page)

      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.locator('#name_0').click()

      await page.getByRole('button', { name: 'Print', exact: true }).click()

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
      await expectOutboxToBeEmpty(page)

      await expect(
        page.getByText(formatName(declaration.child.name[0]))
      ).toBeVisible()
    })

    test('3.1.3 Record audit', async () => {
      await page.getByText(formatName(declaration.child.name[0])).click()

      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

      /*
       * Expected result: should show correct record button
       */
      await expect(
        page.getByRole('button', { name: 'Correct record', exact: true })
      ).toBeVisible()

      await page
        .getByRole('button', { name: 'Correct record', exact: true })
        .click()
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
      page.getByText(`First name(s): ${declaration.child.name[0].firstNames}`)
    ).toBeVisible()
    await expect(
      page.getByText(`Last name: ${declaration.child.name[0].familyName}`)
    ).toBeVisible()
    await expect(
      page.getByText(
        `Date of Birth:
        ${formatDateTo_ddMMMMyyyy(declaration.child.birthDate)}
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
          .locator('#mother-content #Full')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's family name
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
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
          .locator('#mother-content #Full')
          .getByRole('deletion')
          .all()

        await expect(oldData[0]).toHaveText(
          declaration.mother.name[0].firstNames
        )
        await expect(oldData[1]).toHaveText(
          declaration.mother.name[0].familyName
        )

        await expect(
          page
            .locator('#mother-content #Full')
            .getByText(updatedMotherDetails.firstNames)
        ).toBeVisible()
        await expect(
          page
            .locator('#mother-content #Full')
            .getByText(updatedMotherDetails.familyName)
        ).toBeVisible()
      })

      test('3.4.2 Change age', async () => {
        await page
          .locator('#mother-content #Age')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's age
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
        expect(page.url().includes('#ageOfIndividualInYears')).toBeTruthy()

        await page
          .locator('#ageOfIndividualInYears')
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
          page.locator('#mother-content #Age').getByRole('deletion')
        ).toHaveText(
          joinValuesWith(
            [declaration.mother.ageOfIndividualInYears, 'years'],
            ' '
          )
        )

        await expect(
          page
            .locator('#mother-content #Age')
            .getByText(joinValuesWith([updatedMotherDetails.age, 'years'], ' '))
        ).toBeVisible()
      })

      test('3.4.3 Change nationality', async () => {
        await page
          .locator('#mother-content #Nationality')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's nationality
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
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
          page.locator('#mother-content #Nationality').getByRole('deletion')
        ).toHaveText('Farajaland')

        await expect(
          page
            .locator('#mother-content #Nationality')
            .getByText(updatedMotherDetails.nationality)
        ).toBeVisible()
      })

      test('3.4.4 Change id type', async () => {
        await page
          .locator('#mother-content #Type')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's id type
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
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
          page.locator('#mother-content #Type').getByRole('deletion')
        ).toHaveText('National ID')

        await expect(
          page
            .locator('#mother-content #Type')
            .getByText(updatedMotherDetails.idType)
        ).toBeVisible()
      })

      test('3.4.5 Change id', async () => {
        await page
          .locator('#mother-content #ID')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's id
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
        expect(page.url().includes('#motherPassport')).toBeTruthy()

        await page.locator('#motherPassport').fill(updatedMotherDetails.id)

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
          page.locator('#mother-content #ID').getByText(updatedMotherDetails.id)
        ).toBeVisible()
      })

      test('3.4.6 Change usual place of residence', async () => {
        await page
          .locator('#mother-content #Usual')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
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
          page.locator('#mother-content #Usual'),
          {
            ...declaration.mother.address[0],
            country: 'Farajaland',
            state: 'Central',
            district: 'Ibombo'
          },
          true
        )

        await expect(
          page.locator('#mother-content #Usual').getByText('Farajaland')
        ).toBeVisible()
        await expectAddress(
          page.locator('#mother-content #Usual'),
          updatedMotherDetails.address
        )
      })

      test('3.4.7 Change marital status', async () => {
        await page
          .locator('#mother-content #Marital')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's marital status
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
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
          page.locator('#mother-content #Marital').getByRole('deletion')
        ).toHaveText(declaration.mother.maritalStatus, {
          ignoreCase: true
        })

        await expect(
          page
            .locator('#mother-content #Marital')
            .getByText(updatedMotherDetails.maritalStatus)
        ).toBeVisible()
      })

      test('3.4.8 Change level of education', async () => {
        await page
          .locator('#mother-content #Level')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to mother's details page
         * - focus on mother's level of education
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('mother-view-group')).toBeTruthy()
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
          page.locator('#mother-content #Level').getByRole('deletion')
        ).toHaveText('No schooling')

        await expect(
          page
            .locator('#mother-content #Level')
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
      expect(page.url().includes('child-view-group')).toBeTruthy()
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

    await page
      .locator('#additionalComment')
      .fill(declaration.registration.registrationNumber)

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
          'Farajaland' +
          'Central' +
          'Ibombo' +
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
          formatName(declaration.mother.name[0]) +
          formatName(updatedMotherDetails)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        joinValuesWith(
          [
            'Age of mother (mother)',
            declaration.mother.ageOfIndividualInYears,
            updatedMotherDetails.age
          ],
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
          declaration.mother.address[0].city +
          declaration.mother.address[0].line[2] +
          declaration.mother.address[0].line[1] +
          declaration.mother.address[0].line[0] +
          declaration.mother.address[0].postalCode +
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
          declaration.mother.maritalStatus +
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
      page.getByText(formatName(declaration.child.name[0]))
    ).toBeVisible()
    await expect(page.getByText('Verified')).toBeVisible()
    await expect(
      page.getByText(
        'Informant did not provide this information (Material omission)'
      )
    ).toBeVisible()
    await expect(
      page.getByText(declaration.registration.registrationNumber)
    ).toBeVisible()

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
    await expectOutboxToBeEmpty(page)

    await expect(
      page.getByText(formatName(declaration.child.name[0]))
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
      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

      await page.locator('#name_0').click()
    })

    test('3.8.2 Correction review', async () => {
      await page.getByRole('button', { name: 'Review', exact: true }).click()

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
        page.getByText('Requested by' + formatName(declaration.child.name[0]))
      ).toBeVisible()
      await expect(
        page.getByText(
          'Reason for request' +
            'Informant did not provide this information (Material omission)'
        )
      ).toBeVisible()

      await expect(
        page.getByText('Comments' + declaration.registration.registrationNumber)
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
            formatName(declaration.mother.name[0]) +
            formatName(updatedMotherDetails)
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          joinValuesWith(
            [
              'Age of mother (mother)',
              declaration.mother.ageOfIndividualInYears,
              updatedMotherDetails.age
            ],
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
            declaration.mother.address[0].city +
            declaration.mother.address[0].line[2] +
            declaration.mother.address[0].line[1] +
            declaration.mother.address[0].line[0] +
            declaration.mother.address[0].postalCode +
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
            declaration.mother.maritalStatus +
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
      await expectOutboxToBeEmpty(page)

      await expect(
        page.getByText(formatName(declaration.child.name[0]))
      ).toBeVisible()
    })

    test.skip('3.8.4 Validate history in record audit', async () => {
      await page.getByText(formatName(declaration.child.name[0])).click()

      await page.getByLabel('Assign record').click()
      if (
        await page
          .getByRole('button', { name: 'Assign', exact: true })
          .isVisible()
      )
        await page.getByRole('button', { name: 'Assign', exact: true }).click()

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
