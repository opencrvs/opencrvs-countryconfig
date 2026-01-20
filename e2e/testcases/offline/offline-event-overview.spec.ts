import { expect, Page, test } from '@playwright/test'

import { ActionType } from '@opencrvs/toolkit/events'
import { getToken, login } from '../../helpers'
import { mockNetworkConditions } from '../../mock-network-conditions'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'

test.describe.serial('Can view non-downloaded event online', () => {
  let page: Page
  let declaration: Declaration
  let childName: string
  let trackingId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER.USERNAME,
      CREDENTIALS.REGISTRATION_OFFICER.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    trackingId = res.trackingId!
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test('Open the event overview page', async () => {
    await page.getByRole('button', { name: childName, exact: true }).click()
  })

  test('Verify user can only see non-secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).not.toHaveText(
      'mothers@email.com'
    )
  })

  test('Verify that user can see details on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('row-value-child.name')).toHaveText(childName)
  })
})

test.describe.serial('Can partially view non-downloaded event offline', () => {
  let page: Page
  let declaration: Declaration
  let childName: string
  let trackingId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER.USERNAME,
      CREDENTIALS.REGISTRATION_OFFICER.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    trackingId = res.trackingId!
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test('Go offline', async () => {
    await mockNetworkConditions(page, 'offline')
  })

  test('Open the event overview page', async () => {
    await page.getByRole('button', { name: childName, exact: true }).click()
  })

  test('Verify user can only see non-secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).not.toHaveText(
      'mothers@email.com'
    )
  })

  test('Verify user can not access "Record"-tab details', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('row-value-child.name')).not.toBeVisible()
  })
})

test.describe.serial('Can view downloaded event offline', () => {
  let page: Page
  let declaration: Declaration
  let childName: string
  let trackingId: string

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.REGISTRATION_OFFICER.USERNAME,
      CREDENTIALS.REGISTRATION_OFFICER.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    childName = formatV2ChildName(declaration)
    trackingId = res.trackingId!
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Pending registration' }).click()
  })

  test('Download record', async () => {
    const row = page.getByTestId('row-item').filter({ hasText: childName })

    await row
      .getByRole('button', { name: 'Assign record', exact: true })
      .click()

    await page.getByRole('button', { name: 'Assign', exact: true }).click()

    await expect(
      row.getByRole('button', { name: 'Assign record', exact: true })
    ).not.toBeVisible()
  })

  test('Go offline', async () => {
    await mockNetworkConditions(page, 'offline')
  })

  test('Open the event overview page', async () => {
    await page.getByRole('button', { name: childName, exact: true }).click()
  })

  test('Verify that user can see secured details', async () => {
    await expect(page.getByTestId('tracking-id-value')).toHaveText(trackingId)
    await expect(page.getByTestId('informant.contact-value')).toHaveText(
      'mothers@email.com'
    )
  })

  test('Verify that user can see details on "Record"-tab', async () => {
    await page.getByRole('button', { name: 'Record', exact: true }).click()
    await expect(page.getByTestId('row-value-child.name')).toHaveText(childName)
  })
})
