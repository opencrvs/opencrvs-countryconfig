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
  login
} from '../../helpers'
import { format, parseISO, subDays } from 'date-fns'
import { DeathDeclaration } from '../death/types'
import { createDeathDeclaration, fetchDeclaration } from '../death/helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial(' Correct record - 15', () => {
  let declaration: DeathDeclaration
  let trackingId = ''
  let deathLocation = ''

  let page: Page
  const updatedEventDetails = {
    dateOfDeath: format(
      subDays(new Date(), Math.ceil(20 * Math.random())),
      'yyyy-MM-dd'
    ),
    manner: 'Natural causes',
    cause: {
      established: true,
      source: 'Physician'
    },
    placeOfDeath: 'Estate Urban Health Centre'
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('15.0 Shortcut declaration', async () => {
    let token = await getToken('k.mweene', 'test')

    const res = await createDeathDeclaration(token, {
      event: {
        deathFacility: 'Itumbwe Health Post'
      }
    })
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })

    trackingId = res.trackingId

    token = await getToken('k.mweene', 'test')
    declaration = (await fetchDeclaration(token, res.compositionId)).data
      .fetchDeathRegistration as DeathDeclaration

    deathLocation =
      (await getLocationNameFromFhirId(declaration.eventLocation.id)) ||
      'Not found'
  })

  test.describe('15.1 Print > Ready to issue', async () => {
    test('15.1.1 print', async () => {
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
    test('15.1.2 Ready to issue', async () => {
      await page.getByRole('button', { name: 'Ready to issue' }).click()

      /*
       * Expected result: should
       * - be navigated to ready to isssue tab
       * - include the declaration in this tab
       */
      expect(page.url().includes('registration-home/readyToIssue')).toBeTruthy()
      await expectOutboxToBeEmpty(page)

      await page.getByText(formatName(declaration.deceased.name[0])).click()
    })
    test('15.1.3 Record audit', async () => {
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

  test('15.2 Correction requester: Informant (SPOUSE)', async () => {
    await page.getByLabel('Informant (SPOUSE)').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('15.3 Verify identity', async () => {
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
        `ID: National Id | ${declaration.informant.identifier[0].id}`
      )
    ).toBeVisible()
    await expect(
      page.getByText(
        `First name(s): ${declaration.informant.name[0].firstNames}`
      )
    ).toBeVisible()
    await expect(
      page.getByText(`Last name: ${declaration.informant.name[0].familyName}`)
    ).toBeVisible()
    await expect(
      page.getByText(
        `Date of Birth:
      ${formatDateTo_ddMMMMyyyy(declaration.informant.birthDate)}
      `
      )
    ).toBeVisible()
    await expect(
      page.getByText(`Nationality: ${declaration.informant.nationality}`)
    ).toBeVisible()

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

  test.describe('15.4 Correction made on event details', async () => {
    test('15.4.1 Change date of death', async () => {
      await page
        .locator('#deathEvent-content #Date')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to death event details page
       * - focus on date of death
       */
      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('death-event-details')).toBeTruthy()
      expect(page.url().includes('#deathDate')).toBeTruthy()

      const date = updatedEventDetails.dateOfDeath.split('-')

      await page.getByPlaceholder('dd').fill(date[2])
      await page.getByPlaceholder('mm').fill(date[1])
      await page.getByPlaceholder('yyyy').fill(date[0])

      await goBackToReview(page)
      /*
       * Expected result: should
       * - redirect to review page
       * - show previous date of death with strikethrough
       * - show updated date of death
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#deathEvent-content #Date').getByRole('deletion')
      ).toHaveText(
        formatDateTo_ddMMMMyyyy(declaration.deceased.deceased.deathDate)
      )

      await expect(
        page
          .locator('#deathEvent-content #Date')
          .getByText(formatDateTo_ddMMMMyyyy(updatedEventDetails.dateOfDeath))
      ).toBeVisible()
    })

    test('15.4.2 Change manner of death', async () => {
      await page
        .locator('#deathEvent-content #Manner')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deathEvent details page
       * - focus on manner of death
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('death-event-details')).toBeTruthy()
      expect(page.url().includes('#mannerOfDeath')).toBeTruthy()

      await page.locator('#mannerOfDeath').click()
      await page.getByText(updatedEventDetails.manner, { exact: true }).click()

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous manner with strikethrough
       * - show updated manner
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#deathEvent-content #Manner').getByRole('deletion')
      ).toHaveText('-')

      await expect(
        page
          .locator('#deathEvent-content #Manner')
          .getByText(updatedEventDetails.manner)
      ).toBeVisible()
    })

    test('15.4.3 Change cause of death, source', async () => {
      await page
        .locator('#deathEvent-content #Cause')
        .getByRole('button', { name: 'Change', exact: true })
        .click()

      /*
       * Expected result: should
       * - redirect to deathEvent details page
       * - focus on cause of death
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('death-event-details')).toBeTruthy()
      expect(page.url().includes('#causeOfDeathEstablished')).toBeTruthy()

      await page.getByLabel('Cause of death has been established').check()

      await page.locator('#causeOfDeathMethod').click()
      await page
        .getByText(updatedEventDetails.cause.source, { exact: true })
        .click()

      await page.getByRole('button', { name: 'Back to review' }).click()

      /*
       * Expected result: should
       * - redirect to review page
       * - show previous cause with strikethrough
       * - show previous source of cause with strikethrough
       * - show updated cause
       * - show updated source of cause
       */

      expect(page.url().includes('correction')).toBeTruthy()
      expect(page.url().includes('review')).toBeTruthy()

      await expect(
        page.locator('#deathEvent-content #Cause').getByRole('deletion')
      ).toHaveText(declaration.causeOfDeathEstablished == 'true' ? 'Yes' : 'No')

      await expect(
        page
          .locator('#deathEvent-content #Cause')
          .getByText(updatedEventDetails.cause.established ? 'Yes' : 'No')
      ).toBeVisible()

      await expect(
        page.locator('#deathEvent-content #Source').getByRole('deletion')
      ).toHaveText('-')

      await expect(
        page
          .locator('#deathEvent-content #Source')
          .getByText(updatedEventDetails.cause.source)
      ).toBeVisible()
    })

    test('15.4.4 Change place of death', async () => {
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

      await page
        .locator('#deathLocation')
        .fill(updatedEventDetails.placeOfDeath.slice(0, 3))
      await page
        .getByText(updatedEventDetails.placeOfDeath, { exact: true })
        .click()

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
        page.locator('#deathEvent-content #Place').getByRole('deletion').nth(1)
      ).toHaveText(deathLocation, {
        ignoreCase: true
      })

      await expect(
        page
          .locator('#deathEvent-content #Place')
          .getByText('Health Institution' + updatedEventDetails.placeOfDeath)
      ).toBeVisible()
    })
  })

  test('15.5 Upload supporting documents', async () => {
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

  test('15.6 Reason for correction', async () => {
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

  test('15.7 Correction summary', async () => {
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
        'Date of death (Death event details)' +
          format(
            parseISO(declaration.deceased.deceased.deathDate),
            'dd MMMM yyyy'
          ) +
          formatDateTo_ddMMMMyyyy(updatedEventDetails.dateOfDeath)
      )
    ).toBeVisible()
    await expect(
      page.getByText(
        'Manner of death (Death event details)-' + updatedEventDetails.manner
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Cause of death has been established (Death event details)' +
          (declaration.causeOfDeathEstablished == 'true' ? 'Yes' : 'No') +
          (updatedEventDetails.cause.established ? 'Yes' : 'No')
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Source of cause of death (Death event details)-' +
          updatedEventDetails.cause.source
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Place of death (Death event details)' +
          'Health Institution' +
          deathLocation +
          'Health Institution' +
          updatedEventDetails.placeOfDeath
      )
    ).toBeVisible()

    await expect(
      page.getByText(formatName(declaration.informant.name[0]))
    ).toBeVisible()

    await expect(page.getByText('Identity does not match')).toBeVisible()

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
      page.getByText(formatName(declaration.deceased.name[0]))
    ).toBeVisible()
  })
  test('15.8 Validate history in record audit', async () => {
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
  test('15.9 Validate record corrected modal', async () => {
    const correctedRow = page.locator('#listTable-task-history #row_6')
    await correctedRow.getByText('Record corrected').click()

    const time = await correctedRow.locator('span').nth(1).innerText()

    const correcter = await correctedRow.locator('span').nth(2).innerText()

    /*
     * Expected result: Should show
     * - Record corrected header
     * - Correcter & time
     * - Requested by
     * - Id check
     * - Reason
     * - Comment
     * - Original vs Correction
     */

    await expect(
      page.getByRole('heading', { name: 'Record corrected' })
    ).toBeVisible()

    await expect(page.getByText(correcter + ' — ' + time)).toBeVisible()

    await expect(
      page.getByText('Requested by' + 'Informant (Spouse)')
    ).toBeVisible()
    await expect(
      page.getByText('ID check' + 'Identity does not match')
    ).toBeVisible()

    await expect(
      page.getByText(
        'Reason for request' +
          'Myself or an agent made a mistake (Clerical error)'
      )
    ).toBeVisible()

    await expect(
      page.getByText('Comment' + declaration.registration.registrationNumber)
    ).toBeVisible()

    await expect(
      page.getByText(
        'Date of death (Death event details)' +
          format(
            parseISO(declaration.deceased.deceased.deathDate),
            'yyyy-MM-dd'
          ) +
          formatDateTo_yyyyMMdd(updatedEventDetails.dateOfDeath)
      )
    ).toBeVisible()
    await expect(
      page.getByText(
        'Manner of death (Death event details)' + updatedEventDetails.manner
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Cause of death has been established (Death event details)' +
          declaration.causeOfDeathEstablished +
          updatedEventDetails.cause.established
      )
    ).toBeVisible()

    // await expect(
    //@ToDo after feedback from qa, assert properly
    //   page.getByText(
    //     'Cause of death has been established (Death event details)' +
    //       (declaration.causeOfDeathEstablished == 'true' ? 'Yes' : 'No') +
    //       (updatedEventDetails.cause.established ? 'Yes' : 'No')
    //   )
    // ).toBeVisible()

    await expect(
      page.getByText(
        'Source of cause of death (Death event details)' +
          updatedEventDetails.cause.source
      )
    ).toBeVisible()

    await expect(
      page.getByText(
        'Health Institution (Death event details)' +
          deathLocation +
          updatedEventDetails.placeOfDeath
      )
    ).toBeVisible()

    await page
      .getByRole('heading', { name: 'Record corrected' })
      .locator('xpath=following-sibling::*[1]')
      .click()
  })
})
