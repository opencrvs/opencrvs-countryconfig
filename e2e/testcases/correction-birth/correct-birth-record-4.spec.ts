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
  login,
  uploadImage,
  uploadImageToSection
} from '../../helpers'
import faker from '@faker-js/faker'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../birth/helpers'
import { BirthDeclaration, BirthInputDetails } from '../birth/types'
import { format, subDays } from 'date-fns'
import { CREDENTIALS } from '../../constants'

test.describe.serial(' Correct record - 4', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  const updatedFatherDetails = {
    firstNames: faker.name.firstName('male'),
    familyName: faker.name.firstName('male'),
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
    },
    maritalStatus: 'Married',
    educationLevel: 'Primary'
  }

  const updatedChildDetails = {
    placeOfBirth: 'Health Institution',
    birthFacility: 'Mwenekombe Health Post'
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('4.0 Shortcut declaration', async () => {
    let token = await getToken('j.musonda', 'test')
    const declarationInput = {
      child: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName(),
        gender: 'male',
        placeOfBirth: 'Residential address',
        birthLocation: {
          state: 'Sulaka',
          district: 'Irundu'
        }
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

    token = await getToken('k.mweene', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchBirthRegistration as BirthDeclaration
  })

  test('4.1 Ready to print > record audit', async () => {
    await login(
      page,
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createPIN(page)

    await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
    await page.getByPlaceholder('Search for a tracking ID').press('Enter')
    await page.locator('#ListItemAction-0-icon').click()
    await page.locator('#name_0').click()

    await page
      .getByRole('button', { name: 'Correct record', exact: true })
      .click()
  })

  test('4.2 Correction requester: legal guardian', async () => {
    await page.getByLabel('Legal guardian').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('4.3 Verify identity', async () => {
    /*
     * Expected result: should Confirm
     * nothing
     */

    await page.getByRole('button', { name: 'Verified' }).click()

    /*
     * Expected result: should navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('4.4 Make correction', async () => {
    test.describe('4.4.1 Make correction on father details page', async () => {
      test('4.4.1.1 Change name', async () => {
        await page
          .locator('#father-content #Full')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's family name
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#familyNameEng')).toBeTruthy()

        await page
          .locator('#firstNamesEng')
          .fill(updatedFatherDetails.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(updatedFatherDetails.familyName)

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
          .locator('#father-content #Full')
          .getByRole('deletion')
          .all()

        await expect(oldData[0]).toHaveText(
          declaration.father.name[0].firstNames
        )
        await expect(oldData[1]).toHaveText(
          declaration.father.name[0].familyName
        )

        await expect(
          page
            .locator('#father-content #Full')
            .getByText(updatedFatherDetails.firstNames)
        ).toBeVisible()
        await expect(
          page
            .locator('#father-content #Full')
            .getByText(updatedFatherDetails.familyName)
        ).toBeVisible()
      })

      test('4.4.1.2 Change date of birth', async () => {
        await page
          .locator('#father-content #Date')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's date of birth
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#fatherBirthDate')).toBeTruthy()

        const birthDay = updatedFatherDetails.birthDate.split('-')

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
          page.locator('#father-content #Date').getByRole('deletion')
        ).toHaveText(formatDateTo_ddMMMMyyyy(declaration.father.birthDate))

        await expect(
          page
            .locator('#father-content #Date')
            .getByText(formatDateTo_ddMMMMyyyy(updatedFatherDetails.birthDate))
        ).toBeVisible()
      })

      test('4.4.1.3 Change nationality', async () => {
        await page
          .locator('#father-content #Nationality')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's nationality
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#nationality')).toBeTruthy()

        await page.locator('#nationality').click()
        await page.getByText(updatedFatherDetails.nationality).click()

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
          page.locator('#father-content #Nationality').getByRole('deletion')
        ).toHaveText('Farajaland')

        await expect(
          page
            .locator('#father-content #Nationality')
            .getByText(updatedFatherDetails.nationality)
        ).toBeVisible()
      })

      test('4.4.1.4 Change id type', async () => {
        await page
          .locator('#father-content #Type')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's id type
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#fatherIdType')).toBeTruthy()

        await page.locator('#fatherIdType').click()
        await page.getByText(updatedFatherDetails.idType).click()

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
          page.locator('#father-content #Type').getByRole('deletion')
        ).toHaveText('National ID')

        await expect(
          page
            .locator('#father-content #Type')
            .getByText(updatedFatherDetails.idType)
        ).toBeVisible()
      })

      test('4.4.1.5 Change id', async () => {
        await page
          .locator('#father-content #ID')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's id
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#fatherPassport')).toBeTruthy()

        await page.locator('#fatherPassport').fill(updatedFatherDetails.id)

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
          page.locator('#father-content #ID').getByText(updatedFatherDetails.id)
        ).toBeVisible()
      })

      test('4.4.1.6 Change usual place of residence', async () => {
        await page
          .locator('#father-content #Usual')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's Usual place of resiedence
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#countryPrimary')).toBeTruthy()

        await page.locator('#statePrimaryFather').click()
        await page.getByText(updatedFatherDetails.address.province).click()

        await page.locator('#districtPrimaryFather').click()
        await page.getByText(updatedFatherDetails.address.district).click()

        await page
          .locator('#cityPrimaryFather')
          .fill(updatedFatherDetails.address.town)

        await page
          .locator('#addressLine1UrbanOptionPrimaryFather')
          .fill(updatedFatherDetails.address.residentialArea)

        await page
          .locator('#addressLine2UrbanOptionPrimaryFather')
          .fill(updatedFatherDetails.address.street)

        await page
          .locator('#addressLine3UrbanOptionPrimaryFather')
          .fill(updatedFatherDetails.address.number)

        await page
          .locator('#postalCodePrimaryFather')
          .fill(updatedFatherDetails.address.zipCode)

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
          page.locator('#father-content #Usual'),
          {
            ...declaration.father.address[0],
            country: 'Farajaland',
            state: 'Central',
            district: 'Ibombo'
          },
          true
        )
      })

      test('4.4.1.7 Change marital status', async () => {
        await page
          .locator('#father-content #Marital')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's marital status
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#maritalStatus')).toBeTruthy()

        await page.locator('#maritalStatus').click()
        await page.getByText(updatedFatherDetails.maritalStatus).click()

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
          page.locator('#father-content #Marital').getByRole('deletion')
        ).toHaveText(declaration.father.maritalStatus, {
          ignoreCase: true
        })

        await expect(
          page
            .locator('#father-content #Marital')
            .getByText(updatedFatherDetails.maritalStatus)
        ).toBeVisible()
      })

      test('4.4.1.8 Change level of education', async () => {
        await page
          .locator('#father-content #Level')
          .getByRole('button', { name: 'Change', exact: true })
          .click()

        /*
         * Expected result: should
         * - redirect to father's details page
         * - focus on father's level of education
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('father-view-group')).toBeTruthy()
        expect(page.url().includes('#educationalAttainment')).toBeTruthy()

        await page.locator('#educationalAttainment').click()
        await page.getByText(updatedFatherDetails.educationLevel).click()

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
          page.locator('#father-content #Level').getByRole('deletion')
        ).toHaveText('No schooling')

        await expect(
          page
            .locator('#father-content #Level')
            .getByText(updatedFatherDetails.educationLevel)
        ).toBeVisible()
      })
    })

    test('4.4.2 Change place of birth', async () => {
      await page
        .locator('#child-content #Place')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's placeOfBirth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#placeOfBirth')).toBeTruthy()

      await page.locator('#placeOfBirth').click()
      await page
        .getByText(updatedChildDetails.placeOfBirth, { exact: true })
        .click()
      await page
        .locator('#birthLocation')
        .fill(updatedChildDetails.birthFacility.slice(0, 4))
      await page.getByText(updatedChildDetails.birthFacility).click()

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous placeOfBirth with strikethrough
       * - show updated placeOfBirth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#child-content #Place').getByRole('deletion').nth(0)
      ).toHaveText('Residential address')

      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.placeOfBirth)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.birthFacility)
      ).toBeVisible()
    })
  })

  test('4.5 Upload supporting documents', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    /*
     * Expected result: should
     * - navigate to supporting document
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()

    expect(page.url().includes('supportingDocuments')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    const imageUploadSectionTitles = ['Affidavit', 'Court Document', 'Other']

    for (const sectionTitle of imageUploadSectionTitles) {
      await uploadImageToSection({
        page,
        sectionLocator: page.locator('#corrector_form'),
        sectionTitle,
        buttonLocator: page.getByRole('button', { name: 'Upload' })
      })
    }

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('4.6 Reason for correction', async () => {
    /*
     * Expected result: should
     * - navigate to reason for correction
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()

    expect(page.url().includes('reason')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page
      .getByLabel('Requested to do so by the court (Judicial order)')
      .check()

    await page
      .locator('#additionalComment')
      .fill(declaration.registration.registrationNumber)

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('4.7 Correction summary', async () => {
    /*
     * Expected result: should
     * - navigate to correction summary
     * - Make correction button is disabled
     */
    expect(page.url().includes('summary')).toBeTruthy()
    expect(page.url().includes('correction')).toBeTruthy()

    await expect(
      page.getByRole('button', { name: 'Make correction' })
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
          'Residential address' +
          '-' +
          updatedChildDetails.placeOfBirth +
          updatedChildDetails.birthFacility
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Full name (father)' +
          formatName(declaration.father.name[0]) +
          formatName(updatedFatherDetails)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of birth (father)' +
          formatDateTo_ddMMMMyyyy(declaration.father.birthDate) +
          formatDateTo_ddMMMMyyyy(updatedFatherDetails.birthDate)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Nationality (Father)Farajaland' + updatedFatherDetails.nationality
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of ID (Father)National ID' + updatedFatherDetails.idType
      )
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Father)-' + updatedFatherDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residence (Father)FarajalandCentralIbombo-' +
          declaration.father.address[0].city +
          declaration.father.address[0].line[2] +
          declaration.father.address[0].line[1] +
          declaration.father.address[0].line[0] +
          declaration.father.address[0].postalCode +
          'Farajaland' +
          updatedFatherDetails.address.province +
          updatedFatherDetails.address.district +
          updatedFatherDetails.address.town +
          updatedFatherDetails.address.residentialArea +
          updatedFatherDetails.address.street +
          updatedFatherDetails.address.number +
          updatedFatherDetails.address.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Marital status (Father)' +
          declaration.father.maritalStatus +
          updatedFatherDetails.maritalStatus
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Level of education (Father)No schooling' +
          updatedFatherDetails.educationLevel
      )
    ).toBeVisible()

    await expect(page.getByText('Legal guardian')).toBeVisible()
    await expect(page.getByText('Verified')).toBeVisible()
    await expect(
      page.getByText('Requested to do so by the court (Judicial order)')
    ).toBeVisible()
    await expect(
      page.getByText(declaration.registration.registrationNumber)
    ).toBeVisible()

    await page.getByLabel('Yes').check()
    await page.locator('#correctionFees\\.nestedFields\\.totalFees').fill('15')

    await uploadImage(page, page.locator('#upload_document'))
    /*
     * Expected result: should enable the Make correction button
     */
    await page.getByRole('button', { name: 'Make correction' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.getByRole('button', { name: 'Ready to print' }).click()

    /*
     * Expected result: should
     * - be navigated to ready to print tab
     * - include the declaration in this tab
     */
    await expectOutboxToBeEmpty(page)

    await expect(
      page.getByText(formatName(declaration.child.name[0]))
    ).toBeVisible()
  })
  test('4.8 Validate history in record audit', async () => {
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
     * - Record corrected
     */

    await expect(
      page
        .locator('#listTable-task-history')
        .getByRole('button', { name: 'Record corrected' })
    ).toBeVisible()
  })
  test('4.9 Validate record corrected modal', async () => {
    const correctionRequestedRow = page.locator(
      '#listTable-task-history #row_4'
    )
    await correctionRequestedRow.getByText('Record corrected').click()

    const time = await correctionRequestedRow.locator('span').nth(1).innerText()

    const requester = await correctionRequestedRow
      .locator('span')
      .nth(2)
      .innerText()

    /*
     * Expected result: Should show
     * - Record corrected header
     * - Requester & time
     * - Requested by
     * - Id check
     * - Reason
     * - Comment
     * - Original vs Correction
     */
    await expect(
      page.getByRole('heading', { name: 'Record corrected' })
    ).toBeVisible()

    await expect(page.getByText(requester + ' — ' + time)).toBeVisible()

    await expect(
      page.getByText('Requested by' + 'Legal guardian')
    ).toBeVisible()
    await expect(page.getByText('ID check' + 'Verified')).toBeVisible()
    await expect(
      page.getByText(
        'Reason for request' +
          'Requested to do so by the court (Judicial order)'
      )
    ).toBeVisible()

    await expect(
      page.getByText('Comment' + declaration.registration.registrationNumber)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Place of delivery (Child)' +
          'Residential address' +
          'Health Institution'
      )
    ).toBeVisible()
    await expect(
      page.getByText(
        'Health Institution (Child)' + updatedChildDetails.birthFacility
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'First name(s) (Father)' +
          declaration.father.name[0].firstNames +
          updatedFatherDetails.firstNames
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Last name (Father)' +
          declaration.father.name[0].familyName +
          updatedFatherDetails.familyName
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of birth (father)' +
          formatDateTo_yyyyMMdd(declaration.father.birthDate) +
          formatDateTo_yyyyMMdd(updatedFatherDetails.birthDate)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Nationality (Father)' + 'Farajaland' + updatedFatherDetails.nationality
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of ID (Father)' + 'National ID' + updatedFatherDetails.idType
      )
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Father)' + updatedFatherDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Province (Father)' + 'Central' + updatedFatherDetails.address.province
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'District (Father)' + 'Ibombo' + updatedFatherDetails.address.district
      )
    ).toBeVisible()

    await page.getByRole('button', { name: 'Next page' }).click()

    await expect(
      page.getByText(
        'Town (Father)' +
          declaration.father.address[0].city +
          updatedFatherDetails.address.town
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Residential Area (Father)' +
          declaration.father.address[0].line[2] +
          updatedFatherDetails.address.residentialArea
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Street (Father)' +
          declaration.father.address[0].line[1] +
          updatedFatherDetails.address.street
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Number (Father)' +
          declaration.father.address[0].line[0] +
          updatedFatherDetails.address.number
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Postcode / Zip (Father)' +
          declaration.father.address[0].postalCode +
          updatedFatherDetails.address.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Marital status (Father)' +
          declaration.father.maritalStatus +
          updatedFatherDetails.maritalStatus
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Level of education (Father)' +
          'No schooling' +
          updatedFatherDetails.educationLevel
      )
    ).toBeVisible()

    await page
      .getByRole('heading', { name: 'Record corrected' })
      .locator('xpath=following-sibling::*[1]')
      .click()
  })
})
