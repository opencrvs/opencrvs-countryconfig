import { expect, test, type Page } from '@playwright/test'
import {
  createPIN,
  expectOutboxToBeEmpty,
  formatDateTo_ddMMMMyyyy,
  formatDateTo_yyyyMMdd,
  formatName,
  getToken,
  goBackToReview,
  login
} from '../../helpers'
import { format, parseISO, subDays } from 'date-fns'
import { DeathDeclaration } from '../death/types'
import { createDeathDeclaration, fetchDeclaration } from '../death/helpers'
import { CREDENTIALS } from '../../constants'

test.describe.serial(' Correct record - 11', () => {
  let declaration: DeathDeclaration
  let trackingId = ''

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
    placeOfDeath: 'Health Institution',
    deathLocation: 'Pondo Rural Health Centre'
  }

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('11.0 Shortcut declaration', async () => {
    let token = await getToken('k.mweene', 'test')

    const res = await createDeathDeclaration(token, {
      event: {
        placeOfDeath: "Deceased's usual place of residence"
      }
    })
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

  test('11.1 Certificate preview', async () => {
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
    await page.getByRole('button', { name: 'No, make correction' }).click()
  })

  test('11.2 Correction requester: another registration agent or field agent', async () => {
    await page.getByLabel('Another registration agent or field agent').check()
    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('11.3 Verify identity', async () => {
    /*
     * Expected result:
     * - should not show verify identity
     * - should directly navigate to review page
     */
    expect(page.url().includes('correction')).toBeTruthy()
    expect(page.url().includes('review')).toBeTruthy()
  })

  test.describe('11.4 Correction made on event details', async () => {
    test('11.4.1 Change date of death', async () => {
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

    test('11.4.2 Change manner of death', async () => {
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

    test('11.4.3 Change cause of death, source', async () => {
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

    test('11.4.4 Change place of death', async () => {
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

      await page
        .locator('#deathLocation')
        .fill(updatedEventDetails.deathLocation.slice(0, 3))
      await page
        .getByText(updatedEventDetails.deathLocation, { exact: true })
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
        page.locator('#deathEvent-content #Place').getByRole('deletion').nth(0)
      ).toHaveText("Deceased's usual place of residence")

      await expect(
        page
          .locator('#deathEvent-content #Place')
          .getByText(
            updatedEventDetails.placeOfDeath + updatedEventDetails.deathLocation
          )
      ).toBeVisible()
    })
  })

  test('11.5 Upload supporting documents', async () => {
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

  test('11.6 Reason for correction', async () => {
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

    /*
     * Expected result: should enable the continue button
     */

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  test('11.7 Correction summary', async () => {
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
          "Deceased's usual place of residence" +
          '-' +
          updatedEventDetails.placeOfDeath +
          updatedEventDetails.deathLocation
      )
    ).toBeVisible()

    await expect(
      page.getByText('Another registration agent or field agent')
    ).toBeVisible()

    await expect(
      page.getByText(
        'Informant provided incorrect information (Material error)'
      )
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
  test.describe('11.8 Correction Approval', async () => {
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

    test('11.8.1 Record audit by local registrar', async () => {
      await page.getByPlaceholder('Search for a tracking ID').fill(trackingId)
      await page.getByPlaceholder('Search for a tracking ID').press('Enter')
      await page.locator('#ListItemAction-0-icon').click()
      await page.getByRole('button', { name: 'Assign', exact: true }).click()

      await page.locator('#name_0').click()
    })

    test('11.8.2 Correction review', async () => {
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

      await expect(
        page.getByText(
          'Requested by' + 'Another registration agent or field agent'
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Reason for request' +
            'Informant provided incorrect information (Material error)'
        )
      ).toBeVisible()

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
            "Deceased's usual place of residence" +
            '-' +
            updatedEventDetails.placeOfDeath +
            updatedEventDetails.deathLocation
        )
      ).toBeVisible()

      await expect(
        page.getByText('Another registration agent or field agent')
      ).toBeVisible()
    })

    test('11.8.3 Reject correction', async () => {
      await page.getByRole('button', { name: 'Reject', exact: true }).click()
      await page
        .locator('#rejectionRaisonOfCorrection')
        .fill('Wrong information')
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

    test('11.8.4 Validate history in record audit', async () => {
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
       * - Correction rejected
       */

      await expect(
        page
          .locator('#listTable-task-history')
          .getByRole('button', { name: 'Correction requested' })
      ).toBeVisible()

      await expect(
        page
          .locator('#listTable-task-history')
          .getByRole('button', { name: 'Correction rejected' })
      ).toBeVisible()
    })
    test('11.8.5 Validate correction requested modal', async () => {
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

      await expect(
        page.getByText(
          'Requested by' + 'Another registration agent or field agent'
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          'Reason for request' +
            'Informant provided incorrect information (Material error)'
        )
      ).toBeVisible()

      await expect(page.getByText('Comment')).toBeVisible()

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

      //@ToDo after feedback from qa, assert properly
      // await expect(
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
          'Place of death (Death event details)' +
            "Deceased's usual place of residence" +
            updatedEventDetails.placeOfDeath
        )
      ).toBeVisible()

      await expect(
        page.getByText(
          updatedEventDetails.placeOfDeath +
            ' (Death event details)' +
            updatedEventDetails.deathLocation
        )
      ).toBeVisible()

      await page
        .getByRole('heading', { name: 'Correction requested' })
        .locator('xpath=following-sibling::*[1]')
        .click()
    })
    test('11.8.6 Validate correction rejected modal', async () => {
      const correctionRejectedRow = page.locator(
        '#listTable-task-history #row_6'
      )
      await correctionRejectedRow.getByText('Correction rejected').click()

      const time = await correctionRejectedRow
        .locator('span')
        .nth(1)
        .innerText()

      const reviewer = await correctionRejectedRow
        .locator('span')
        .nth(2)
        .innerText()

      /*
       * Expected result: Should show
       * - Correction rejected header
       * - Reviewer & time
       * - Reason
       */

      await expect(
        page.getByRole('heading', { name: 'Correction rejected' })
      ).toBeVisible()

      await expect(page.getByText(reviewer + ' — ' + time)).toBeVisible()

      await expect(page.getByText('Reason' + 'Wrong information')).toBeVisible()

      await page
        .getByRole('heading', { name: 'Correction rejected' })
        .locator('xpath=following-sibling::*[1]')
        .click()
    })
  })
})
