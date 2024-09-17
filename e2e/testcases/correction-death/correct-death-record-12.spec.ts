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
import { format, parseISO, subDays } from 'date-fns'
import { DeathDeclaration } from '../death/types'
import {
  createDeathDeclaration,
  DeathDeclarationInput,
  fetchDeclaration
} from '../death/helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial(' Correct record - 12', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

  let page: Page

  let declarationInput: DeathDeclarationInput

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

  const updatedEventDetails = {
    placeOfDeath: 'Other',
    deathLocation: {
      province: 'Chuminga',
      district: 'Soka',
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

  test('12.0 Shortcut declaration', async () => {
    let token = await getToken('k.mweene', 'test')
    declarationInput = {
      deceased: {
        usual: {
          province: 'Sulaka',
          district: 'Zobwe'
        }
      },
      event: {
        placeOfDeath: "Deceased's usual place of residence"
      }
    }
    const res = await createDeathDeclaration(token, declarationInput)
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })

    trackingId = res.trackingId

    token = await getToken('f.katongo', 'test')

    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchDeathRegistration as DeathDeclaration
  })

  test.describe('12.1 Print > Ready to issue', async () => {
    test('12.1.1 Print', async () => {
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

    test('12.1.2 Ready to issue', async () => {
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
    })

    test('12.1.3 Record audit', async () => {
      await page.getByText(formatName(declaration.deceased.name[0])).click()

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

  test('12.2 Correction requester: Me', async () => {
    await page.getByLabel('Me', { exact: true }).check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('12.3 Verify identity', async () => {
    /*
     * Expected result: should directly navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('12.4 Make correction', async () => {
    test.describe('12.4.1 Make correction on informant details', async () => {
      test('12.4.1.1 Change informant type', async () => {
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

      test('12.4.1.2 Change name', async () => {
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

      test('12.4.1.3 Change date of birth', async () => {
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

      test('12.4.1.4 Change nationality', async () => {
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

      test('12.4.1.5 Change id type', async () => {
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

      test('12.4.1.6 Change id', async () => {
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

      test('12.4.1.7 Change usual place of residence', async () => {
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

      test('12.4.1.8 Change email', async () => {
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
    test('12.4.2 Change place of death', async () => {
      await page
        .locator('#deathEvent-content #Place')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deathEvent details page
       * - focus on place of death
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('death-event-details')).toBeTruthy()
      expect(page.url().includes('#placeOfDeath')).toBeTruthy()

      await page.locator('#placeOfDeath').click()
      await page
        .getByText(updatedEventDetails.placeOfDeath, { exact: true })
        .click()

      await page.locator('#statePlaceofdeath').click()
      await page.getByText(updatedEventDetails.deathLocation.province).click()

      await page.locator('#districtPlaceofdeath').click()
      await page.getByText(updatedEventDetails.deathLocation.district).click()

      await page
        .locator('#cityPlaceofdeath')
        .fill(updatedEventDetails.deathLocation.town)

      await page
        .locator('#addressLine1UrbanOptionPlaceofdeath')
        .fill(updatedEventDetails.deathLocation.residentialArea)

      await page
        .locator('#addressLine2UrbanOptionPlaceofdeath')
        .fill(updatedEventDetails.deathLocation.street)

      await page
        .locator('#addressLine3UrbanOptionPlaceofdeath')
        .fill(updatedEventDetails.deathLocation.number)

      await page
        .locator('#postalCodePlaceofdeath')
        .fill(updatedEventDetails.deathLocation.zipCode)

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous place with strikethrough
       * - show updated place
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#deathEvent-content #Place').getByRole('deletion').nth(0)
      ).toHaveText("Deceased's usual place of residence")

      await expectAddress(
        page.locator('#deathEvent-content #Place'),
        {
          ...declaration.deceased.address[0],
          country: 'Farajaland',
          state: declarationInput.deceased!.usual!.province,
          district: declarationInput.deceased!.usual!.district
        },
        true
      )

      await expectAddress(page.locator('#deathEvent-content #Place'), {
        ...updatedEventDetails.deathLocation,
        country: 'Farajaland'
      })
    })
  })

  test('12.5 Upload supporting documents', async () => {
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

  test('12.6 Reason for correction', async () => {
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

  test('12.7 Correction summary', async () => {
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
        'Place of death (Death event details)' +
          "Deceased's usual place of residence" +
          'Farajaland' +
          declarationInput.deceased!.usual!.province +
          declarationInput.deceased!.usual!.district +
          '-' +
          declaration.deceased.address[0].city +
          declaration.deceased.address[0].line[2] +
          declaration.deceased.address[0].line[1] +
          declaration.deceased.address[0].line[0] +
          declaration.deceased.address[0].postalCode +
          'Other' +
          'Farajaland' +
          updatedEventDetails.deathLocation.province +
          updatedEventDetails.deathLocation.district +
          updatedEventDetails.deathLocation.town +
          updatedEventDetails.deathLocation.residentialArea +
          updatedEventDetails.deathLocation.street +
          updatedEventDetails.deathLocation.number +
          updatedEventDetails.deathLocation.zipCode
      )
    ).toBeVisible()

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

    await expect(page.getByText('Me', { exact: true })).toBeVisible()
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
      page.getByText(formatName(declaration.deceased.name[0]))
    ).toBeVisible()
  })

  test.describe('12.8 Correction Approval', async () => {
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

    test('12.8.1 Record audit by local registrar', async () => {
      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

      await page.locator('#name_0').click()
    })

    test('12.8.2 Correction review', async () => {
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

      await expect(page.getByText('Requested by' + 'Me')).toBeVisible()
      await expect(
        page.getByText(
          'Reason for request' +
            'Informant did not provide this information (Material omission)'
        )
      ).toBeVisible()

      await expect(
        page.getByText('Comments' + declaration.registration.registrationNumber)
      ).toBeVisible()

      await expect(
        page.getByText(
          'Place of death (Death event details)' +
            "Deceased's usual place of residence" +
            'Farajaland' +
            declarationInput.deceased!.usual!.province +
            declarationInput.deceased!.usual!.district +
            '-' +
            declaration.deceased.address[0].city +
            declaration.deceased.address[0].line[2] +
            declaration.deceased.address[0].line[1] +
            declaration.deceased.address[0].line[0] +
            declaration.deceased.address[0].postalCode +
            'Other' +
            'Farajaland' +
            updatedEventDetails.deathLocation.province +
            updatedEventDetails.deathLocation.district +
            updatedEventDetails.deathLocation.town +
            updatedEventDetails.deathLocation.residentialArea +
            updatedEventDetails.deathLocation.street +
            updatedEventDetails.deathLocation.number +
            updatedEventDetails.deathLocation.zipCode
        )
      ).toBeVisible()

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
        page.getByText(
          'Type of ID (Informant)-' + updatedInformantDetails.idType
        )
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
    })

    test('12.8.3 Approve correction', async () => {
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
        page.getByText(formatName(declaration.deceased.name[0]))
      ).toBeVisible()
    })

    test('12.8.4 Validate history in record audit', async () => {
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
