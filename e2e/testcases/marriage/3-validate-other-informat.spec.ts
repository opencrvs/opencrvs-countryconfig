import { expect, test, type Page } from '@playwright/test'
import { createPIN, getRandomDate, login } from '../../helpers'
import { validateSectionButtons } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'

const declaration = {
  type: 'marriage',
  informantEmail: faker.internet.email(),
  informantDetails: {
    informantType: `Head of groom's family`,
    registrationPhone: '091234567',
    registrationEmail: faker.internet.email()
  },
  bride: {
    name: {
      firstNames: faker.person.firstName('female'),
      familyName: faker.person.lastName('female')
    },
    birthDate: getRandomDate(20, 200),
    nationality: 'Farajaland',
    identifier: {
      id: faker.string.numeric(10),
      type: 'National ID'
    },
    address: {
      Country: 'Farajaland',
      Province: 'Pualula',
      District: 'Pili'
    },
    cityPrimaryGroom: 'city',
    ruralOrUrbanPrimaryBride: 'URBAN',
    addressLine1UrbanOptionPrimaryBride: 'test',
    addressLine3UrbanOptionPrimaryBride: 'test',
    postalCodePrimaryBride: '00560'
  },
  groom: {
    name: {
      firstNames: faker.person.firstName('male'),
      familyName: faker.person.lastName('male')
    },
    birthDate: getRandomDate(22, 200),
    nationality: 'Farajaland',
    identifier: {
      id: faker.string.numeric(10),
      type: 'National ID'
    },
    address: 'Same as mother',
    cityPrimaryGroom: 'city',
    ruralOrUrbanPrimaryGroom: 'URBAN',
    addressLine1UrbanOptionPrimaryGroom: 'test',
    addressLine3UrbanOptionPrimaryGroom: 'test',
    postalCodePrimaryGroom: '00560'
  },
  marriageDetails: {
    marriageDate: getRandomDate(22, 200),
    typeOfMarriage: 'Monogamous',
    nationality: 'Farajaland',
    identifier: {
      id: faker.string.numeric(10),
      type: 'National ID'
    },
    address: {
      Country: 'Farajaland',
      Province: 'Pualula',
      District: 'Pili'
    },

    cityPlaceofmarriage: 'city',
    addressLine1UrbanOptionPlaceofmarriage: 'URBAN',
    addressLine2UrbanOptionPlaceofmarriage: 'test',
    addressLine3UrbanOptionPlaceofmarriage: 'test',
    postalCodePlaceofmarriage: '00560'
  },
  witness1: {
    name: {
      firstNames: faker.person.firstName('male'),
      familyName: faker.person.lastName('male')
    },
    relationship: 'Head of grooms family'
  },
  witness2: {
    name: {
      firstNames: faker.person.firstName('male'),
      familyName: faker.person.lastName('male')
    },
    relationship: 'Head of grooms family'
  }
}

const PHONE_ERROR_MESSAGE =
  'Must be a valid 10 digit number that starts with 0(7|9)'
const EMAIL_ERROR_MESSAGE = 'Must be a valid email address'

test.describe.configure({ mode: 'serial' })

let page: Page

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage()
})

test.afterAll(async () => {
  await page.close()
})

