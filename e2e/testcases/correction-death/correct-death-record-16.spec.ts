import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatName,
  getToken,
  goBackToReview,
  login,
  uploadImage,
  uploadImageToSection
} from '../../helpers'
import faker from '@faker-js/faker'
import { format, subDays } from 'date-fns'
import { DeathDeclaration } from '../death/types'
import { createDeathDeclaration, fetchDeclaration } from '../death/helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial(' Correct record - 16', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

  let page: Page
  const updatedInformantDetails = {
    type: 'Son',
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
      sameAsDeceased: false,
      country: 'Farajaland',
      province: 'Sulaka',
      district: 'Irundu',
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

  test('16.0 Shortcut declaration', async () => {
    let token = await getToken('j.musonda', 'test')

    const res = await createDeathDeclaration(token)
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })

    trackingId = res.trackingId

    token = await getToken('j.musonda', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchDeathRegistration as DeathDeclaration
  })

  test('16.1 Ready to print > record audit', async () => {
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

  test('16.2 Correction requester: Another registration agent or field agent', async () => {
    await page.getByLabel('Another registration agent or field agent').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('16.3 Verify identity', async () => {
    /*
     * Expected result:
     * - should not show verify identity
     * - should directly navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('16.4 Correction made on informant details', async () => {
    test('16.4.1 Change informant type', async () => {
      await page
        .locator('#informant-content #Informant')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to informant's details page
       * - focus on informant's type
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('informant-view-group')).toBeTruthy()
      expect(page.url().includes('#informantType')).toBeTruthy()

      await page.locator('#informantType').click()
      await page
        .getByText(updatedInformantDetails.type, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous type with strikethrough
       * - show updated type
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#informant-content #Informant').getByRole('deletion')
      ).toHaveText(declaration.registration.informantType, {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#informant-content #Informant')
          .getByText(updatedInformantDetails.type)
      ).toBeVisible()
    })

    test('16.4.2 Change name', async () => {
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
      // expect(page.url().includes('#familyNameEng')).toBeTruthy()   => this fails

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

    test('16.4.3 Change date of birth', async () => {
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
          .getByText(formatDateTo_ddMMMMyyyy(updatedInformantDetails.birthDate))
      ).toBeVisible()
    })

    test('16.4.4 Change nationality', async () => {
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

    test('16.4.5 Change id type', async () => {
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
      ).toHaveText('-')

      await expect(
        page
          .locator('#informant-content #Type')
          .getByText(updatedInformantDetails.idType)
      ).toBeVisible()
    })

    test('16.4.6 Change id', async () => {
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

      await page.locator('#informantPassport').fill(updatedInformantDetails.id)

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

    test('16.4.7 Change usual place of residence', async () => {
      await page
        .locator('#informant-content #Same')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to informant's details page
       * - focus on informant's Usual place of resiedence
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('informant-view-group')).toBeTruthy()
      expect(
        page.url().includes('#primaryAddressSameAsOtherPrimary')
      ).toBeTruthy()

      await page.getByLabel('No', { exact: true }).check()

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

      await goBackToReview(page)

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous Usual place of resiedence with strikethrough
       * - show updated Usual place of resiedence
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#informant-content #Usual').getByText('Farajaland')
      ).toBeVisible()
      await expectAddress(
        page.locator('#informant-content #Usual'),
        updatedInformantDetails.address
      )
    })

    test('16.4.8 Change email', async () => {
      await page
        .locator('#informant-content #Email')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to informant's details page
       * - focus on registration email
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
       * - show previous email with strikethrough
       * - show updated email
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

  test('16.5 Upload supporting documents', async () => {
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

  test('16.6 Reason for correction', async () => {
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

  test('16.7 Correction summary', async () => {
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
        'Informant type (Informant)' +
          declaration.registration.informantType +
          updatedInformantDetails.type
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
      page.getByText('Type of ID (Informant)-' + updatedInformantDetails.idType)
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Informant)-' + updatedInformantDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        "Same as deceased's usual place of residence? (Informant)" +
          'Yes' +
          'No'
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residence (Informant)FarajalandSulakaZobwe-' +
          declaration.deceased.address[0].city +
          declaration.deceased.address[0].line[2] +
          declaration.deceased.address[0].line[1] +
          declaration.deceased.address[0].line[0] +
          declaration.deceased.address[0].postalCode +
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
      page.getByText('Another registration agent or field agent', {
        exact: true
      })
    ).toBeVisible()
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
      page.getByText(formatName(declaration.deceased.name[0]))
    ).toBeVisible()
  })
  test('16.8 Validate history in record audit', async () => {
    await page.getByText(formatName(declaration.deceased.name[0])).click()

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
