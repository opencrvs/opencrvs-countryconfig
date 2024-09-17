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
  BirthDetails,
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../birth/helpers'
import { BirthDeclaration, BirthInputDetails } from '../birth/types'
import { format, subDays } from 'date-fns'
import { CREDENTIALS } from '../../constants'

test.describe.serial(' Correct record - 5', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  let declarationInput: BirthDetails

  let page: Page
  const updatedChildDetails = {
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    gender: 'Female',
    birthDate: format(
      subDays(new Date(), Math.ceil(50 * Math.random())),
      'yyyy-MM-dd'
    ),
    placeOfBirth: 'Other',
    birthLocation: {
      state: 'Sulaka',
      district: 'Irundu',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    },
    attendantAtBirth: 'Nurse',
    typeOfBirth: 'Twin',
    weightAtBirth: '3.1',
    reason: 'Change of mind'
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('5.0 Shortcut declaration', async () => {
    let token = await getToken('k.mweene', 'test')
    declarationInput = {
      child: {
        firstNames: faker.name.firstName(),
        familyName: faker.name.firstName(),
        gender: 'male',
        placeOfBirth: 'Residential address',
        birthLocation: {
          state: 'Pualula',
          district: 'Ienge'
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

  test('5.1 Certificate preview', async () => {
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
    await page.getByRole('button', { name: 'No, make correction' }).click()
  })

  test('5.2 Correction requester: another registration agent or field agent', async () => {
    await page.getByLabel('Another registration agent or field agent').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('5.3 Verify identity', async () => {
    /*
     * Expected result:
     * - should not show verify identity
     * - should directly navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('5.4.2 Correction made on child details', async () => {
    test('5.4.2.1 Change name', async () => {
      await page
        .locator('#child-content #Full')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's family name
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#familyNameEng')).toBeTruthy()

      await page.locator('#firstNamesEng').fill(updatedChildDetails.firstNames)
      await page.locator('#familyNameEng').fill(updatedChildDetails.familyName)

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
        .locator('#child-content #Full')
        .getByRole('deletion')
        .all()

      await expect(oldData[0]).toHaveText(declaration.child.name[0].firstNames)
      await expect(oldData[1]).toHaveText(declaration.child.name[0].familyName)

      await expect(
        page
          .locator('#child-content #Full')
          .getByText(updatedChildDetails.firstNames)
      ).toBeVisible()
      await expect(
        page
          .locator('#child-content #Full')
          .getByText(updatedChildDetails.familyName)
      ).toBeVisible()
    })

    test('5.4.2.2 Change gender', async () => {
      await page
        .locator('#child-content #Sex')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's gender
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#gender')).toBeTruthy()

      await page.locator('#gender').click()
      await page.getByText(updatedChildDetails.gender).click()

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
        page.locator('#child-content #Sex').getByRole('deletion')
      ).toHaveText(declaration.child.gender, { ignoreCase: true })

      await expect(
        page
          .locator('#child-content #Sex')
          .getByText(updatedChildDetails.gender)
      ).toBeVisible()
    })

    test('5.4.2.3 Change date of birth', async () => {
      await page
        .locator('#child-content #Date')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's date of birth
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#childBirthDate')).toBeTruthy()

      const birthDay = updatedChildDetails.birthDate.split('-')

      await page.getByPlaceholder('dd').fill(birthDay[2])
      await page.getByPlaceholder('mm').fill(birthDay[1])
      await page.getByPlaceholder('yyyy').fill(birthDay[0])

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous date of birth with strikethrough
       * - show updated date of birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#child-content #Date').getByRole('deletion')
      ).toHaveText(formatDateTo_ddMMMMyyyy(declaration.child.birthDate))

      await expect(
        page
          .locator('#child-content #Date')
          .getByText(formatDateTo_ddMMMMyyyy(updatedChildDetails.birthDate))
      ).toBeVisible()
    })

    test('5.4.2.4 Change place of delivery', async () => {
      await page
        .locator('#child-content #Place')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's place of birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#placeOfBirth')).toBeTruthy()

      await page.locator('#placeOfBirth').click()
      await page.getByText(updatedChildDetails.placeOfBirth).click()

      await page.locator('#statePlaceofbirth').click()
      await page.getByText(updatedChildDetails.birthLocation.state).click()

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

      await goBackToReview(page)

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
      ).toHaveText(declarationInput.child.placeOfBirth!)

      await expectAddress(
        page.locator('#child-content #Place'),
        {
          ...declaration.eventLocation.address,
          ...declarationInput.child.birthLocation!,
          country: 'Farajaland'
        },
        true
      )

      await expect(
        page
          .locator('#child-content #Place')
          .getByText(updatedChildDetails.placeOfBirth)
      ).toBeVisible()

      await expectAddress(page.locator('#child-content #Place'), {
        ...updatedChildDetails.birthLocation,
        country: 'Farajaland'
      })
    })

    test('5.4.2.5 Change attendant at birth', async () => {
      await page
        .locator('#child-content #Attendant')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's Attendant at birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#attendantAtBirth')).toBeTruthy()

      await page.locator('#attendantAtBirth').click()
      await page.getByText(updatedChildDetails.attendantAtBirth).click()

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous Attendant at birth with strikethrough
       * - show updated Attendant at birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      expect(declaration.attendantAtBirth).toBeDefined

      await expect(
        page.locator('#child-content #Attendant').getByRole('deletion')
      ).toHaveText(declaration.attendantAtBirth!, { ignoreCase: true })

      await expect(
        page
          .locator('#child-content #Attendant')
          .getByText(updatedChildDetails.attendantAtBirth)
      ).toBeVisible()
    })

    test('5.4.2.6 Change type of birth', async () => {
      await page
        .locator('#child-content #Type')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's type of birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#birthType')).toBeTruthy()

      await page.locator('#birthType').click()
      await page.getByText(updatedChildDetails.typeOfBirth).click()

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous type of birth with strikethrough
       * - show updated type of birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      expect(declaration.birthType).toBeDefined

      await expect(
        page.locator('#child-content #Type').getByRole('deletion')
      ).toHaveText(declaration.birthType!, { ignoreCase: true })

      await expect(
        page
          .locator('#child-content #Type')
          .getByText(updatedChildDetails.typeOfBirth)
      ).toBeVisible()
    })

    test('5.4.2.7 Change weight at birth', async () => {
      await page
        .locator('#child-content #Weight')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to child's details page
       * - focus on child's weight at birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('child-view-group')).toBeTruthy()
      expect(page.url().includes('#weightAtBirth')).toBeTruthy()

      await page
        .locator('#weightAtBirth')
        .fill(updatedChildDetails.weightAtBirth)

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous weight at birth with strikethrough
       * - show updated weight at birth
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      expect(declaration.weightAtBirth).toBeDefined

      await expect(
        page.locator('#child-content #Weight').getByRole('deletion')
      ).toHaveText(declaration.weightAtBirth! + ' kilograms (kg)')

      await expect(
        page
          .locator('#child-content #Weight')
          .getByText(updatedChildDetails.weightAtBirth + ' kilograms (kg)')
      ).toBeVisible()
    })
  })

  test('5.5 Upload supporting documents', async () => {
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

  test('5.6 Reason for correction', async () => {
    /*
     * Expected result: should
     * - navigate to reason for correction
     * - continue button is disabled
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('reason')).toBeTruthy()

    await expect(page.getByRole('button', { name: 'Continue' })).toBeDisabled()

    await page.getByLabel('Other').check()
    await page
      .locator('#type\\.nestedFields\\.otherReason')
      .fill(updatedChildDetails.reason)
    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('5.7 Correction summary', async () => {
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
        'Full name (Child)' +
          formatName(declaration.child.name[0]) +
          formatName(updatedChildDetails)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Sex (Child)' + declaration.child.gender + updatedChildDetails.gender
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of birth (Child)' +
          formatDateTo_ddMMMMyyyy(declaration.child.birthDate) +
          formatDateTo_ddMMMMyyyy(updatedChildDetails.birthDate)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Place of delivery (Child)' +
          declarationInput.child.placeOfBirth! +
          'Farajaland' +
          declarationInput.child.birthLocation!.state +
          declarationInput.child.birthLocation!.district +
          '-' +
          declaration.eventLocation.address.city +
          declaration.eventLocation.address.line[2] +
          declaration.eventLocation.address.line[1] +
          declaration.eventLocation.address.line[0] +
          declaration.eventLocation.address.postalCode +
          updatedChildDetails.placeOfBirth +
          'Farajaland' +
          updatedChildDetails.birthLocation.state +
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
        'Attendant at birth (Child)' +
          declaration.attendantAtBirth +
          updatedChildDetails.attendantAtBirth
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of birth (Child)' +
          declaration.birthType +
          updatedChildDetails.typeOfBirth
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Weight at birth (Child)' +
          declaration.weightAtBirth +
          updatedChildDetails.weightAtBirth
      )
    ).toBeVisible()

    await expect(
      page.getByText('Another registration agent or field agent')
    ).toBeVisible()
    await expect(page.getByText(updatedChildDetails.reason)).toBeVisible()

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

    await expect(page.getByText(formatName(updatedChildDetails))).toBeVisible()
  })
  test('5.8 Validate history in record audit', async () => {
    await page.getByText(formatName(updatedChildDetails)).click()

    await page.getByLabel('Assign record').click()

    if (await page.getByText('Unassign record?', { exact: true }).isVisible())
      await page.getByRole('button', { name: 'Cancel', exact: true }).click()
    else if (
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
