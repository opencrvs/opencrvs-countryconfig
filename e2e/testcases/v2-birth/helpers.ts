import { expect, type Page } from '@playwright/test'
import { omit } from 'lodash'

export const REQUIRED_VALIDATION_ERROR = 'Required for registration'

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
