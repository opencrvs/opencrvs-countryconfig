import { expect, test, type Page } from '@playwright/test'
import { createPIN, getToken, login } from '../../../helpers'
import faker from '@faker-js/faker'
import {
  ConvertEnumsToStrings,
  createDeclaration,
  fetchDeclaration
} from '../../birth/helpers'
import { BirthDeclaration, BirthInputDetails } from '../../birth/types'
import { format, parseISO, subDays } from 'date-fns'

test.describe.serial(' Correct record - 8', () => {
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

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('8.0 Shortcut declaration', async () => {
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

  test('8.1 Certificate preview', async () => {
    await login(page, 'j.musonda', 'test')
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

  test('8.2 Correction requester: someone else (Cousin)', async () => {
    await page.getByLabel('Someone else').check()
    await page.getByPlaceholder('Eg. Grandmother').fill('Cousin')
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('8.3 Verify identity', async () => {
    /*
     * Expected result: should Confirm
     * nothing
     */

    await page.getByRole('button', { name: 'Verified' }).click()

    expect(page.url().includes('correction')).toBeTruthy()

    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('8.4 Correction made on father details', async () => {
    test('8.4.1 Change name', async () => {
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

      await page.locator('#firstNamesEng').fill(updatedFatherDetails.firstNames)
      await page.locator('#familyNameEng').fill(updatedFatherDetails.familyName)

      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Back to review' }).click()

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

      await expect(oldData[0]).toHaveText(declaration.father.name[0].firstNames)
      await expect(oldData[1]).toHaveText(declaration.father.name[0].familyName)

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

    test('8.4.2 Change date of birth', async () => {
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

      await page.waitForTimeout(500)

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
      ).toHaveText(
        format(parseISO(declaration.father.birthDate), 'dd MMMM yyyy'),
        { ignoreCase: true }
      )

      await expect(
        page
          .locator('#father-content #Date')
          .getByText(
            format(parseISO(updatedFatherDetails.birthDate), 'dd MMMM yyyy')
          )
      ).toBeVisible()
    })

    test('8.4.3 Change nationality', async () => {
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

      await page.waitForTimeout(500)

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
      ).toHaveText('Farajaland', {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#father-content #Nationality')
          .getByText(updatedFatherDetails.nationality)
      ).toBeVisible()
    })

    test('8.4.4 Change id type', async () => {
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

      await page.waitForTimeout(500)

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
      ).toHaveText('National Id', {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#father-content #Type')
          .getByText(updatedFatherDetails.idType)
      ).toBeVisible()
    })

    test('8.4.5 Change id', async () => {
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

      await page.waitForTimeout(500)

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

    test('8.4.6 Change usual place of residence', async () => {
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

      await page.waitForTimeout(500)

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous Usual place of resiedence with strikethrough
       * - show updated Usual place of resiedence
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(1)
      ).toHaveText('Farajaland', {
        ignoreCase: true
      })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(2)
      ).toHaveText('Central', { ignoreCase: true })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(3)
      ).toHaveText('Ibombo', {
        ignoreCase: true
      })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(5)
      ).toHaveText(declaration.father.address[0].city, { ignoreCase: true })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(6)
      ).toHaveText(declaration.father.address[0].line[2], {
        ignoreCase: true
      })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(7)
      ).toHaveText(declaration.father.address[0].line[1], {
        ignoreCase: true
      })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(8)
      ).toHaveText(declaration.father.address[0].line[0], {
        ignoreCase: true
      })
      await expect(
        page.locator('#father-content #Usual').getByRole('deletion').nth(9)
      ).toHaveText(declaration.father.address[0].postalCode, {
        ignoreCase: true
      })

      await expect(
        page.locator('#father-content #Usual').getByText('Farajaland')
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.province)
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.district)
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.town)
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.residentialArea)
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.street)
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.number)
      ).toBeVisible()
      await expect(
        page
          .locator('#father-content #Usual')
          .getByText(updatedFatherDetails.address.zipCode)
      ).toBeVisible()
    })

    test('8.4.7 Change marital status', async () => {
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

      await page.waitForTimeout(500)

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

    test('8.4.8 Change level of education', async () => {
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

      await page.waitForTimeout(500)

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
      ).toHaveText('No Schooling', {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#father-content #Level')
          .getByText(updatedFatherDetails.educationLevel)
      ).toBeVisible()
    })
  })

  test('8.5 Upload supporting documents', async () => {
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

  test('8.6 Reason for correction', async () => {
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
    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('8.7 Correction summary', async () => {
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
        'Full name (father)' +
          declaration.father.name[0].firstNames +
          ' ' +
          declaration.father.name[0].familyName +
          updatedFatherDetails.firstNames +
          ' ' +
          updatedFatherDetails.familyName
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of birth (father)' +
          format(parseISO(declaration.father.birthDate), 'dd MMMM yyyy') +
          format(parseISO(updatedFatherDetails.birthDate), 'dd MMMM yyyy')
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

    await expect(page.getByText('Cousin')).toBeVisible()
    await expect(
      page.getByText(
        'Informant did not provide this information (Material omission)'
      )
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

    await expect(page.locator('#navigation_outbox')).not.toContainText('1', {
      timeout: 1000 * 30
    })

    await expect(
      page.getByText(
        declaration.child.name[0].firstNames +
          ' ' +
          declaration.child.name[0].familyName
      )
    ).toBeVisible()
  })
  test('8.8 Validate history in record audit', async () => {
    await page
      .getByText(
        declaration.child.name[0].firstNames +
          ' ' +
          declaration.child.name[0].familyName
      )
      .click()

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
