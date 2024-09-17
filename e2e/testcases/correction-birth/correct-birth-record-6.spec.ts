import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatName,
  getToken,
  goBackToReview,
  login
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

test.describe.serial(' Correct record - 6', () => {
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

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('6.0 Shortcut declaration', async () => {
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

    token = await getToken('k.mweene', 'test')
    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchBirthRegistration as BirthDeclaration
  })

  test.describe('6.1 Print > Ready to issue', async () => {
    test('6.1.1 print', async () => {
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

      await page.getByRole('button', { name: 'Print', exact: true }).click()

      await page.getByLabel('Print in advance').check()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Yes, print certificate' }).click()
      await page.getByRole('button', { name: 'Print', exact: true }).click()
    })
    test('6.1.2 Ready to issue', async () => {
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

      await page.getByText(formatName(declaration.child.name[0])).click()
    })
    test('6.1.3 Record audit', async () => {
      await page.getByLabel('Assign record').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

      /*
       * Expected result: should show correct record button
       */

      await page
        .getByRole('button', { name: 'Correct record', exact: true })
        .click()
    })
  })

  test('6.2 Correction requester: Me', async () => {
    await page.getByLabel('Me', { exact: true }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('6.3 Verify identity', async () => {
    /*
     * Expected result:
     * - should not show verify identity
     * - should directly navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('6.4 Correction made on informant details', async () => {
    test('6.4.1 Change relationship to child', async () => {
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

      await goBackToReview(page)
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
      ).toHaveText(declaration.registration.informantType, { ignoreCase: true })

      await expect(
        page
          .locator('#informant-content #Relationship')
          .getByText(updatedInformantDetails.relationship)
      ).toBeVisible()
    })

    test('6.4.2 Change name', async () => {
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
      // expect(page.url().includes('#familyNameEng')).toBeTruthy()  // fail: does not focus on infirmant's family name

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

    test('6.4.3 Change date of birth', async () => {
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

    test('6.4.4 Change nationality', async () => {
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

    test('6.4.5 Change id type', async () => {
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

    test('6.4.6 Change id', async () => {
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

    test('6.4.7 Change usual place of residence', async () => {
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

    test('6.4.8 Change email', async () => {
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

  test('6.5 Upload supporting documents', async () => {
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

  test('6.6 Reason for correction', async () => {
    /*
     * Expected result: should
     * - navigate to reason for correction
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('reason')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page
      .getByLabel('Myself or an agent made a mistake (Clerical error)')
      .check()

    await page
      .locator('#additionalComment')
      .fill(declaration.registration.registrationNumber)

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('6.7 Correction summary', async () => {
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

    await expect(page.getByText('Me', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Myself or an agent made a mistake (Clerical error)')
    ).toBeVisible()
    await expect(
      page.getByText(declaration.registration.registrationNumber)
    ).toBeVisible()

    await page.getByLabel('No').check()

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
  test('6.8 Validate history in record audit', async () => {
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
