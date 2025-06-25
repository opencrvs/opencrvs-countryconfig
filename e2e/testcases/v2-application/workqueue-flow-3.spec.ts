import { faker } from '@faker-js/faker'
import { test, expect, type Page } from '@playwright/test'
import {
  drawSignature,
  formatName,
  getRandomDate,
  goToSection,
  loginToV2
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { ensureOutboxIsEmpty, selectAction } from '../../v2-utils'
import { assertRecordInWorkqueue } from '../v2-birth/helpers'

// FA Notifies => RA Rejects

test.describe.serial('3. Workqueue flow - 3', () => {
  let page: Page
  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      gender: 'Male',
      birthDate: getRandomDate(0, 200)
    },
    placeOfBirth: 'Health Institution',
    birthLocation: {
      facility: 'Golden Valley Rural Health Centre',
      district: 'Ibombo',
      province: 'Central',
      country: 'Farajaland'
    },
    informantType: 'Mother',
    informantEmail: faker.internet.email(),
    mother: {
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
        country: 'Farajaland',
        province: 'Sulaka',
        district: 'Irundu',
        urbanOrRural: 'Urban'
      }
    },
    father: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      },
      birthDate: getRandomDate(22, 200),
      nationality: 'Gabon',
      identifier: {
        id: faker.string.numeric(10),
        type: 'National ID'
      },
      address: {
        sameAsMother: true
      }
    }
  }
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('3.1 Notify by FA', async () => {
    test.beforeAll(async () => {
      await loginToV2(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('3.1.1 Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)
      await page.locator('#surname').fill(declaration.child.name.familyName)
      await page.locator('#child____gender').click()
      await page.getByText(declaration.child.gender, { exact: true }).click()

      await page.getByPlaceholder('dd').fill(declaration.child.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.child.birthDate.mm)
      await page.getByPlaceholder('yyyy').fill(declaration.child.birthDate.yyyy)

      await page.locator('#child____placeOfBirth').click()
      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
      await page
        .locator('#child____birthLocation')
        .fill(declaration.birthLocation.facility.slice(0, 3))
      await page.getByText(declaration.birthLocation.facility).click()
    })

    test('3.1.2 Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('3.1.3 Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign' }).click()
      await drawSignature(page, true)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('3.1.4 Send for review', async () => {
      await page.getByRole('button', { name: 'Send for review' }).click()
      await expect(page.getByText('Send for review?')).toBeVisible()
      await page.getByRole('button', { name: 'Confirm' }).click()

      await ensureOutboxIsEmpty(page)
    })

    test('3.1.5 Verify workqueue', async () => {
      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          //   { title: 'Recent', exists: true }, // https://github.com/opencrvs/opencrvs-core/issues/9785
          { title: 'Sent for review', exists: true },
          { title: 'Requires updates', exists: false }
        ]
      })
    })
  })

  test.describe('3.2 Reject by RA', async () => {
    test('3.2.1 Verify workqueue', async () => {
      await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          //   { title: 'Recent', exists: false }, // https://github.com/opencrvs/opencrvs-core/issues/9785
          { title: 'Notifications', exists: true },
          { title: 'Ready for review', exists: true },
          { title: 'Requires updates', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Ready to print', exists: false }
        ]
      })
    })

    test('3.2.2 Review', async () => {
      await page.getByText('Ready for review').click()
      await page
        .getByRole('button', {
          name: formatName(declaration.child.name)
        })
        .click()

      await selectAction(page, 'Validate')

      await page.getByRole('button', { name: 'Reject' }).click()

      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

      await page.getByRole('button', { name: 'Send For Update' }).click()

      await assertRecordInWorkqueue({
        page,
        name: formatName(declaration.child.name),
        workqueues: [
          { title: 'Assigned to you', exists: false },
          //   { title: 'Recent', exists: true }, // https://github.com/opencrvs/opencrvs-core/issues/9785
          { title: 'Notifications', exists: false },
          { title: 'Ready for review', exists: false },
          { title: 'Sent for approval', exists: false },
          { title: 'Requires updates', exists: true },
          { title: 'In external validation', exists: false },
          { title: 'Ready to print', exists: false }
        ]
      })
    })
  })

  test('3.3 validate Workqueue for FA', async () => {
    await loginToV2(page, CREDENTIALS.FIELD_AGENT, true)

    await assertRecordInWorkqueue({
      page,
      name: formatName(declaration.child.name),
      workqueues: [
        { title: 'Assigned to you', exists: false },
        //   { title: 'Recent', exists: false }, // https://github.com/opencrvs/opencrvs-core/issues/9785
        { title: 'Sent for review', exists: false },
        { title: 'Requires updates', exists: true }
      ]
    })
  })

  test('3.4 validate Workqueue for LR', async () => {
    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)

    await assertRecordInWorkqueue({
      page,
      name: formatName(declaration.child.name),
      workqueues: [
        { title: 'Assigned to you', exists: false },
        //   { title: 'Recent', exists: true }, // https://github.com/opencrvs/opencrvs-core/issues/9785
        { title: 'Notifications', exists: false },
        { title: 'Ready for review', exists: false },
        { title: 'Requires updates', exists: true },
        { title: 'In external validation', exists: false },
        { title: 'Ready to print', exists: false }
      ]
    })
  })
})
