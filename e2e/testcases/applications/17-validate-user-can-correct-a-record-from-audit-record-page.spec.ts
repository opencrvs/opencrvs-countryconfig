import { expect, test, type Page } from '@playwright/test'
import {
  assignRecord,
  createPIN,
  getAction,
  getToken,
  login
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { createDeclaration } from '../birth/helpers'
import TEST_DATA_1 from '../birth/data/1-both-mother-and-father.json'
import { CREDENTIALS } from '../../constants'

test.describe
  .serial('17. Validate user can correct a record from audit record page', () => {
  let page: Page
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test('17.0 Create Declaration', async () => {
    const token = await getToken('k.mweene', 'test')
    const res = await createDeclaration(token, {
      child: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.firstName(),
        gender: TEST_DATA_1['Child details'].Sex.toLowerCase() as 'male'
      },
      informant: {
        type: TEST_DATA_1['Informant details'][
          'Relationship to child'
        ].toUpperCase() as 'MOTHER'
      },
      attendant: {
        type: TEST_DATA_1['Child details'][
          'Attendant at birth'
        ].toUpperCase() as 'PHYSICIAN'
      },
      mother: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.firstName()
      },
      father: {
        firstNames: faker.person.firstName(),
        familyName: faker.person.firstName()
      }
    })
    expect(res).toStrictEqual({
      trackingId: expect.any(String),
      compositionId: expect.any(String),
      isPotentiallyDuplicate: false,
      __typename: 'CreatedIds'
    })
  })

  test('17.1 Go to ready to print tab > search for a certified record > click any application not downloaded', async () => {
    await login(
      page,
      CREDENTIALS.REGISTRATION_AGENT.USERNAME,
      CREDENTIALS.REGISTRATION_AGENT.PASSWORD
    )
    await createPIN(page)

    await page.getByRole('button', { name: 'Ready to print' }).click()
    await page.locator('#name_0').click()

    /*
     * Expected result: should
     * - Navigate to record audit page
     * - Correct record option should be disabled
     * - Print option should be disabled
     */
    await page.getByRole('button', { name: 'Action' }).first().click()

    await expect(getAction(page, 'Correct record')).toHaveAttribute('disabled')

    await expect(getAction(page, 'Print certified copy')).toHaveAttribute(
      'disabled'
    )

    expect(page.url().includes('record-audit'))
  })

  test('17.2 Click download > click assign', async () => {
    await assignRecord(page)
    await page.getByRole('button', { name: 'Action' }).first().click()

    /*
     * Expected result: should
     * - Correct record option should not be disabled
     * - Print option should not be disabled
     */
    await expect(getAction(page, 'Correct record')).not.toHaveAttribute(
      'disabled',
      // Add timeout to avoid flakyness
      { timeout: 30000 }
    )

    await expect(getAction(page, 'Print certified copy')).not.toHaveAttribute(
      'disabled'
    )
  })

  test('17.3 Click "Correct record"', async () => {
    await getAction(page, 'Correct record').click()

    /*
     * Expected result: should show correct record page
     */
    await expect(
      page.getByRole('heading', { name: 'Correct record' })
    ).toBeVisible()
    expect(page.url().includes('correction'))
  })
})
