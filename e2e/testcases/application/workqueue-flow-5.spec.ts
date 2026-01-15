import { faker } from '@faker-js/faker'
import { test, expect, type Page } from '@playwright/test'
import {
  continueForm,
  drawSignature,
  formatName,
  getRandomDate,
  goToSection,
  login,
  selectDeclarationAction
} from '../../helpers'
import { CREDENTIALS } from '../../constants'
import {
  ensureAssigned,
  ensureInExternalValidationIsEmpty,
  ensureOutboxIsEmpty,
  selectAction
} from '../../utils'
import {
  assertRecordInWorkqueue,
  assignFromWorkqueue,
  fillDate
} from '../birth/helpers'
import { getRowByTitle } from '../print-certificate/birth/helpers'

// FA Notifies => RO Rejects => FA Re-notifies with edits => RO declares and validates => Registrar rejects
// => RO validates again => Registrar registers
test.describe.serial('5. Workqueue flow - 5', () => {
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
        district: 'Irundu'
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

  const childName = formatName(declaration.child.name)

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Notify by FA', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.FIELD_AGENT)
      await page.click('#header-new-event')
      await page.getByLabel('Birth').click()
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })

    test('Fill child details', async () => {
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

    test('Go to review', async () => {
      await goToSection(page, 'review')
    })

    test('Fill up informant comment & signature', async () => {
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()

      await expect(page.getByRole('dialog')).not.toBeVisible()
    })

    test('Notify', async () => {
      await selectDeclarationAction(page, 'Notify')
      await ensureOutboxIsEmpty(page)
    })
  })

  test.describe('Reject by RO', async () => {
    test('Login', async () => {
      await login(page, CREDENTIALS.REGISTRATION_AGENT)
    })

    test('Review & Reject', async () => {
      await page.getByText('Notifications').click()
      await page
        .getByRole('button', {
          name: childName
        })
        .click()

      await selectAction(page, 'Review')
      await selectDeclarationAction(page, 'Reject', false)
      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Send For Update' }).click()
    })

    test('Ensure rejection is no longer available', async () => {
      await page.getByRole('button', { name: 'Recent' }).click()
      await page
        .getByRole('button', {
          name: childName
        })
        .click()

      await expect(page.getByText('Rejected')).toBeVisible()

      await ensureAssigned(page)
      await page.getByRole('button', { name: 'Action' }).click()
      await expect(page.getByText('Reject', { exact: true })).not.toBeVisible()
      await expect(page.getByText('Review', { exact: true })).not.toBeVisible()
      await page.getByRole('button', { name: 'Action' }).click()
    })

    test('Unassign', async () => {
      await selectAction(page, 'Unassign')
      await page.getByRole('button', { name: 'Unassign', exact: true }).click()
      await expect(page.getByText('Not assigned')).toBeVisible()
    })
  })

  test.describe('Re-notify by FA', async () => {
    test('Login', async () => {
      await login(page, CREDENTIALS.FIELD_AGENT, true)
      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Pending updates', exists: true }
        ]
      })
    })
    test('Go to edit', async () => {
      await assignFromWorkqueue(page, childName)

      await getRowByTitle(page, childName)
        .getByRole('button', { name: 'Edit' })
        .click()
    })

    test('Fill informant details', async () => {
      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()

      await page.locator('#informant____relation').click()
      await page
        .getByText(declaration.informantType, {
          exact: true
        })
        .click()

      await page.locator('#informant____email').fill(declaration.informantEmail)

      await page
        .getByRole('button', { name: 'Back to review', exact: true })
        .click()
    })

    test('Notify with edits', async () => {
      await selectDeclarationAction(page, 'Notify with edits')
      await ensureOutboxIsEmpty(page)
    })

    test('Verify workqueue', async () => {
      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Pending updates', exists: false }
        ]
      })
    })
  })

  test.describe('Declare and validate by RO', async () => {
    test('Verify workqueue', async () => {
      await login(page, CREDENTIALS.REGISTRATION_AGENT, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: true },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    test('Go to Review', async () => {
      await page.getByText('Notifications').click()
      await page
        .getByRole('button', {
          name: childName
        })
        .click()

      await selectAction(page, 'Review')
    })

    test('Fill missing details', async () => {
      await page
        .getByTestId('accordion-Accordion_mother')
        .getByRole('button', { name: 'Change all' })
        .click()

      await page.getByRole('button', { name: 'Continue' }).click()

      await page.locator('#firstname').fill(declaration.mother.name.firstNames)
      await page.locator('#surname').fill(declaration.mother.name.familyName)

      await page.getByPlaceholder('dd').fill(declaration.mother.birthDate.dd)
      await page.getByPlaceholder('mm').fill(declaration.mother.birthDate.mm)
      await page
        .getByPlaceholder('yyyy')
        .fill(declaration.mother.birthDate.yyyy)

      await page.locator('#mother____idType').click()
      await page
        .getByText(declaration.mother.identifier.type, { exact: true })
        .click()

      await page
        .locator('#mother____nid')
        .fill(declaration.mother.identifier.id)

      await page.locator('#country').click()
      await page
        .locator('#country input')
        .fill(declaration.mother.address.country.slice(0, 3))
      await page
        .locator('#country')
        .getByText(declaration.mother.address.country, { exact: true })
        .click()

      await page.locator('#province').click()
      await page
        .getByText(declaration.mother.address.province, { exact: true })
        .click()
      await page.locator('#district').click()
      await page
        .getByText(declaration.mother.address.district, { exact: true })
        .click()

      await continueForm(page)

      await page.locator('#firstname').fill(declaration.father.name.firstNames)
      await page.locator('#surname').fill(declaration.father.name.familyName)

      await fillDate(page, declaration.father.birthDate)

      await page.locator('#father____idType').click()
      await page
        .getByText(declaration.father.identifier.type, { exact: true })
        .click()

      await page
        .locator('#father____nid')
        .fill(declaration.father.identifier.id)

      await page.locator('#father____nationality').click()
      await page
        .getByText(declaration.father.nationality, { exact: true })
        .click()

      await page.locator('#father____addressSameAs_YES').click()
    })

    test('Fill up informant comment & signature', async () => {
      await continueForm(page, 'Back to review')
      await page.locator('#review____comment').fill(faker.lorem.sentence())
      await page.getByRole('button', { name: 'Sign', exact: true }).click()
      await drawSignature(page, 'review____signature_canvas_element', false)
      await page
        .locator('#review____signature_modal')
        .getByRole('button', { name: 'Apply' })
        .click()
    })

    test('Declare', async () => {
      await selectDeclarationAction(page, 'Declare')
    })
  })

  test.describe('Reject by Registrar', async () => {
    test('Login with Registrar', async () => {
      await login(page, CREDENTIALS.LOCAL_REGISTRAR)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'My drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: true },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
    test('Reject', async () => {
      await page.getByText('Pending registration').click()

      await assignFromWorkqueue(page, childName)
      await getRowByTitle(page, childName)
        .getByRole('button', { name: 'Review' })
        .click()

      await selectDeclarationAction(page, 'Reject', false)

      await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

      await page.getByRole('button', { name: 'Send For Update' }).click()

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'My drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: true },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })
  test.describe('Re-declare with edits by RA', async () => {
    test('Login with RA', async () => {
      await login(page, CREDENTIALS.REGISTRATION_AGENT, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: true },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })

    test('Go to edit', async () => {
      await page.getByText('Pending updates').click()
      await assignFromWorkqueue(page, childName)
      await getRowByTitle(page, childName)
        .getByRole('button', { name: 'Edit' })
        .click()
    })

    test('Change informant email', async () => {
      await page
        .getByTestId('accordion-Accordion_informant')
        .getByRole('button', { name: 'Change all' })
        .click()

      await page.locator('#informant____email').fill(faker.internet.email())

      await page
        .getByRole('button', { name: 'Back to review', exact: true })
        .click()
    })

    test('Re-declare with edits', async () => {
      await selectDeclarationAction(page, 'Declare with edits')

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Pending validation', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })

  test.describe('Register by Registrar', async () => {
    test('Login with Registrar', async () => {
      await login(page, CREDENTIALS.LOCAL_REGISTRAR, true)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'My drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: false },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: true },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: false },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
    test('Register', async () => {
      await page.getByText('Pending registration').click()

      await assignFromWorkqueue(page, childName)
      await getRowByTitle(page, childName)
        .getByRole('button', { name: 'Review' })
        .click()

      await selectAction(page, 'Register')
      await page.getByRole('button', { name: 'Confirm' }).click()
      await ensureInExternalValidationIsEmpty(page)

      await assertRecordInWorkqueue({
        page,
        name: childName,
        workqueues: [
          { title: 'Outbox', exists: false },
          { title: 'My drafts', exists: false },
          { title: 'Assigned to you', exists: false },
          { title: 'Recent', exists: true },
          { title: 'Notifications', exists: false },
          { title: 'Potential duplicate', exists: false },
          { title: 'Pending updates', exists: false },
          { title: 'Pending approval', exists: false },
          { title: 'Pending registration', exists: false },
          { title: 'Escalated', exists: false },
          { title: 'In external validation', exists: false },
          { title: 'Pending certification', exists: true },
          { title: 'Pending issuance', exists: false }
        ]
      })
    })
  })
})
