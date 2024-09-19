import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatDateTo_yyyyMMdd,
  formatName,
  getLocationNameFromFhirId,
  getToken,
  goBackToReview,
  goToSection,
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
import { format, parseISO, subDays } from 'date-fns'
import { CREDENTIALS } from '../../constants'

test.describe('1. Correct record - 1', () => {
  let declaration: BirthDeclaration
  let trackingId = ''

  const updatedChildDetails = {
    firstNames: faker.name.firstName('female'),
    familyName: faker.name.firstName('female'),
    gender: 'Female',
    birthDate: format(
      subDays(new Date(), Math.ceil(50 * Math.random())),
      'yyyy-MM-dd'
    ),
    birthLocation: 'Tembwe Rural Health Centre',
    attendantAtBirth: 'Nurse',
    typeOfBirth: 'Twin',
    weightAtBirth: '3.1'
  }

  test.beforeAll(async () => {
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

  test.describe('1.1 Validate verbiage', async () => {
    test.beforeEach(async ({ page }) => {
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
    })

    test('1.1.1 Validate record audit page', async ({ page }) => {
      /*
       * Expected result: should
       * - See in header child's name and correct record option
       * - Navigate to record audit page
       * - See status, event, trackingId, BRN, DOB, Place of birth, Informant contact
       */
      await expect(
        page.getByText(formatName(declaration.child.name[0]))
      ).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Correct record' })
      ).toBeVisible()

      expect(page.url().includes('record-audit')).toBeTruthy()

      await expect(
        page.getByText(`Status${declaration.registration.status[0].type}`)
      ).toBeVisible()
      await expect(
        page.getByText(`Event${declaration.registration.type}`)
      ).toBeVisible()
      await expect(page.getByText(`Tracking ID${trackingId}`)).toBeVisible()
      await expect(
        page.getByText(
          `Registration No${declaration.registration.registrationNumber}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Date of birth${format(
          parseISO(declaration.child.birthDate),
          'MMMM dd, yyyy'
        )}
    `)
      ).toBeVisible()
      // await expect(page.getByText(`Place of birth${}`)).toBeVisible()
      await expect(
        page.getByText(declaration.registration.contactEmail)
      ).toBeVisible()
    })

    test('1.1.2 Validate correction requester page', async ({ page }) => {
      await page.getByRole('button', { name: 'Correct record' }).click()

      /*
       * Expected result: should
       * - Navigate to Correction Requester Page
       */
      await expect(page.getByText('Correction requester')).toBeVisible()
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('corrector')).toBeTruthy()

      /*
       * Expected result: should say
       * - Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.
       */
      await expect(
        page.getByText(
          'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.'
        )
      ).toBeVisible()
    })

    test('1.1.3 Validate identity verification page for Mother', async ({
      page
    }) => {
      await page.getByRole('button', { name: 'Correct record' }).click()

      await page.getByLabel('Mother').check()
      await page.getByRole('button', { name: 'Continue' }).click()

      /*
       * Expected result: should show
       * Text: Verify their identity
       * Button: Verified
       * Button: Identity does not match
       */
      await expect(page.getByText('Verify their identity')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Verified' })).toBeVisible()
      await expect(
        page.getByRole('button', { name: 'Identity does not match' })
      ).toBeVisible()

      /*
       * Expected result: should Confirm
       * ID
       * First Name
       * Last Name
       * Date of Birth
       * Nationality
       */
      await expect(
        page.getByText(
          `ID: National Id | ${declaration.mother.identifier[0].id}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(
          `First name(s): ${declaration.mother.name[0].firstNames}`
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Last name: ${declaration.mother.name[0].familyName}`)
      ).toBeVisible()
      await expect(
        page.getByText(
          `Age:
        ${declaration.mother.ageOfIndividualInYears}
        `
        )
      ).toBeVisible()
      await expect(
        page.getByText(`Nationality: ${declaration.mother.nationality}`)
      ).toBeVisible()
    })
  })

  test.describe.serial('1.2 Record correction by mother', async () => {
    let page: Page

    let childBirthLocationName: string | undefined

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()

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

      await page.getByRole('button', { name: 'Correct record' }).click()

      await page.getByLabel('Mother').check()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    test.afterAll(async () => {
      await page.close()
    })

    test('1.2.1 Verify identity', async () => {
      await page.getByRole('button', { name: 'Verified' }).click()

      /*
       * Expected result: should navigate to review page
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()
    })

    test.describe('1.2.2 Correction made on child details', async () => {
      test('1.2.2.1 Change name', async () => {
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

        await page
          .locator('#firstNamesEng')
          .fill(updatedChildDetails.firstNames)
        await page
          .locator('#familyNameEng')
          .fill(updatedChildDetails.familyName)

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

        await expect(oldData[0]).toHaveText(
          declaration.child.name[0].firstNames
        )
        await expect(oldData[1]).toHaveText(
          declaration.child.name[0].familyName
        )

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

      test('1.2.2.2 Change gender', async () => {
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

      test('1.2.2.3 Change date of birth', async () => {
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
         * - show previous gender with strikethrough
         * - show updated gender
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

      test('1.2.2.4 Change place of delivery', async () => {
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

        await page
          .locator('#birthLocation')
          .fill(updatedChildDetails.birthLocation.slice(0, 2))
        await page.getByText(updatedChildDetails.birthLocation).click()

        await page.getByRole('button', { name: 'Back to review' }).click()

        /*
         * Expected result: should
         * - redirect to review page
         * - show previous place of birth with strikethrough
         * - show updated place of birth
         */

        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()

        expect(declaration.eventLocation).toBeDefined()

        childBirthLocationName = await getLocationNameFromFhirId(
          declaration.eventLocation!.id
        )
        expect(childBirthLocationName).toBeDefined()

        await expect(
          page.locator('#child-content #Place').getByRole('deletion').nth(1)
        ).toHaveText(childBirthLocationName!, {
          ignoreCase: true
        })

        await expect(
          page
            .locator('#child-content #Place')
            .getByText(updatedChildDetails.birthLocation)
        ).toBeVisible()
      })

      test('1.2.2.5 Change attendant at birth', async () => {
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

      test('1.2.2.6 Change type of birth', async () => {
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
    })

    test('1.2.3 Upload supporting documents', async () => {
      await page.getByRole('button', { name: 'Continue' }).click()

      /*
       * Expected result: should
       * - navigate to supporting document
       * - continue button is disabled
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('supportingDocuments')).toBeTruthy()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()

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

    test('1.2.4 Reason for correction', async () => {
      /*
       * Expected result: should
       * - navigate to reason for correction
       * - continue button is disabled
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('reason')).toBeTruthy()

      await expect(
        page.getByRole('button', { name: 'Continue' })
      ).toBeDisabled()

      await page
        .getByLabel('Myself or an agent made a mistake (Clerical error)')
        .check()

      await page
        .locator('#additionalComment')
        .fill(declaration.registration.registrationNumber)

      /*
       * Expected result: should enable the continue button
       */

      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test.describe('1.2.5 Correction summary', async () => {
      test('1.2.5.1 Go back to review', async () => {
        /* Expected result: should
         * - navigate to correction summary
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('summary')).toBeTruthy()

        await page
          .getByRole('button', { name: 'Back to review', exact: true })
          .click()

        /* Expected result: should
         * - navigate to correction review
         */
        expect(page.url().includes('correction')).toBeTruthy()
        expect(page.url().includes('review')).toBeTruthy()
      })

      test('1.2.5.2 Change weight at birth', async () => {
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

      test('1.2.5.3 Validate information in correction summary page', async () => {
        await goToSection(page, 'summary')
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
            'Full name (Child)' +
              formatName(declaration.child.name[0]) +
              formatName(updatedChildDetails)
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Sex (Child)' +
              declaration.child.gender +
              updatedChildDetails.gender
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
              'Health Institution' +
              childBirthLocationName +
              'Health Institution' +
              updatedChildDetails.birthLocation
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
          page.getByText(formatName(declaration.mother.name[0]))
        ).toBeVisible()
        await expect(page.getByText('Verified')).toBeVisible()
        await expect(
          page.getByText('Myself or an agent made a mistake (Clerical error)')
        ).toBeVisible()
        await expect(
          page.getByText(declaration.registration.registrationNumber)
        ).toBeVisible()

        await page.getByLabel('Yes').check()
        await page
          .locator('#correctionFees\\.nestedFields\\.totalFees')
          .fill('15')

        await uploadImage(page, page.locator('#upload_document'))

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
    })

    test.describe('1.2.6 Correction Approval', async () => {
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

      test('1.2.6.1 Record audit by local registrar', async () => {
        await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
        await page.getByPlaceholder('Search for a tracking ID').press('Enter')
        await page.locator('#ListItemAction-0-icon').click()
        await page.getByRole('button', { name: 'Assign', exact: true }).click()

        await page.locator('#name_0').click()
      })

      test('1.2.6.2 Correction review', async () => {
        await page.getByRole('button', { name: 'Review', exact: true }).click()

        /*
         * Expected result: should show
         * - Submitter
         * - Requested by
         * - Reason for request
         * - Comments
         * - Original vs correction
         */

        await expect(
          page.getByText('Submitter' + 'Felix Katongo')
        ).toBeVisible()

        await expect(
          page.getByText(
            'Requested by' + formatName(declaration.mother.name[0])
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Reason for request' +
              'Myself or an agent made a mistake (Clerical error)'
          )
        ).toBeVisible()
        await expect(
          page.getByText(
            'Comments' + declaration.registration.registrationNumber
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Full name (Child)' +
              formatName(declaration.child.name[0]) +
              formatName(updatedChildDetails)
          )
        ).toBeVisible()

        await expect(
          page.getByText(
            'Sex (Child)' +
              declaration.child.gender +
              updatedChildDetails.gender
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
              'Health Institution' +
              childBirthLocationName +
              'Health Institution' +
              updatedChildDetails.birthLocation
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
      })

      test('1.2.6.3 Approve correction', async () => {
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
          page.getByText(formatName(updatedChildDetails))
        ).toBeVisible()
      })
      test.describe('1.2.6.4 Validate history in record audit', async () => {
        test('1.2.6.4.1 Validate entries in record audit', async () => {
          await page.getByText(formatName(updatedChildDetails)).click()

          await page.getByLabel('Assign record').click()
          await page
            .getByRole('button', { name: 'Assign', exact: true })
            .click()

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

        test('1.2.6.4.2 Validate correction requested modal', async () => {
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

          await expect(page.getByText('Requested by' + 'Mother')).toBeVisible()
          await expect(page.getByText('ID check' + 'Verified')).toBeVisible()
          await expect(
            page.getByText(
              'Reason for request' +
                'Myself or an agent made a mistake (Clerical error)'
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Comment' + declaration.registration.registrationNumber
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'First name(s) (Child)' +
                declaration.child.name[0].firstNames +
                updatedChildDetails.firstNames
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Last name (Child)' +
                declaration.child.name[0].familyName +
                updatedChildDetails.familyName
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Sex (Child)' +
                declaration.child.gender +
                updatedChildDetails.gender
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Date of birth (Child)' +
                formatDateTo_yyyyMMdd(declaration.child.birthDate) +
                formatDateTo_yyyyMMdd(updatedChildDetails.birthDate)
            )
          ).toBeVisible()

          await expect(
            page.getByText(
              'Health Institution (Child)' +
                childBirthLocationName +
                updatedChildDetails.birthLocation
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

          await page
            .getByRole('heading', { name: 'Correction requested' })
            .locator('xpath=following-sibling::*[1]')
            .click()
        })

        test('1.2.6.4.3 Validate correction approved modal', async () => {
          const correctionApprovedRow = page.locator(
            '#listTable-task-history #row_6'
          )
          await correctionApprovedRow.getByText('Correction approved').click()

          const time = await correctionApprovedRow
            .locator('span')
            .nth(1)
            .innerText()

          const reviewer = await correctionApprovedRow
            .locator('span')
            .nth(2)
            .innerText()

          /*
           * Expected result: Should show
           * - Correction approved header
           * - Reviewer & time
           */

          await expect(
            page.getByRole('heading', { name: 'Correction approved' })
          ).toBeVisible()

          await expect(page.getByText(reviewer + ' — ' + time)).toBeVisible()
          await page
            .getByRole('heading', { name: 'Correction approved' })
            .locator('xpath=following-sibling::*[1]')
            .click()
        })
      })
    })
  })
})
