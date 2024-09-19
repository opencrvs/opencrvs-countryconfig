import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectAddress,
  expectOutboxToBeEmpty,
  formatName,
  getToken,
  goBackToReview,
  joinValuesWith,
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
import { CREDENTIALS } from '../../constants'
import { random } from 'lodash'

test.describe.serial(' Correct record - 7', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let page: Page

  const updatedMotherDetails = {
    firstNames: faker.name.firstName('male'),
    familyName: faker.name.firstName('male'),
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

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.0 Shortcut declaration', async () => {
    let token = await getToken('j.musonda', 'test')
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

    token = await getToken('j.musonda', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchBirthRegistration as BirthDeclaration
  })

  test('7.1 Ready to print > record audit', async () => {
    await login(
      page,
      CREDENTIALS.NATIONAL_REGISTRAR.USERNAME,
      CREDENTIALS.NATIONAL_REGISTRAR.PASSWORD
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

  test('7.2 Correction requester: court', async () => {
    await page.getByLabel('Court').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('7.3 Verify identity', async () => {
    /*
     * Expected result: should Confirm
     * nothing
     */

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

  test.describe('7.4 Correction made on mother details', async () => {
    test('7.4.1 Change mother details', async () => {
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

      await page.locator('#firstNamesEng').fill(updatedMotherDetails.firstNames)
      await page.locator('#familyNameEng').fill(updatedMotherDetails.familyName)

      await page
        .locator('#ageOfIndividualInYears')
        .fill(updatedMotherDetails.age.toString())

      await page.locator('#nationality').click()
      await page.getByText(updatedMotherDetails.nationality).click()

      await page.locator('#motherIdType').click()
      await page.getByText(updatedMotherDetails.idType).click()

      await page.locator('#motherPassport').fill(updatedMotherDetails.id)

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

      await page.locator('#maritalStatus').click()
      await page.getByText(updatedMotherDetails.maritalStatus).click()

      await page.locator('#educationalAttainment').click()
      await page.getByText(updatedMotherDetails.educationLevel).click()

      await goBackToReview(page)
    })

    test('7.4.2 Verify changes', async () => {
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

      await expect(oldData[0]).toHaveText(declaration.mother.name[0].firstNames)
      await expect(oldData[1]).toHaveText(declaration.mother.name[0].familyName)

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

      /*
       * Expected result: should
       * - show previous gender with strikethrough
       * - show updated gender
       */

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

      /*
       * Expected result: should
       * - show previous nationality with strikethrough
       * - show updated nationality
       */

      await expect(
        page.locator('#mother-content #Nationality').getByRole('deletion')
      ).toHaveText('Farajaland')

      await expect(
        page
          .locator('#mother-content #Nationality')
          .getByText(updatedMotherDetails.nationality)
      ).toBeVisible()

      /*
       * Expected result: should
       * - show previous id type with strikethrough
       * - show updated id type
       */

      await expect(
        page.locator('#mother-content #Type').getByRole('deletion')
      ).toHaveText('National ID')

      await expect(
        page
          .locator('#mother-content #Type')
          .getByText(updatedMotherDetails.idType)
      ).toBeVisible()

      /*
       * Expected result: should
       * - show previous id with strikethrough
       * - show updated id
       */

      await expect(
        page.locator('#mother-content #ID').getByText(updatedMotherDetails.id)
      ).toBeVisible()

      /*
       * Expected result: should
       * - show previous Usual place of resiedence with strikethrough
       * - show updated Usual place of resiedence
       */

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
      /*
       * Expected result: should
       * - show previous marital status with strikethrough
       * - show updated marital status
       */

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

      /*
       * Expected result: should
       * - show previous level of education with strikethrough
       * - show updated level of education
       */

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

  test('7.5 Upload supporting documents', async () => {
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

  test('7.6 Reason for correction', async () => {
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

    await page
      .locator('#additionalComment')
      .fill(declaration.registration.registrationNumber)

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('7.7 Correction summary', async () => {
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

    await expect(page.getByText('Court', { exact: true })).toBeVisible()
    await expect(page.getByText('Identity does not match')).toBeVisible()
    await expect(
      page.getByText(
        'Informant provided incorrect information (Material error)'
      )
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
  test('7.8 Validate history in record audit', async () => {
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
})
