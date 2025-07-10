import { expect, type Page } from '@playwright/test'
import { omit } from 'lodash'
import { formatName, joinValuesWith } from '../../helpers'
import { faker } from '@faker-js/faker'
import { ensureOutboxIsEmpty } from '../../v2-utils'
import { getRowByTitle } from '../v2-print-certificate/birth/helpers'
import { SAFE_OUTBOX_TIMEOUT_MS } from '../../constants'

export const REQUIRED_VALIDATION_ERROR = 'Required'

export async function validateAddress(
  page: Page,
  address: Record<string, any>,
  elementTestId: string
) {
  // selection is not rendered as part of the address.
  const addressWithoutGeographicalArea = omit(address, 'urbanOrRural')

  await Promise.all(
    Object.values(addressWithoutGeographicalArea).map(
      (val) =>
        typeof val === 'string' &&
        expect(page.getByTestId(elementTestId).getByText(val)).toBeVisible()
    )
  )
}

export async function fillDate(
  page: Page,
  date: { dd: string; mm: string; yyyy: string }
) {
  await page.getByPlaceholder('dd').fill(date.dd)
  await page.getByPlaceholder('mm').fill(date.mm)
  await page.getByPlaceholder('yyyy').fill(date.yyyy)
}

export async function fillChildDetails(page: Page) {
  const firstName = faker.person.firstName('female')
  const lastName = faker.person.lastName('female')
  await page.locator('#firstname').fill(firstName)
  await page.locator('#surname').fill(lastName)

  return formatName({ firstNames: firstName, familyName: lastName })
}

export async function openBirthDeclaration(page: Page) {
  await page.click('#header-new-event')
  await page.getByLabel('Birth').click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()

  return page
}

export async function expectRowValueWithChangeButton(
  page: Page,
  fieldName: string,
  assertionText: string
) {
  await expect(page.getByTestId(`row-value-${fieldName}`)).toContainText(
    assertionText
  )

  await expect(page.getByTestId(`change-button-${fieldName}`)).toBeVisible()
}

export const formatV2ChildName = (obj: {
  'child.name': { firstname: string; surname: string }
  [key: string]: any
}) => {
  return joinValuesWith([
    obj['child.name'].firstname,
    obj['child.name'].surname
  ])
}

export const assertRecordInWorkqueue = async ({
  page,
  name,
  workqueues
}: {
  page: Page
  name: string
  workqueues: { title: string; exists: boolean }[]
}) => {
  await page.getByRole('button', { name: 'Outbox' }).click()
  await ensureOutboxIsEmpty(page)

  for (const { title, exists } of workqueues) {
    await page
      .getByRole('button', {
        name: title
      })
      .click()

    await expect(page.getByTestId('search-result')).toContainText(title)

    if (exists) {
      await expect(page.getByRole('button', { name })).toBeVisible()
    } else {
      await expect(page.getByRole('button', { name })).toBeHidden()
    }
  }
}

export const assignFromWorkqueue = async (page: Page, name: string) => {
  await getRowByTitle(page, name)
    .getByRole('button', { name: 'Assign record' })
    .click()
  await page.getByRole('button', { name: 'Assign', exact: true }).click()

  /**
   * We need to wait a while before assign mutation goes to outbox.
   * Reason: We have `await refetchEvent()` before assign mutation is fired
   */

  await expect(page.locator('#navigation_workqueue_outbox')).toContainText(
    '1',
    {
      timeout: SAFE_OUTBOX_TIMEOUT_MS
    }
  )
  await ensureOutboxIsEmpty(page)
}
