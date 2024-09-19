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
import { DeathDeclaration } from '../death/types'
import { createDeathDeclaration, fetchDeclaration } from '../death/helpers'
import { CREDENTIALS } from '../../constants'
import { random } from 'lodash'

test.describe.serial(' Correct record - 18', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

  let page: Page
  const updatedDeceasedDetails = {
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    gender: 'Female',
    age: random(20, 100),
    nationality: 'Canada',
    id: faker.random.numeric(10),
    idType: 'Passport',
    address: {
      province: 'Pualula',
      district: 'Pili',
      town: faker.address.city(),
      residentialArea: faker.address.county(),
      street: faker.address.streetName(),
      number: faker.address.buildingNumber(),
      zipCode: faker.address.zipCode()
    },
    maritalStatus: 'Married',
    NOdependants: '3'
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('18.0 Shortcut declaration', async () => {
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

  test.describe('18.1 Print > Ready to issue', async () => {
    test('18.1.1 print', async () => {
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

      await page.getByRole('button', { name: 'Print', exact: true }).click()

      await page.getByLabel('Print in advance').check()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Yes, print certificate' }).click()
      await page.getByRole('button', { name: 'Print', exact: true }).click()
    })
    test('18.1.2 Ready to issue', async () => {
      await page.getByRole('button', { name: 'Ready to issue' }).click()

      /*
       * Expected result: should
       * - be navigated to ready to isssue tab
       * - include the declaration in this tab
       */
      expect(page.url().includes('registration-home/readyToIssue')).toBeTruthy()
      await expectOutboxToBeEmpty(page)

      await expect(
        page.getByText(formatName(declaration.deceased.name[0]))
      ).toBeVisible()

      await page.getByText(formatName(declaration.deceased.name[0])).click()
    })
    test('18.1.3 Record audit', async () => {
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

  test('14.2 Correction requester: Court', async () => {
    await page.getByLabel('Court').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('14.3 Verify identity', async () => {
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

  test.describe('14.4.2 Correction made on child details', async () => {
    test('10.2.2.1 Change name', async () => {
      await page
        .locator('#deceased-content #Full')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's family name
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#familyNameEng')).toBeTruthy()

      await page
        .locator('#firstNamesEng')
        .fill(updatedDeceasedDetails.firstNames)
      await page
        .locator('#familyNameEng')
        .fill(updatedDeceasedDetails.familyName)

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
        .locator('#deceased-content #Full')
        .getByRole('deletion')
        .all()

      await expect(oldData[0]).toHaveText(
        declaration.deceased.name[0].firstNames
      )
      await expect(oldData[1]).toHaveText(
        declaration.deceased.name[0].familyName
      )

      await expect(
        page
          .locator('#deceased-content #Full')
          .getByText(updatedDeceasedDetails.firstNames)
      ).toBeVisible()
      await expect(
        page
          .locator('#deceased-content #Full')
          .getByText(updatedDeceasedDetails.familyName)
      ).toBeVisible()
    })

    test('10.2.2.2 Change gender', async () => {
      await page
        .locator('#deceased-content #Sex')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's gender
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#gender')).toBeTruthy()

      await page.locator('#gender').click()
      await page.getByText(updatedDeceasedDetails.gender).click()

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
        page.locator('#deceased-content #Sex').getByRole('deletion')
      ).toHaveText(declaration.deceased.gender, { ignoreCase: true })

      await expect(
        page
          .locator('#deceased-content #Sex')
          .getByText(updatedDeceasedDetails.gender)
      ).toBeVisible()
    })

    test('10.2.2.3 Change age', async () => {
      await page
        .locator('#deceased-content #Age')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's age
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#ageOfIndividualInYears')).toBeTruthy()

      await page
        .locator('#ageOfIndividualInYears')
        .fill(updatedDeceasedDetails.age.toString())

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
        page.locator('#deceased-content #Age').getByRole('deletion')
      ).toHaveText(
        joinValuesWith(
          [declaration.deceased.ageOfIndividualInYears, 'years'],
          ' '
        )
      )

      await expect(
        page
          .locator('#deceased-content #Age')
          .getByText(joinValuesWith([updatedDeceasedDetails.age, 'years'], ' '))
      ).toBeVisible()
    })

    test('10.2.2.4 Change nationality', async () => {
      await page
        .locator('#deceased-content #Nationality')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's nationality
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#nationality')).toBeTruthy()

      await page.locator('#nationality').click()
      await page.getByText(updatedDeceasedDetails.nationality).click()

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
        page.locator('#deceased-content #Nationality').getByRole('deletion')
      ).toHaveText('Farajaland')

      await expect(
        page
          .locator('#deceased-content #Nationality')
          .getByText(updatedDeceasedDetails.nationality)
      ).toBeVisible()
    })

    test('10.2.2.5 Change id type', async () => {
      await page
        .locator('#deceased-content #Type')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's id type
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#deceasedIdType')).toBeTruthy()

      await page.locator('#deceasedIdType').click()
      await page.getByText(updatedDeceasedDetails.idType).click()

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
        page.locator('#deceased-content #Type').getByRole('deletion')
      ).toHaveText('National ID')

      await expect(
        page
          .locator('#deceased-content #Type')
          .getByText(updatedDeceasedDetails.idType)
      ).toBeVisible()
    })

    test('10.2.2.6 Change id', async () => {
      await page
        .locator('#deceased-content #ID')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's id
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#deceasedPassport')).toBeTruthy()

      await page.locator('#deceasedPassport').fill(updatedDeceasedDetails.id)

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
          .locator('#deceased-content #ID')
          .getByText(updatedDeceasedDetails.id)
      ).toBeVisible()
    })

    test('10.2.2.7 Change usual place of residence', async () => {
      await page
        .locator('#deceased-content #Usual')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's Usual place of resiedence
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#countryPrimary')).toBeTruthy()

      await page.locator('#statePrimaryDeceased').click()
      await page.getByText(updatedDeceasedDetails.address.province).click()

      await page.locator('#districtPrimaryDeceased').click()
      await page.getByText(updatedDeceasedDetails.address.district).click()

      await page
        .locator('#cityPrimaryDeceased')
        .fill(updatedDeceasedDetails.address.town)

      await page
        .locator('#addressLine1UrbanOptionPrimaryDeceased')
        .fill(updatedDeceasedDetails.address.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPrimaryDeceased')
        .fill(updatedDeceasedDetails.address.street)

      await page
        .locator('#addressLine3UrbanOptionPrimaryDeceased')
        .fill(updatedDeceasedDetails.address.number)

      await page
        .locator('#postalCodePrimaryDeceased')
        .fill(updatedDeceasedDetails.address.zipCode)

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
        page.locator('#deceased-content #Usual'),
        {
          ...declaration.deceased.address[0],
          country: 'Farajaland',
          state: 'Sulaka',
          district: 'Zobwe'
        },
        true
      )

      await expect(
        page.locator('#deceased-content #Usual').getByText('Farajaland')
      ).toBeVisible()
      await expectAddress(
        page.locator('#deceased-content #Usual'),
        updatedDeceasedDetails.address
      )
    })

    test('10.2.2.8 Change marital status', async () => {
      await page
        .locator('#deceased-content #Marital')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's marital status
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#maritalStatus')).toBeTruthy()

      await page.locator('#maritalStatus').click()
      await page.getByText(updatedDeceasedDetails.maritalStatus).click()

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
        page.locator('#deceased-content #Marital').getByRole('deletion')
      ).toHaveText('-')

      await expect(
        page
          .locator('#deceased-content #Marital')
          .getByText(updatedDeceasedDetails.maritalStatus)
      ).toBeVisible()
    })

    test('10.2.2.9 Change number of depandants', async () => {
      await page
        .getByRole('row', { name: 'No. of dependants' })
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deceased's details page
       * - focus on deceased's number of depandants
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('deceased-view-group')).toBeTruthy()
      expect(page.url().includes('#numberOfDependants')).toBeTruthy()

      await page
        .locator('#numberOfDependants')
        .fill(updatedDeceasedDetails.NOdependants)

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show new number of depandants
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page
          .getByRole('row', { name: 'No. of dependants' })
          .getByText(updatedDeceasedDetails.NOdependants)
      ).toBeVisible()
    })
  })

  test('18.5 Upload supporting documents', async () => {
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

  test('18.6 Reason for correction', async () => {
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

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('18.7 Correction summary', async () => {
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
        'Full name (Deceased)' +
          formatName(declaration.deceased.name[0]) +
          formatName(updatedDeceasedDetails)
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Sex (Deceased)' +
          declaration.deceased.gender +
          updatedDeceasedDetails.gender
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        joinValuesWith(
          [
            'Age of deceased (Deceased)',
            declaration.deceased.ageOfIndividualInYears,
            updatedDeceasedDetails.age
          ],
          ''
        )
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Nationality (Deceased)Farajaland' + updatedDeceasedDetails.nationality
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Type of ID (Deceased)National ID' + updatedDeceasedDetails.idType
      )
    ).toBeVisible()
    await expect(
      page.getByText('ID Number (Deceased)-' + updatedDeceasedDetails.id)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Usual place of residence (Deceased)FarajalandSulakaZobwe-' +
          declaration.deceased.address[0].city +
          declaration.deceased.address[0].line[2] +
          declaration.deceased.address[0].line[1] +
          declaration.deceased.address[0].line[0] +
          declaration.deceased.address[0].postalCode +
          'Farajaland' +
          updatedDeceasedDetails.address.province +
          updatedDeceasedDetails.address.district +
          updatedDeceasedDetails.address.town +
          updatedDeceasedDetails.address.residentialArea +
          updatedDeceasedDetails.address.street +
          updatedDeceasedDetails.address.number +
          updatedDeceasedDetails.address.zipCode
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Marital status (Deceased)-' + updatedDeceasedDetails.maritalStatus
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'No. of dependants (Deceased)-' + updatedDeceasedDetails.NOdependants
      )
    ).toBeVisible()
    await expect(page.getByText('Court', { exact: true })).toBeVisible()

    await expect(
      page.getByText('Requested to do so by the court (Judicial order)')
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
      page.getByText(formatName(updatedDeceasedDetails))
    ).toBeVisible()
  })
  test('18.8 Validate history in record audit', async () => {
    await page.getByText(formatName(updatedDeceasedDetails)).click()

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
