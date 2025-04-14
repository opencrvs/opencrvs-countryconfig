import { expect, type Page } from '@playwright/test'

export async function validateAddress(
  page: Page,
  address: Record<string, any>,
  elementTestId: string
) {
  await Promise.all(
    Object.values(address).map(
      (val) =>
        typeof val === 'string' &&
        expect(page.getByTestId(elementTestId).getByText(val)).toBeVisible()
    )
  )
}
