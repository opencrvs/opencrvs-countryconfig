import { expect, test, type Page } from '@playwright/test'
import { CLIENT_URL, CREDENTIALS } from '../../../constants'
import { getToken } from '../../../helpers'
import { selectAction } from '../../../v2-utils'
import { loginToV2 } from '../../../helpers'
import { getDeclarationForPrintCertificate } from '../../print-certificate/birth/certificate-helper'
import {
  createDeclaration,
  getDeclaration,
  Declaration
} from './data/birth-declaration'
import { selectCertificationType, selectRequesterType } from './helpers'

test.describe.serial('7.0 Validate "Certify record" page', () => {
  let eventId: string
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token, await getDeclaration('BROTHER'))
    eventId = res.eventId
    declaration = res.declaration
    page = await browser.newPage()
    await loginToV2(page)

    const childName = `${declaration['child.firstname']} ${declaration['child.surname']}`
    await page.getByRole('button', { name: childName }).click()
    await selectAction(page, 'Print Certificate')
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 continue with "Print and issue to informant (Brother)" redirect to Collector details page', async () => {
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to informant')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${eventId}/pages/collector.identity.verify`
        )
    ).toBeTruthy()

    await expect(page.getByText('Relationship to child')).toBeVisible()
    await expect(page.getByText('Brother')).toBeVisible()

    await page.getByRole('button', { name: 'Verified' }).click()
    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${eventId}/pages/collector.collect.payment`
        )
    ).toBeTruthy()

    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(
      page.getByText('Birth registration before 30 days of date of birth')
    ).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
  })

  test('7.2 should navigate to ready to certify page on continue button click', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(
      page
        .url()
        .includes(
          `/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
        )
    ).toBeTruthy()
  })

  // @TODO: this is not implemented in events v2 yet
  test.skip('7.3 should skip payment page if payment is 0', async () => {
    // await page.goto(`${CLIENT_URL}/registration-home/print/1`)
    // const response = await getDeclarationForPrintCertificate(page, {
    //   child: { birthDate: format(new Date(), 'yyyy-MM-dd') },
    //   isLoggedIn: true
    // })
    // declaration = response.declaration
    // await page
    //   .locator('#certificateTemplateId-form-input > span')
    //   .first()
    //   .click()
    // await page
    //   .getByText('Birth Certificate Certified Copy', { exact: true })
    //   .click()
    // await page.getByLabel('Print and issue to informant (Brother)').check()
    // await page.getByRole('button', { name: 'Continue' }).click()
    // await expect(
    //   page.url().includes(`/print/check/${declaration.id}/birth/informant`)
    // ).toBeTruthy()
    // await page.getByRole('button', { name: 'Verified' }).click()
    // await expect(
    //   page.url().includes(`/review/${declaration.id}/birth`)
    // ).toBeTruthy()
  })
})
