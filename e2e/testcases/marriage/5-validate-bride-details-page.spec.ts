import { test, expect } from '@playwright/test'
import { createPIN, goToSection, login } from '../../helpers'

test.describe("5. Validate the bride's details page", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)

    await page.click('#header_new_event')

    await expect(page.getByText('New Declaration')).toBeVisible()
    await expect(page.getByText('Event type')).toBeVisible()
    await expect(page.getByLabel('Marriage')).toBeVisible()

    await page.getByLabel('Marriage').click()
    await goToSection(page, 'bride')

    await expect(page.getByText("Bride's details")).toBeVisible()
  })

  test.describe('1 Validate the "Nationality" drop-down field.', async () => {
    test('1. Select any drop-down value from the drop-down', async ({
      page
    }) => {
      await expect(page.locator('#countryPrimaryBride')).toHaveText(
        'Farajaland'
      )
      await page.locator('#countryPrimaryBride').click()
      await page.getByText('Estonia', { exact: true }).click()
      await expect(
        page.getByText('Estonia', {
          exact: true
        })
      ).toBeVisible()
    })
  })

  test.describe('2 Validate the National ID field', async () => {
    test('2.1. Enter numerical value less than 9 digit', async ({ page }) => {
      const shortValue = '12345'
      await page.locator('#brideIdType').click()
      await page.getByText('National ID', { exact: true }).click()
      await page.locator('#brideNationalId').fill(shortValue)
      await page.getByText("Bride's details").click()

      await expect(page.locator('#brideNationalId_error')).toHaveText(
        'The National ID can only be numeric and must be 10 digits long'
      )
    })

    test('2.2 Set the field as NULL', async ({ page }) => {
      await page.locator('#brideIdType').click()
      await page.getByText('National ID', { exact: true }).click()
      await page.locator('#brideNationalId').click()
      await page.getByText("Bride's details").click()
      await expect(page.locator('#brideNationalId_error')).toHaveText(
        'Required for registration'
      )
      await goToSection(page, 'preview')

      await expect(
        page.locator('#required_label_bride_brideNationalId')
      ).toHaveText('Required for registration')
    })

    test('2.3 Enter numerical value 9 digit', async ({ page }) => {
      const correctValue = '0912312222'

      await page.locator('#brideIdType').click()
      await page.getByText('National ID', { exact: true }).click()
      await page.locator('#brideNationalId').fill(correctValue)
      await page.getByText("Bride's details").click()

      await expect(page.locator('#brideNationalId_error')).toBeHidden()
    })

    test('2.4 Enter numerical value above 9 digit', async ({ page }) => {
      const tooLongValue = '091231222222'
      await page.locator('#brideIdType').click()
      await page.getByText('National ID', { exact: true }).click()
      await page.locator('#brideNationalId').fill(tooLongValue)
      await page.getByText("Bride's details").click()

      await expect(page.locator('#brideNationalId_error')).toHaveText(
        'The National ID can only be numeric and must be 10 digits long'
      )
    })
    test('2.5 Enter the same 9 digit value of informant', async ({ page }) => {
      const sameNumbersValue = '222222222'
      await page.locator('#brideIdType').click()
      await page.getByText('National ID', { exact: true }).click()
      await page.locator('#brideNationalId').fill(sameNumbersValue)
      await page.getByText("Bride's details").click()

      await expect(page.locator('#brideNationalId_error')).toHaveText(
        'The National ID can only be numeric and must be 10 digits long'
      )
    })
  })

  test.describe('2.1 Validate "First Name(s)" text field', async () => {
    test.describe('2.1.1 Enter Non-English characters', async () => {
      test('Using name: Richard the 3rd', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('Richard the 3rd')
        await page.getByText("Bride's details").click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test('Using name: John_Peter', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('John_Peter')
        await page.getByText("Bride's details").click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test('Using name: John-Peter', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('John-Peter')
        await page.getByText("Bride's details").click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test("Using name: O'Neill", async ({ page }) => {
        await page.locator('#firstNamesEng').fill("O'Neill")
        await page.getByText("Bride's details").click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeHidden()
      })

      test('Using name: &er$on', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('&er$on')
        await page.getByText("Bride's details").click()

        /*
         * Expected result: should accept the input and not throw any error
         */
        await expect(page.locator('#firstNamesEng_error')).toBeVisible()
      })

      test.skip('Using name: X Æ A-Xii', async ({ page }) => {
        await page.locator('#firstNamesEng').fill('X Æ A-Xii')
        await page.getByText("Bride's details").click()

        /*
         * Expected result: should throw error:
         * - Input contains invalid characters. Please use only letters (a-z), numbers (0-9), hyphens (-), and underscores (_)
         */
        await expect(page.locator('#firstNamesEng_error')).toBeVisible()
      })
    })

    test('2.1.2 Enter less than 33 English characters', async ({ page }) => {
      await page.locator('#firstNamesEng').fill('Rakibul Islam')
      await page.getByText("Bride's details").click()

      /*
       * Expected result: should accept the input and not throw any error
       */
      await expect(page.locator('#firstNamesEng_error')).toBeHidden()
    })

    test('2.1.3 Enter Field as NULL', async ({ page }) => {
      await goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page.locator('#required_label_bride_firstNamesEng')
      ).toBeVisible()
    })

    test('2.1.4 Enter more than 32 English characters', async ({ page }) => {
      const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
      await page.locator('#firstNamesEng').fill(LONG_NAME)
      await page.getByText("Bride's details").click()

      /*
       * Expected result: should clip the name to first 32 character
       */
      await expect(page.locator('#firstNamesEng')).toHaveValue(
        LONG_NAME.slice(0, 32)
      )
    })
  })

  test.describe('3 Validate the "DOB" field', async () => {
    test('3.1. Enter date Less than the current date and focus out from the field ', async ({
      page
    }) => {
      const yyyy = '1996'
      const mm = '03'
      const dd = '12'

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByText("Bride's details").click()

      /*
       * Expected result: should accept the date
       */
      await expect(page.locator('#brideBirthDate_error')).toBeHidden()
    })

    test('3.2. Enter invalid date', async ({ page }) => {
      await page.getByPlaceholder('dd').fill('0')
      await page.getByPlaceholder('mm').fill('0')
      await page.getByPlaceholder('yyyy').fill('0')
      await page.getByText("Bride's details").click()

      /*
       * Expected result: should not accept the invalid date and show error:
       * - Must be a valid birth date
       */
      await expect(page.locator('#brideBirthDate_error')).toHaveText(
        'Required for registration. Enter a valid date'
      )
    })

    test('2.3 Set the field as null', async ({ page }) => {
      await goToSection(page, 'preview')

      /*
       * Expected result: should throw error in application review page:
       * - Required for registration
       */
      await expect(
        page.locator('#required_label_bride_brideBirthDate')
      ).toHaveText('Required for registration. Enter a valid date')
    })

    test('2.4. Enter future date', async ({ page }) => {
      const futureDate = new Date()
      futureDate.setDate(new Date().getDate() + 5)
      const [yyyy, mm, dd] = futureDate.toISOString().split('T')[0].split('-')

      await page.getByPlaceholder('dd').fill(dd)
      await page.getByPlaceholder('mm').fill(mm)
      await page.getByPlaceholder('yyyy').fill(yyyy)
      await page.getByText("Bride's details").click()

      /*
       * Expected result: should not accept the future date and show error:
       * - Must be a valid birth date
       */
      await expect(page.locator('#brideBirthDate_error')).toHaveText(
        'Must be a valid birth date'
      )
    })
  })
  test.describe('4 Validate the Residence section', async () => {
    test('4.1. Select any country from the "Country" dropdown field, Default value is Farajaland ', async ({
      page
    }) => {
      await expect(page.locator('#countryPrimaryBride')).toHaveText(
        'Farajaland'
      )
      await page.locator('#countryPrimaryBride').click()
      await page.getByText('Estonia', { exact: true }).click()
      await page.getByText("Bride's details").click()
      await expect(page.locator('#countryPrimaryBride')).toHaveText('Estonia')
    })

    test('4.2. Select any Province from "Province" dropdown field, Default value is Central', async ({
      page
    }) => {
      await page.locator('#statePrimaryBride').click()
      await page.getByText('Sulaka', { exact: true }).click()
      await page.getByText("Bride's details").click()
      await expect(page.locator('#statePrimaryBride')).toHaveText('Sulaka')
    })

    test('4.3 Select any district from "District" dropdown field, Default value is Ibombo', async ({
      page
    }) => {
      await page.locator('#districtPrimaryBride').click()
      await page.getByText('Isamba', { exact: true }).click()
      await page.getByText("Bride's details").click()
      await expect(page.locator('#districtPrimaryBride')).toHaveText('Isamba')
    })

    test('4.4. Select Urban address', async ({ page }) => {
      await page.getByLabel('Urban').check()
      await page.getByText("Bride's details").click()
      await expect(page.getByLabel('Urban')).toBeChecked()
    })
    test('4.5. Select Rural address', async ({ page }) => {
      await page.getByLabel('Rural').check()
      await page.getByText("Bride's details").click()
      await expect(page.getByLabel('Rural')).toBeChecked()
    })
    test('4.6. Click the continue button', async ({ page }) => {
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page.getByText('Marriage details')).toBeVisible()
    })
  })
})