test.describe('3. Validate the marriage registration flow when informant is other than Groom/ Bride', () => {
  test('1. Navigate to the marriage event declaration page', async () => {
    await login(
      page,
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await createPIN(page)
    await page.click('#header_new_event')
    await expect(page.getByText('New Declaration')).toBeVisible()
    await expect(page.getByText('Event type')).toBeVisible()
  })

  test('2.1. Validate the contents of the event type page', async () => {
    /*
     * Expected result: should show
     * - Radio buttons of the events
     * - Continue button
     * - Exit button
     */
    await expect(page.getByLabel('Birth')).toBeVisible()
    await expect(page.getByLabel('Death')).toBeVisible()
    await expect(page.getByLabel('Marriage')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Exit' })).toBeVisible()
  })

  test('2.2. Click the "Continue" button without selecting any event', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()
    /*
     * Expected result: should throw an error as below:
     * "Please select the type of event"
     */
    await expect(
      page.getByText('Please select the type of event')
    ).toBeVisible()
  })

  test('2.3. Select the "Marriage" event and click "Continue" button', async () => {
    await page.getByLabel('Marriage').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await validateSectionButtons(page)

    /*
     * Expected result: User should navigate to the "Introduction" page
     */
    await expect(
      page.getByText("Informant's details", { exact: true })
    ).toBeVisible()
  })

  // There is no "Introduction" step in marriage declaration flow.
  test.skip('3. Validate "Introduction" page', async () => {})

  test('4. Validate Informant details page', async () => {
    await test.step('4.1. Validate the contents of Informant type page', async () => {
      await validateSectionButtons(page)
      await expect(page.getByText('Informant type')).toBeVisible()
      await expect(page.getByText('Phone number')).toBeVisible()
      await expect(page.getByText('Email')).toBeVisible()
    })

    await test.step('4.2. Click the "Continue" button without selecting any Informant type', async () => {
      /*
       * Expected result: Should throw an error as below: "Required for registration"
       */
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Back' }).click()
      await expect(page.locator('#informantType_error')).toBeVisible()
    })
    await test.step('4.3. Select Head of Grooms family/ Head of Brides family in informant type', async () => {
      /*
       * Expected result: Should not add any other field
       */
      await page.locator('#informantType').click()
      await page
        .getByText(declaration.informantDetails.informantType, {
          exact: true
        })
        .click()
      await expect(page.locator('#firstNamesEng_label')).toContainText(
        'First name(s)'
      )
      await expect(page.locator('#familyNameEng_label')).toContainText(
        'Last name'
      )
      await expect(page.locator('#informantBirthDate_label')).toContainText(
        'Date of birth'
      )
      await expect(page.locator('#nationality_label')).toContainText(
        'Nationality'
      )
      await expect(page.locator('#informantIdType_label')).toContainText(
        'Type of ID'
      )
      await expect(
        page.locator('#countryPrimaryInformant_label')
      ).toContainText('Country')
      await expect(page.locator('#statePrimaryInformant_label')).toContainText(
        'Province'
      )
      await expect(
        page.locator('#districtPrimaryInformant_label')
      ).toContainText('District')
      await expect(page.getByLabel('Urban')).toBeVisible()
      await expect(page.getByLabel('Rural')).toBeVisible()

      await expect(page.locator('#cityPrimaryInformant_label')).toContainText(
        'Town'
      )
      await expect(
        page.locator('#addressLine1UrbanOptionPrimaryInformant_label')
      ).toContainText('Residential Area')
      await expect(
        page.locator('#addressLine2UrbanOptionPrimaryInformant_label')
      ).toContainText('Street')
      await expect(
        page.locator('#addressLine3UrbanOptionPrimaryInformant_label')
      ).toContainText('Number')
      await expect(
        page.locator('#postalCodePrimaryInformant_label')
      ).toContainText('Postcode / Zip')
      await expect(page.locator('#registrationPhone_label')).toContainText(
        'Phone number'
      )
      await expect(page.locator('#registrationEmail_label')).toContainText(
        'Email'
      )

      // When selected Rural: Should see Village, Email and Phone number
      await page.getByLabel('Rural').click()

      await expect(
        page.locator('#addressLine1RuralOptionPrimaryInformant_label')
      ).toContainText('Village')
      await expect(page.locator('#registrationPhone_label')).toContainText(
        'Phone number'
      )
      await expect(page.locator('#registrationEmail_label')).toContainText(
        'Email'
      )

      await expect(
        page.locator('#cityPrimaryInformant_label', {
          hasText: 'Town'
        })
      ).toBeHidden()
      await expect(
        page.locator('#addressLine1UrbanOptionPrimaryInformant_label', {
          hasText: 'Residential Area'
        })
      ).toBeHidden()
      await expect(
        page.locator('#addressLine2UrbanOptionPrimaryInformant_label', {
          hasText: 'Street'
        })
      ).toBeHidden()
      await expect(
        page.locator('#addressLine3UrbanOptionPrimaryInformant_label', {
          hasText: 'Number'
        })
      ).toBeHidden()
      await expect(
        page.locator('#postalCodePrimaryInformant_label', {
          hasText: 'Postcode / Zip'
        })
      ).toBeHidden()
    })
    await test.step('4.5. Select "Someone else" in Relationship to spouse ', async () => {})
  })

  test('5. Validate Informant details phone field', async () => {
    // Phone number field is not a required field in marriage Informant's details page
    /* await test.step('5.1. Validate Informant phone number field', async () => {
    // 1. Set the Phone number field as null
    // Expected result: Should show "Required for registration"
      page.locator('label', { hasText: 'Phone number' }).click()
      page.getByText("Informant's details", { exact: true }).click()
      await expect(
        page.getByText('Required for registration', { exact: true })
      ).toBeVisible()
    }) */
    await test.step('5.2. Validate Informant phone number field', async () => {
      // 2. Input any contact number starting with any number except "07/09"
      // await page.locator('label', { hasText: 'Phone number' }).fill('123456789')
      await page.locator('#registrationPhone').fill('123456789')
      await expect(
        page.getByText(PHONE_ERROR_MESSAGE, {
          exact: true
        })
      ).toBeVisible()
    })

    await test.step('5.3. Validate Informant phone number field', async () => {
      // 3. Input any number which is less or greater than 10 digits
      await page.locator('#registrationPhone').fill('092345')
      await expect(
        page.getByText(PHONE_ERROR_MESSAGE, {
          exact: true
        })
      ).toBeVisible()
    })

    await test.step('5.4. Validate Informant phone number field', async () => {
      // 4. Input a valid 10 digit number that starts with "0"
      await page.locator('#registrationPhone').fill('0923456789')
      await expect(
        page.getByText(PHONE_ERROR_MESSAGE, {
          exact: true
        })
      ).toBeHidden()
      await expect(
        page.locator('#registrationPhone-form-input', {
          hasText: 'Required for registration'
        })
      ).toBeHidden()
    })
  })
  test('6. Validate Informant details email field', async () => {
    await test.step('6.1. Enter valid Email address', async () => {
      await page.locator('#registrationEmail').fill('test@hotmail.com')
      await expect(
        page.getByText(EMAIL_ERROR_MESSAGE, {
          exact: true
        })
      ).toBeHidden()
      await expect(
        page.locator('#registrationEmail-form-input', {
          hasText: 'Required for registration'
        })
      ).toBeHidden()
    })
    await test.step('6.2. Enter Invalid Email address', async () => {
      await page.locator('#registrationEmail').fill('testhotmail.com')
      await expect(
        page.getByText(EMAIL_ERROR_MESSAGE, {
          exact: true
        })
      ).toBeVisible()
    })
    await test.step('6.3. Keep Email address empty > Click on the "Continue" button', async () => {
      await page.locator('#registrationEmail').fill('')
      await page.locator('#registrationEmail').click()
      await page.getByText("Informant's details", { exact: true }).click()
      await expect(
        page.locator('#registrationEmail-form-input', {
          hasText: 'Required for registration'
        })
      ).toBeVisible()
    })
    await test.step('6.4. Click Continue ', async () => {
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText("Groom's details", { exact: true })
      ).toBeVisible()
    })
  })
  test('7. Validate Groom Details page', async () => {
    await test.step('7.2. Validate Groom Details page', async () => {
      /* This should run testcase 4 "Validate Groom details page" */
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText("Bride's details", { exact: true })
      ).toBeVisible()
    })
  })
  test('8. Validate Bride Details page', async () => {
    await test.step('8.2. Validate Bride Details page', async () => {
      /* This should run testcase 5 "Validate Bride details page" */
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Marriage details', { exact: true })
      ).toBeVisible()
    })
  })
  test('9. Validate Marriage Details page', async () => {
    await test.step('9.2. Validate Marriage Details page', async () => {
      /* This should run testcase 6 "Validate marriage details page" */
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Witness 1 details', { exact: true })
      ).toBeVisible()
    })
  })
  test('10. Validate witness 1 Details page', async () => {
    await test.step('10.2. Validate witness 1 Details page', async () => {
      /* This should run testcase 7 "Validate witness 1 details page" */
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Witness 2 details', { exact: true })
      ).toBeVisible()
    })
  })
  test('11. Validate witness 1 Details page', async () => {
    await test.step('11.2. Validate witness 2 Details page', async () => {
      /* This should run testcase 8 "Validate witness 2 details page" */
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      await expect(
        page.getByText('Upload supporting documents', { exact: true })
      ).toBeVisible()
    })
  })
  test('12. Validate Supporting document page', async () => {
    await test.step('12.2. Validate Supporting document page', async () => {
      /* This should run testcase 9 "Validate Attaching supporting documents page" */
      await validateSectionButtons(page)
      await page.getByText('Continue', { exact: true }).click()
      page.getByText('Register event', { exact: true })
    })
  })
  test.skip('13. Validate "Declaration review" page', async () => {})
})
