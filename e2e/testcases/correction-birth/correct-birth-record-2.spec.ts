import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatDateTo_yyyyMMdd,
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
import { format, parseISO, subDays } from 'date-fns'
import { CREDENTIALS } from '../../constants'

test.describe.serial('Correct record - 2', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  const updatedInformantDetails = {
    relationship: 'Sister',
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    birthDate: format(
      subDays(new Date(), Math.ceil(50 * Math.random() + 365 * 25)),
      'yyyy-MM-dd'
    ),
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
    }
  }
  const updatedChildDetails = {
    placeOfBirth: 'Residential address',
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

  test('2.0 Shortcut declaration', async () => {
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

  test('2.1 Certificate preview', async () => {
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
    await page.getByRole('button', { name: 'No, make correction' }).click()
  })

  test('2.2 Correction requester: father', async () => {
    await page.getByLabel('Father').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('2.3 Verify identity', async () => {
    /*
     * Expected result: should Confirm
     * ID
     * First Name
     * Last Name
     * Date of Birth
     * Nationality
     */
    await expect(
      page.getByText(`ID: National Id | ${declaration.father.identifier[0].id}`)
    ).toBeVisible()
    await expect(
      page.getByText(`First name(s): ${declaration.father.name[0].firstNames}`)
    ).toBeVisible()
    await expect(
      page.getByText(`Last name: ${declaration.father.name[0].familyName}`)
    ).toBeVisible()
    await expect(
      page.getByText(
        `Date of Birth:
        ${formatDateTo_ddMMMMyyyy(declaration.father.birthDate)}
        `
      )
    ).toBeVisible()
    await expect(
      page.getByText(`Nationality: ${declaration.father.nationality}`)
    ).toBeVisible()

    await page.getByRole('button', { name: 'Identity does not match' }).click()

    /*
     * Expected result: should show modal with
     * - Correct without proof of ID?
     * - Please be aware that if you proceed, you will be responsible
     *   for making a change to this record without the necessary proof of identification
     * - Confirm button
     * - Cancel button
     */
    await expect(page.getByText('Correct without proof of ID?')).toBeVisible()
    await expect(
      page.getByText(
        'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification'
      )
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    /*
     * Expected result: should navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('2.4 Make correction', async () => {
    test.describe('2.4.1 Make correction on informant details', async () => {
      test('2.4.1 Change relationship to child', async () => {
        await page
          .locator('#informant-content #Relationship')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informantType
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#informantType')).toBeTruthy()

        await page.locator('#informantType').click()
        await page.getByText(updatedInformantDetails.relationship).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous relation with strikethrough
         * - show updated relation
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#informant-content #Relationship').getByRole('deletion')
        ).toHaveText(declaration.registration.informantType, {
          ignoreCase: true
        })

        await expect(
          page
            .locator('#informant-content #Relationship')
            .getByText(updatedInformantDetails.relationship)
        ).toBeVisible()
      })

      test('2.4.2 Change name', async () => {
        await page
          .locator('#informant-content #Full')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's family name
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        // @ToDo assert after it is fixed
        // expect(page.url().includes('#familyNameEng')).toBeTruthy() // fail: does not focus on infirmant's family name

        await page
          .locator('#firstNamesEng')
          .fill(updatedInformantDetails.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(updatedInformantDetails.familyName)

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
          .locator('#informant-content #Full')
          .getByRole('deletion')
          .all()

        await expect(oldData[0]).toHaveText(
          declaration.informant.name[0].firstNames
        )
        await expect(oldData[1]).toHaveText(
          declaration.informant.name[0].familyName
        )

        await expect(
          page
            .locator('#informant-content #Full')
            .getByText(updatedInformantDetails.firstNames)
        ).toBeVisible()
        await expect(
          page
            .locator('#informant-content #Full')
            .getByText(updatedInformantDetails.familyName)
        ).toBeVisible()
      })

      test('2.4.3 Change date of birth', async () => {
        await page
          .locator('#informant-content #Date')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's date of birth
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#informantBirthDate')).toBeTruthy()

        const birthDay = updatedInformantDetails.birthDate.split('-')

        await page.getByPlaceholder('dd').fill(birthDay[2])
        await page.getByPlaceholder('mm').fill(birthDay[1])
        await page.getByPlaceholder('yyyy').fill(birthDay[0])

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
          page.locator('#informant-content #Date').getByRole('deletion')
        ).toHaveText(formatDateTo_ddMMMMyyyy(declaration.informant.birthDate))

        await expect(
          page
            .locator('#informant-content #Date')
            .getByText(
              format(
                parseISO(updatedInformantDetails.birthDate),
                'dd MMMM yyyy'
              )
            )
        ).toBeVisible()
      })

      test('2.4.4 Change nationality', async () => {
        await page
          .locator('#informant-content #Nationality')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's nationality
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#nationality')).toBeTruthy()

        await page.locator('#nationality').click()
        await page.getByText(updatedInformantDetails.nationality).click()

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
          page.locator('#informant-content #Nationality').getByRole('deletion')
        ).toHaveText('Farajaland')

        await expect(
          page
            .locator('#informant-content #Nationality')
            .getByText(updatedInformantDetails.nationality)
        ).toBeVisible()
      })

      test('2.4.5 Change id type', async () => {
        await page
          .locator('#informant-content #Type')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's id type
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#informantIdType')).toBeTruthy()

        await page.locator('#informantIdType').click()
        await page.getByText(updatedInformantDetails.idType).click()

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
          page.locator('#informant-content #Type').getByRole('deletion')
        ).toHaveText('National ID')

        await expect(
          page
            .locator('#informant-content #Type')
            .getByText(updatedInformantDetails.idType)
        ).toBeVisible()
      })

      test('2.4.6 Change id', async () => {
        await page
          .locator('#informant-content #ID')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's id
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#informantPassport')).toBeTruthy()

        await page
          .locator('#informantPassport')
          .fill(updatedInformantDetails.id)

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
            .locator('#informant-content #ID')
            .getByText(updatedInformantDetails.id)
        ).toBeVisible()
      })

      test('2.4.7 Change usual place of residence', async () => {
        await page
          .locator('#informant-content #Usual')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#countryPrimary')).toBeTruthy()

        await page.locator('#statePrimaryInformant').click()
        await page.getByText(updatedInformantDetails.address.province).click()

        await page.locator('#districtPrimaryInformant').click()
        await page.getByText(updatedInformantDetails.address.district).click()

        await page
          .locator('#cityPrimaryInformant')
          .fill(updatedInformantDetails.address.town)

        await page
          .locator('#addressLine1UrbanOptionPrimaryInformant')
          .fill(updatedInformantDetails.address.residentialArea)

        await page
          .locator('#addressLine2UrbanOptionPrimaryInformant')
          .fill(updatedInformantDetails.address.street)

        await page
          .locator('#addressLine3UrbanOptionPrimaryInformant')
          .fill(updatedInformantDetails.address.number)

        await page
          .locator('#postalCodePrimaryInformant')
          .fill(updatedInformantDetails.address.zipCode)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous Usual place of resiedence with strikethrough
         * - show updated Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expectAddress(
          page.locator('#informant-content #Usual'),
          {
            ...declaration.informant.address[0],
            country: 'Farajaland',
            state: 'Central',
            district: 'Ibombo'
          },
          true
        )

        await expect(
          page.locator('#informant-content #Usual').getByText('Farajaland')
        ).toBeVisible()
        await expectAddress(
          page.locator('#informant-content #Usual'),
          updatedInformantDetails.address
        )
      })

      test('2.4.8 Change email', async () => {
        await page
          .locator('#informant-content #Email')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to informant's details page
         * - focus on informant's Email
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('informant-view-group')).toBeTruthy()
        expect(page.url().includes('#registrationEmail')).toBeTruthy()

        await page
          .locator('#registrationEmail')
          .fill(updatedInformantDetails.email)

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous Email with strikethrough
         * - show updated Email
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        await expect(
          page.locator('#informant-content #Email').getByRole('deletion')
        ).toHaveText(declaration.registration.contactEmail)

        await expect(
          page
            .locator('#informant-content #Email')
            .getByText(updatedInformantDetails.email)
        ).toBeVisible()
      })
    })
    test('2.4.2 Change place of delivery', async () => {
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
      @ToDo: assert this after https://github.com/opencrvs/opencrvs-core/issues/7505 is solved
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
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.province)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.district)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.town)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.residentialArea)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.street)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.number)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthLocation.zipCode)
      ).toBeVisible()
    })
  })

  test('2.5 Upload supporting documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should
     * - navigate to supporting document
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('supportingDocuments')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page
      .getByLabel(
        'I attest to seeing supporting documentation and have a copy filed at my office'
      )
      .check()

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('2.6 Reason for correction', async () => {
    /*
     * Expected result: should
     * - navigate to reason for correction
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('reason')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page
      .getByLabel('Informant provided incorrect information (Material error)')
      .check()

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('2.7 Correction summary', async () => {
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

    await expect(
      page.getByText(
        'Relationship to child (Informant)' +
          declaration.informant.relationship +
          updatedInformantDetails.relationship
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Full name (informant)' +
          formatName(declaration.informant.name[0]) +
          formatName(updatedInformantDetails)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of birth (informant)' +
          formatDateTo_ddMMMMyyyy(declaration.informant.birthDate) +
          formatDateTo_ddMMMMyyyy(updatedInformantDetails.birthDate)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Nationality (Informant)Farajaland' +
          updatedInformantDetails.nationality
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of ID (Informant)National ID' + updatedInformantDetails.idType
      )
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Informant)-' + updatedInformantDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residence (Informant)' +
          'Farajaland' +
          'Central' +
          joinValuesWith(
            ['Ibombo', declaration.informant.address[0].city],
            '-'
          ) +
          declaration.informant.address[0].line[2] +
          declaration.informant.address[0].line[1] +
          declaration.informant.address[0].line[0] +
          declaration.informant.address[0].postalCode +
          'Farajaland' +
          updatedInformantDetails.address.province +
          updatedInformantDetails.address.district +
          updatedInformantDetails.address.town +
          updatedInformantDetails.address.residentialArea +
          updatedInformantDetails.address.street +
          updatedInformantDetails.address.number +
          updatedInformantDetails.address.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Email (Informant)' +
          declaration.registration.contactEmail +
          updatedInformantDetails.email
      )
    ).toBeVisible()

    await expect(
      page.getByText(formatName(declaration.father.name[0]))
    ).toBeVisible()
    await expect(page.getByText('Identity does not match')).toBeVisible()
    await expect(
      page.getByText(
        'Informant provided incorrect information (Material error)'
      )
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
  test.describe('2.8 Correction Approval', async () => {
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

    test('2.8.1 Record audit by local registrar', async () => {
      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

      await page.locator('#name_0').click()
    })

    test('2.8.2 Correction review', async () => {
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
        page.getByText('Requested by' + formatName(declaration.father.name[0]))
      ).toBeVisible()

      await expect(
        page.getByText(
          'Reason for request' +
            'Informant provided incorrect information (Material error)'
        )
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
          'Relationship to child (Informant)' +
            declaration.informant.relationship +
            updatedInformantDetails.relationship
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Full name (informant)' +
            formatName(declaration.informant.name[0]) +
            formatName(updatedInformantDetails)
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Date of birth (informant)' +
            formatDateTo_ddMMMMyyyy(declaration.informant.birthDate) +
            formatDateTo_ddMMMMyyyy(updatedInformantDetails.birthDate)
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Nationality (Informant)Farajaland' +
            updatedInformantDetails.nationality
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Type of ID (Informant)National ID' + updatedInformantDetails.idType
        )
      ).toBeVisible()
      await expect(
        page.getByText('ID Number (Informant)-' + updatedInformantDetails.id)
      ).toBeVisible()

      await expect(
        page.getByText(
          'Usual place of residence (Informant)FarajalandCentralIbombo-' +
            declaration.informant.address[0].city +
            declaration.informant.address[0].line[2] +
            declaration.informant.address[0].line[1] +
            declaration.informant.address[0].line[0] +
            declaration.informant.address[0].postalCode +
            'Farajaland' +
            updatedInformantDetails.address.province +
            updatedInformantDetails.address.district +
            updatedInformantDetails.address.town +
            updatedInformantDetails.address.residentialArea +
            updatedInformantDetails.address.street +
            updatedInformantDetails.address.number +
            updatedInformantDetails.address.zipCode
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Email (Informant)' +
            declaration.registration.contactEmail +
            updatedInformantDetails.email
        )
      ).toBeVisible()
    })

    test('2.8.3 Reject correction', async () => {
      await page.getByRole('button', { name: 'Reject', exact: true }).click()
      await page
        .locator('#rejectionRaisonOfCorrection')
        .fill('Wrong information')
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

    test.describe('2.8.4 Validate history in record audit', async () => {
      test('2.8.4.1 Validate entries in record audit', async () => {
        await page.getByText(formatName(declaration.child.name[0])).click()

        await page.getByLabel('Assign record').click()
        if (
          await page
            .getByRole('button', { name: 'Assign', exact: true })
            .isVisible()
        )
          await page
            .getByRole('button', { name: 'Assign', exact: true })
            .click()

        /*
         * Expected result: should show in task history
         * - Correction requested
         * - Correction rejected
         */

        await expect(
          page
            .locator('#listTable-task-history')
            .getByRole('button', { name: 'Correction requested' })
        ).toBeVisible()

        await expect(
          page
            .locator('#listTable-task-history')
            .getByRole('button', { name: 'Correction rejected' })
        ).toBeVisible()
      })

      test('2.8.4.2 Validate correction requested modal', async () => {
        const correctionRequestedRow = page.locator(
          '#listTable-task-history #row_4'
        )
        await correctionRequestedRow.getByText('Correction requested').click()

        const time = await correctionRequestedRow
          .locator('span')
          .nth(1)
          .innerText()

        const requester = await correctionRequestedRow
          .locator('span')
          .nth(2)
          .innerText()

        /*
         * Expected result: Should show
         * - Correction requested header
         * - Requester & time
         * - Requested by
         * - Id check
         * - Reason
         * - Comment
         * - Original vs Correction
         */

        await expect(
          page.getByRole('heading', { name: 'Correction requested' })
        ).toBeVisible()

        await expect(page.getByText(requester + ' — ' + time)).toBeVisible()

        await expect(page.getByText('Requested by' + 'Father')).toBeVisible()
        await expect(
          page.getByText('ID check' + 'Identity does not match')
        ).toBeVisible()
        await expect(
          page.getByText(
            'Reason for request' +
              'Informant provided incorrect information (Material error)'
          )
        ).toBeVisible()

        await expect(page.getByText('Comment')).toBeVisible()

        await expect(
          page.getByText(
            'Place of delivery (Child)' +
              'Health Institution' +
              'Residential address'
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Province (Child)' +
              'Central' +
              updatedChildDetails.birthLocation.province
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'District (Child)' +
              'Ibombo' +
              updatedChildDetails.birthLocation.district
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Town (Child)' + updatedChildDetails.birthLocation.town
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Residential Area (Child)' +
              updatedChildDetails.birthLocation.residentialArea
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Street (Child)' + updatedChildDetails.birthLocation.street
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Number (Child)' + updatedChildDetails.birthLocation.number
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Postcode / Zip (Child)' + updatedChildDetails.birthLocation.zipCode
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Relationship to child (Informant)' +
              declaration.informant.relationship +
              updatedInformantDetails.relationship
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'First name(s) (Informant)' +
              declaration.informant.name[0].firstNames +
              updatedInformantDetails.firstNames
          )
        ).toBeVisible()

        await page.getByRole('button', { name: 'Next page' }).click()

        await expect(
          page.getByText(
            'Last name (informant)' +
              declaration.informant.name[0].familyName +
              updatedInformantDetails.familyName
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Date of birth (informant)' +
              formatDateTo_yyyyMMdd(declaration.informant.birthDate) +
              formatDateTo_yyyyMMdd(updatedInformantDetails.birthDate)
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Nationality (Informant)' +
              'Farajaland' +
              updatedInformantDetails.nationality
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Type of ID (Informant)' +
              'National ID' +
              updatedInformantDetails.idType
          )
        ).toBeVisible()
        await expect(
          page.getByText('ID Number (Informant)' + updatedInformantDetails.id)
        ).toBeVisible()

        await expect(
          page.getByText(
            'Province (Informant)' +
              'Central' +
              updatedInformantDetails.address.province
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'District (Informant)' +
              'Ibombo' +
              updatedInformantDetails.address.district
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Town (Informant)' +
              declaration.informant.address[0].city +
              updatedInformantDetails.address.town
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Residential Area (Informant)' +
              declaration.informant.address[0].line[2] +
              updatedInformantDetails.address.residentialArea
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Street (Informant)' +
              declaration.informant.address[0].line[1] +
              updatedInformantDetails.address.street
          )
        ).toBeVisible()

        await page.getByRole('button', { name: 'Next page' }).click()

        await expect(
          page.getByText(
            'Number (Informant)' +
              declaration.informant.address[0].line[0] +
              updatedInformantDetails.address.number
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Postcode / Zip (Informant)' +
              declaration.informant.address[0].postalCode +
              updatedInformantDetails.address.zipCode
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Email (Informant)' +
              declaration.registration.contactEmail +
              updatedInformantDetails.email
          )
        ).toBeVisible()

        await page
          .getByRole('heading', { name: 'Correction requested' })
          .locator('xpath=following-sibling::*[1]')
          .click()
      })

      test('2.8.4.3 Validate correction rejected modal', async () => {
        const correctionRejectedRow = page.locator(
          '#listTable-task-history #row_6'
        )
        await correctionRejectedRow.getByText('Correction rejected').click()

        const time = await correctionRejectedRow
          .locator('span')
          .nth(1)
          .innerText()

        const reviewer = await correctionRejectedRow
          .locator('span')
          .nth(2)
          .innerText()

        /*
         * Expected result: Should show
         * - Correction rejected header
         * - Reviewer & time
         * - Reason
         */

        await expect(
          page.getByRole('heading', { name: 'Correction rejected' })
        ).toBeVisible()

        await expect(page.getByText(reviewer + ' — ' + time)).toBeVisible()
        await expect(
          page.getByText('Reason' + 'Wrong information')
        ).toBeVisible()

        await page
          .getByRole('heading', { name: 'Correction rejected' })
          .locator('xpath=following-sibling::*[1]')
          .click()
      })
    })
  })
})
