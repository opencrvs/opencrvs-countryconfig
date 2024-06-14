import { test, expect } from '@playwright/test'
import { createPIN, goToSection, login } from '../../helpers'

test.describe("2. Validate the child's details page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)

    await page.click('#header_new_event')

    await expect(page.getByText('New Declaration')).toBeVisible()
    await expect(page.getByText('Event type')).toBeVisible()
    await expect(page.getByLabel('Birth')).toBeVisible()

    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByText("Child's details")).toBeVisible()
  })

  test.describe('2.1 Validate "First Name(s)" text field', async () => {
    test.describe('2.1.1 Enter Non-English characters', async () => {
      test('Using name: Richard the 3rd', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('Richard the 3rd')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test('Using name: John_Peter', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('John_Peter')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test('Using name: John-Peter', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('John-Peter')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test("Using name: O'Neill", async ({ page }) => {
        await page.locator('#firstNamesEng').fill("O'Neill")
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test('Using name: &er$on', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('&er$on')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeVisible()
      })

      test.skip('Using name: X Æ A-Xii', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('X Æ A-Xii')
        await page.getByText('Birth declaration').click()

        /*
         * Expected result: should throw error:
         * - Input contains invalid characters. Please use only letters (a-z), numbers (0-9), hyphens (-), and underscores (_)
         */
        await expect(page.locator('#firstNamesEng_error')).toBeVisible()
      })
    })

    test('2.1.2 Enter less than 33 English characters', async ({ page }) => {
      await page.locator('#firstNamesEng').fill('Rakibul Islam')
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should accept the input and not throw any error
       */
      await expect(page.locator('#firstNamesEng_error')).toBeHidden()
    })

    test('2.1.3 Enter Field as NULL', async ({ page }) => {
      goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page.locator('#required_label_child_firstNamesEng')
      ).toBeVisible()
    })

    test('2.1.4 Enter more than 32 English characters', async ({ page }) => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#firstNamesEng').fill(LONG_NAME)
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should clip the name to first 32 character
       */
      await expect(page.locator('#firstNamesEng')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
    })
  })

  test.describe('2.3 Validate the Sex dropdown field', async () => {
    test('2.3.1 Select any dropdown value: "Female"', async ({ page }) => {
      await page.locator('#gender').click()
      await page.getByText('Female', { exact: true }).click()

      /*
       * Expected result: "Female" should be selected
       */
      await expect(page.locator('#gender', { hasText: 'Female' })).toBeVisible()
    })

    test('2.3.2 Set the field as null', async ({ page }) => {
      goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page
          .locator('[data-test-id="row-value-Sex"]')
          .getByText('Required for registration')
      ).toBeVisible()
    })
  })

  test.describe('2.4 Validate the "DOB" field', async () => {
    test('2.4.1 Enter date less than the current date', async ({ page }) => {
      const yesterday = new Date()
      yesterday.setDate(new Date().getDate() - 1)
      const [yyyy, mm, dd] = yesterday.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should accept the date
       */
      await expect(page.locator('#childBirthDate_error')).toBeHidden()
    })

    test('2.4.2 Enter invalid date', async ({ page }) => {
      await page.getByPlaceholder('dd').fill('0')
      await page.getByPlaceholder('mm').fill('0')
      await page.getByPlaceholder('yyyy').fill('0')
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should not accept the invalid date and show error:
       * - Must be a valid birth date
       */
      await expect(page.locator('#childBirthDate_error')).toHaveText(
        'Must be a valid birth date'
      )
    })

    test('2.4.3 Enter future date', async ({ page }) => {
      const futureDate = new Date()
      futureDate.setDate(new Date().getDate() + 5)
      const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should not accept the future date and show error:
       * - Must be a valid birth date
       */
      await expect(page.locator('#childBirthDate_error')).toHaveText(
        'Must be a valid birth date'
      )
    })

    test('2.4.4 Set the field as null', async ({ page }) => {
      goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page.locator('#required_label_child_childBirthDate')
      ).toHaveText('Required for registration')
    })
  })

  test.describe('2.5 Validate delayed registration', async () => {
    test.beforeEach(async ({ page }) => {
      const delayedDate = new Date()
      delayedDate.setDate(new Date().getDate() - 365 - 5)
      const [yyyy, mm, dd] = delayedDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByText('Birth declaration').click()
    })

    test('2.5.1 Enter date after delayed registration time period', async ({
      page
    }) => {
      const lateDate = new Date()
      lateDate.setDate(new Date().getDate() - 365 + 5)
      const [yyyy, mm, dd] = lateDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByText('Birth declaration').click()

      /*
       * Expected result: should show field:
       * - Reason for delayed registration
       */
      await expect(
        page.getByText('Reason for delayed registration')
      ).toBeHidden()
    })

    test('2.5.2 Enter date before delayed registration time period', async ({
      page
    }) => {
      /*
       * Expected result: should show field:
       * - Reason for delayed registration
       */
      await expect(
        page.getByText('Reason for delayed registration')
      ).toBeVisible()
    })

    test('2.5.3 Enter "Reason for late registration"', async ({ page }) => {
      await page.locator('#reasonForLateRegistration').fill('Lack of awareness')

      /*
       * Expected result: should accept text
       */
      await expect(
        page.locator('#reasonForLateRegistration_error')
      ).toBeHidden()
    })

    test('2.5.4 Set the field as null', async ({ page }) => {
      goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page
          .getByRole('row', { name: 'Reason for delayed' })
          .locator('[data-test-id="row-value-Reason"]')
      ).toHaveText('Required for registration')
    })
  })

  test.describe('2.6 Validate place of delivery field', async () => {
    test('2.6.1 Keep field as null', async ({ page }) => {
      goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(page.locator('[data-test-id="row-value-Place"]')).toHaveText(
        'Required for registration'
      )
    })

    test('2.6.2.a Validate Health Institution', async ({ page }) => {
      await test.step('Select Health Institution', async () => {
        await page.locator('#placeOfBirth').click()
        await page.getByText('Health Institution', { exact: true }).click()
        /*
         * Expected result: should show input field for:
         * - Health institution
         */
        await expect(page.getByText('Health Institution *')).toBeVisible()
      })
      await test.step('Enter any health institution', async () => {
        await page.locator('#birthLocation').fill('b')
        await page.getByText('Bombwe Health Post').click()
        /*
         * Expected result: should select "Bombwe Health Post" as health institute
         */
        await expect(page.locator('#birthLocation')).toHaveValue(
          'Bombwe Health Post'
        )
      })
    })

    test('2.6.2.b Select Residential address', async ({ page }) => {
      await page.locator('#placeOfBirth').click()
      await page.getByText('Residential address', { exact: true }).click()

      /*
       * Expected result: should select "Residential address" as place of birth
       */
      await expect(page.locator('#placeOfBirth')).toContainText(
        'Residential address'
      )
    })

    test('2.6.2.c Select Other', async ({ page }) => {
      await page.locator('#placeOfBirth').click()
      await page.getByText('Other', { exact: true }).click()

      /*
       * Expected result: should select "Other" as place of birth
       */
      await expect(page.locator('#placeOfBirth')).toContainText('Other')
    })
  })
})
