import { expect, type Page } from '@playwright/test'
import { omit } from 'lodash'
import { formatName, joinValuesWith } from '../../helpers'
import { faker } from '@faker-js/faker'

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
