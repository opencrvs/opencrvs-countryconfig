import { expect, test, type Page } from '@playwright/test'
import { formatDateTo_dMMMMyyyy, getToken, loginToV2 } from '../../helpers'
import { faker } from '@faker-js/faker'
import { format, subDays } from 'date-fns'
import { CREDENTIALS } from '../../constants'
import {
  createDeclaration,
  Declaration
} from '../v2-test-data/birth-declaration'
import { expectInUrl } from '../../v2-utils'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '../v2-print-certificate/birth/helpers'

test.describe.serial('Correct record - 2', () => {
  let declaration: Declaration
  let trackingId: string | undefined
  let eventId: string
  let page: Page

  const updatedChildDetails = {
    firstNames: faker.person.firstName('male'),
    familyName: faker.person.firstName('male'),
    gender: 'Male',
    birthDate: format(
      subDays(new Date(), Math.ceil(15 * Math.random()) + 5),
      'yyyy-MM-dd'
    ),
    birthLocation: 'Tembwe Rural Health Centre',
    attendantAtBirth: 'Nurse',
    typeOfBirth: 'Twin',
    weightAtBirth: '3.1'
  }

  const fatherDetails = {
    'father.detailsNotAvailable': false,
    'father.name': {
      firstname: faker.person.firstName(),
      surname: faker.person.lastName()
    },
    'father.dob': '1995-09-12',
    'father.nationality': 'FAR',
    'father.idType': 'NATIONAL_ID',
    'father.nid': faker.string.numeric(10),
    'father.addressSameAs': 'YES'
  }

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    // Create declaration with father details available
    const res = await createDeclaration(
      token,
      fatherDetails,
      undefined,
      'HEALTH_FACILITY'
    )
    declaration = res.declaration
    trackingId = res.trackingId
    eventId = res.eventId
    page = await browser.newPage()
  })

  test('2.1 Certificate preview', async () => {
    await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: 'Verified', exact: true }).click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()

    await page.getByRole('button', { name: 'No, make correction' }).click()
  })

  test('2.2 Select requester and reason', async () => {
    await page.locator('#requester____type').click()
    await page.getByText('Father', { exact: true }).click()

    await page.locator('#reason____option').click()
    await page
      .getByText('Informant provided incorrect information (Material error)', {
        exact: true
      })
      .click()

    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  })

  test('2.3 Fill correction form', async () => {
    await expect(page.getByText('Type of ID')).toBeVisible()
    await expect(page.getByText('National ID')).toBeVisible()

    await expect(page.getByText('ID Number')).toBeVisible()
    await expect(page.getByText(fatherDetails['father.nid'])).toBeVisible()

    await expect(page.getByText("Father's name")).toBeVisible()
    await expect(
      page.getByText(
        `${fatherDetails['father.name'].firstname} ${fatherDetails['father.name'].surname}`
      )
    ).toBeVisible()

    await expect(page.getByText('Date of birth')).toBeVisible()
    await expect(
      page.getByText(formatDateTo_dMMMMyyyy(fatherDetails['father.dob']))
    ).toBeVisible()

    await expect(page.getByText('Nationality')).toBeVisible()
    await expect(page.getByText('Farajaland')).toBeVisible()

    await page.getByRole('button', { name: 'Identity does not match' }).click()

    await expect(page.getByText('Correct without proof of ID?')).toBeVisible()
    await expect(
      page.getByText(
        'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification'
      )
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()
    await page
      .locator('#fees____amount')
      .fill(faker.number.int({ min: 1, max: 1000 }).toString())

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test.describe('2.4 Make correction', async () => {
    test('2.4.1 Change informant details', async () => {
      await page.getByTestId('change-button-informant.relation').click()

      await expectInUrl(
        page,
        `/events/correction/${eventId}/pages/informant?from=review#informant____relation`
      )

      await page.locator('#informant____relation').click()
      await page.getByText('Brother', { exact: true }).click()

      await page.locator('#firstname').fill(faker.person.firstName())
      await page.locator('#surname').fill(faker.person.lastName())
      await page.getByLabel('Exact date of birth unknown').check()
      await page
        .locator('#informant____age')
        .fill(faker.number.int({ min: 1, max: 100 }).toString())

      await page.locator('#informant____email').fill(faker.internet.email())

      await page.locator('#informant____idType').click()
      await page.getByText('Birth Registration Number', { exact: true }).click()

      await page.locator('#informant____brn').fill(faker.string.numeric(10))

      await page.getByRole('button', { name: 'Back to review' }).click()

      await expectInUrl(page, `/events/correction/${eventId}/review`)

      await expect(
        page.getByTestId('row-value-informant.relation').getByRole('deletion')
      ).toHaveText('Mother')

      await expect(
        page.getByTestId('row-value-informant.relation')
      ).toContainText('Brother')
    })

    test('2.4.2 Change place of delivery', async () => {
      await page.getByTestId('change-button-child.placeOfBirth').click()

      await expectInUrl(
        page,
        `/events/correction/${eventId}/pages/child?from=review#child____placeOfBirth`
      )

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText('Residential address', {
          exact: true
        })
        .click()

      await page
        .locator(
          '#child____address____privateHome-form-input #country-form-input input'
        )
        .fill('Far')

      await page
        .locator(
          '#child____address____privateHome-form-input #country-form-input'
        )
        .getByText('Farajaland', { exact: true })
        .click()

      await page.getByTestId('text__town').fill(faker.location.city())
      await page.getByTestId('text__street').fill(faker.location.street())

      await page.getByRole('button', { name: 'Back to review' }).click()
    })
  })

  test('2.7 Correction summary', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    // TODO: asseert
    await expect(page.getByText('RequesterFather')).toBeVisible()
    await expect(
      page.getByText(
        'Reason for correctionInformant provided incorrect information (Material error)'
      )
    ).toBeVisible()

    await expect(
      page.getByText('Place of deliveryHealth InstitutionResidential address')
    ).toBeVisible()

    await expect(
      page.getByText('Relationship to childMotherBrother')
    ).toBeVisible()

    await page
      .getByRole('button', { name: 'Submit correction request' })
      .click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expectInUrl(page, `/events/overview/${eventId}`)
  })

  // @TODO: create test after features are implemented

  //   test.describe('2.8 Correction Approval', async () => {
  //     test.beforeAll(async ({ browser }) => {
  //       await page.close()

  //       page = await browser.newPage()

  //       await login(
  //         page,
  //         CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
  //         CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
  //       )
  //       await createPIN(page)
  //     })

  //     test('2.8.1 Record audit by local registrar', async () => {
  //       await auditRecord({
  //         page,
  //         name: formatName(declaration.child.name[0]),
  //         trackingId
  //       })
  //       await assignRecord(page)
  //     })

  //     test('2.8.2 Correction review', async () => {
  //       await page.getByRole('button', { name: 'Action' }).first().click()
  //       await getAction(page, 'Review correction request').click()
  //       /*
  //        * Expected result: should show
  //        * - Submitter
  //        * - Requested by
  //        * - Reason for request
  //        * - Comments
  //        * - Original vs correction
  //        */

  //       await expect(page.getByText('Submitter' + 'Felix Katongo')).toBeVisible()

  //       await expect(
  //         page.getByText('Requested by' + formatName(declaration.father.name[0]))
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Reason for request' +
  //             'Informant provided incorrect information (Material error)'
  //         )
  //       ).toBeVisible()

  //       /*
  //       @ToDo: assert this after https://github.com/opencrvs/opencrvs-core/issues/7505 is solved
  //       await expect(
  //         page.getByText(
  //           'Place of delivery (Child)' +
  //             'Health Institution' +
  //             'Farajaland' +
  //             'Central' +
  //             'Ibombo' +
  //             '-' +
  //             '-' +
  //             '-' +
  //             '-' +
  //             '-' +
  //             '-' +
  //             'Residential address' +
  //             'Farajaland' +
  //             updatedChildDetails.birthLocation.province +
  //             updatedChildDetails.birthLocation.district +
  //             updatedChildDetails.birthLocation.town +
  //             updatedChildDetails.birthLocation.residentialArea +
  //             updatedChildDetails.birthLocation.street +
  //             updatedChildDetails.birthLocation.number +
  //             updatedChildDetails.birthLocation.zipCode
  //         )
  //       ).toBeVisible()
  // */
  //       await expect(
  //         page.getByText(
  //           'Relationship to child (Informant)' +
  //             declaration.informant.relationship +
  //             updatedInformantDetails.relationship
  //         )
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Full name (informant)' +
  //             formatName(declaration.informant.name[0]) +
  //             formatName(updatedInformantDetails)
  //         )
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Date of birth (informant)' +
  //             formatDateTo_ddMMMMyyyy(declaration.informant.birthDate) +
  //             formatDateTo_ddMMMMyyyy(updatedInformantDetails.birthDate)
  //         )
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Nationality (Informant)Farajaland' +
  //             updatedInformantDetails.nationality
  //         )
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Type of ID (Informant)National ID' + updatedInformantDetails.idType
  //         )
  //       ).toBeVisible()
  //       await expect(
  //         page.getByText('ID Number (Informant)-' + updatedInformantDetails.id)
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Usual place of residence (Informant)FarajalandCentralIbombo-' +
  //             declaration.informant.address[0].city +
  //             declaration.informant.address[0].line[2] +
  //             declaration.informant.address[0].line[1] +
  //             declaration.informant.address[0].line[0] +
  //             declaration.informant.address[0].postalCode +
  //             'Farajaland' +
  //             updatedInformantDetails.address.province +
  //             updatedInformantDetails.address.district +
  //             updatedInformantDetails.address.town +
  //             updatedInformantDetails.address.residentialArea +
  //             updatedInformantDetails.address.street +
  //             updatedInformantDetails.address.number +
  //             updatedInformantDetails.address.zipCode
  //         )
  //       ).toBeVisible()

  //       await expect(
  //         page.getByText(
  //           'Email (Informant)' +
  //             declaration.registration.contactEmail +
  //             updatedInformantDetails.email
  //         )
  //       ).toBeVisible()
  //     })

  //     test('2.8.3 Reject correction', async () => {
  //       await page.getByRole('button', { name: 'Reject', exact: true }).click()
  //       await page
  //         .locator('#rejectionRaisonOfCorrection')
  //         .fill('Wrong information')
  //       await page.getByRole('button', { name: 'Confirm', exact: true }).click()

  //       /*
  //        * Expected result: should
  //        * - be navigated to ready to print tab
  //        * - include the updated declaration in this tab
  //        */
  //       expect(page.url().includes('registration-home/print')).toBeTruthy()
  //       await page.getByRole('button', { name: 'Outbox' }).click()
  //       await expectOutboxToBeEmpty(page)
  //       await page.getByRole('button', { name: 'Ready to print' }).click()

  //       await expect(
  //         page.getByText(formatName(declaration.child.name[0])).first()
  //       ).toBeVisible()
  //     })

  //     test.describe('2.8.4 Validate history in record audit', async () => {
  //       test('2.8.4.1 Validate entries in record audit', async () => {
  //         await auditRecord({
  //           page,
  //           name: formatName(declaration.child.name[0]),
  //           trackingId
  //         })

  //         await assignRecord(page)

  //         /*
  //          * Expected result: should show in task history
  //          * - Correction requested
  //          * - Correction rejected
  //          */

  //         await expect(
  //           page
  //             .locator('#listTable-task-history')
  //             .getByRole('button', { name: 'Correction requested' })
  //         ).toBeVisible()

  //         await expect(
  //           page
  //             .locator('#listTable-task-history')
  //             .getByRole('button', { name: 'Correction rejected' })
  //         ).toBeVisible()
  //       })

  //       // TODO: remove skip when there is a fix related correction audit history
  //       test.skip('2.8.4.2 Validate correction requested modal', async () => {
  //         const correctionRequestedRow = page.locator(
  //           '#listTable-task-history #row_5'
  //         )
  //         await correctionRequestedRow.getByText('Correction requested').click()

  //         const time = await correctionRequestedRow
  //           .locator('span')
  //           .nth(1)
  //           .innerText()

  //         const requester = await correctionRequestedRow
  //           .locator('span')
  //           .nth(2)
  //           .innerText()

  //         /*
  //          * Expected result: Should show
  //          * - Correction requested header
  //          * - Requester & time
  //          * - Requested by
  //          * - Id check
  //          * - Reason
  //          * - Comment
  //          * - Original vs Correction
  //          */

  //         await expect(
  //           page.getByRole('heading', { name: 'Correction requested' })
  //         ).toBeVisible()

  //         await expect(page.getByText(requester + ' — ' + time)).toBeVisible()

  //         await expect(page.getByText('Requested by' + 'Father')).toBeVisible()
  //         await expect(
  //           page.getByText('ID check' + 'Identity does not match')
  //         ).toBeVisible()
  //         await expect(
  //           page.getByText(
  //             'Reason for request' +
  //               'Informant provided incorrect information (Material error)'
  //           )
  //         ).toBeVisible()

  //         await expect(page.getByText('Comment')).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Place of delivery (Child)' +
  //               'Health Institution' +
  //               'Residential address'
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Province (Child)' + updatedChildDetails.birthLocation.province
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'District (Child)' + updatedChildDetails.birthLocation.district
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Town (Child)' + updatedChildDetails.birthLocation.town
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Residential Area (Child)' +
  //               updatedChildDetails.birthLocation.residentialArea
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Street (Child)' + updatedChildDetails.birthLocation.street
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Number (Child)' + updatedChildDetails.birthLocation.number
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Postcode / Zip (Child)' + updatedChildDetails.birthLocation.zipCode
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Relationship to child (Informant)' +
  //               declaration.informant.relationship +
  //               updatedInformantDetails.relationship
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'First name(s) (Informant)' +
  //               declaration.informant.name[0].firstNames +
  //               updatedInformantDetails.firstNames
  //           )
  //         ).toBeVisible()

  //         await page.getByRole('button', { name: 'Next page' }).click()

  //         await expect(
  //           page.getByText(
  //             'Last name (informant)' +
  //               declaration.informant.name[0].familyName +
  //               updatedInformantDetails.familyName
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Date of birth (informant)' +
  //               formatDateTo_yyyyMMdd(declaration.informant.birthDate) +
  //               formatDateTo_yyyyMMdd(updatedInformantDetails.birthDate)
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Nationality (Informant)' +
  //               'Farajaland' +
  //               updatedInformantDetails.nationality
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Type of ID (Informant)' +
  //               'National ID' +
  //               updatedInformantDetails.idType
  //           )
  //         ).toBeVisible()
  //         await expect(
  //           page.getByText('ID Number (Informant)' + updatedInformantDetails.id)
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Province (Informant)' +
  //               'Central' +
  //               updatedInformantDetails.address.province
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'District (Informant)' +
  //               'Ibombo' +
  //               updatedInformantDetails.address.district
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Town (Informant)' +
  //               declaration.informant.address[0].city +
  //               updatedInformantDetails.address.town
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Residential Area (Informant)' +
  //               declaration.informant.address[0].line[2] +
  //               updatedInformantDetails.address.residentialArea
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Street (Informant)' +
  //               declaration.informant.address[0].line[1] +
  //               updatedInformantDetails.address.street
  //           )
  //         ).toBeVisible()

  //         await page.getByRole('button', { name: 'Next page' }).click()

  //         await expect(
  //           page.getByText(
  //             'Number (Informant)' +
  //               declaration.informant.address[0].line[0] +
  //               updatedInformantDetails.address.number
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Postcode / Zip (Informant)' +
  //               declaration.informant.address[0].postalCode +
  //               updatedInformantDetails.address.zipCode
  //           )
  //         ).toBeVisible()

  //         await expect(
  //           page.getByText(
  //             'Email (Informant)' +
  //               declaration.registration.contactEmail +
  //               updatedInformantDetails.email
  //           )
  //         ).toBeVisible()

  //         await page
  //           .getByRole('heading', { name: 'Correction requested' })
  //           .locator('xpath=following-sibling::*[1]')
  //           .click()
  //       })

  //       test('2.8.4.3 Validate correction rejected modal', async () => {
  //         const correctionRejectedRow = page.locator(
  //           '#listTable-task-history #row_7'
  //         )
  //         await correctionRejectedRow.getByText('Correction rejected').click()

  //         const time = await correctionRejectedRow
  //           .locator('span')
  //           .nth(1)
  //           .innerText()

  //         const reviewer = await correctionRejectedRow
  //           .locator('span')
  //           .nth(2)
  //           .innerText()

  //         /*
  //          * Expected result: Should show
  //          * - Correction rejected header
  //          * - Reviewer & time
  //          * - Reason
  //          */

  //         await expect(
  //           page.getByRole('heading', { name: 'Correction rejected' })
  //         ).toBeVisible()

  //         await expect(page.getByText(reviewer + ' — ' + time)).toBeVisible()
  //         await expect(
  //           page.getByText('Reason' + 'Wrong information')
  //         ).toBeVisible()

  //         await page
  //           .getByRole('heading', { name: 'Correction rejected' })
  //           .locator('xpath=following-sibling::*[1]')
  //           .click()
  //       })
  //     })
  //   })
})
