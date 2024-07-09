/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
// @ts-check
/// <reference path="../global.d.ts">

import { faker } from '@faker-js/faker'
import { createBirthDeclarationData } from '../../src/data-generator/declare'
import {
  Facility,
  generateLocationResource,
  Location
} from '../../src/data-generator/location'
import { CyHttpMessages } from 'cypress/types/net-stubbing'

const users = {
  fieldWorker: {
    username: 'k.bwalya',
    password: 'test'
  },
  registrar: {
    username: 'k.mweene',
    password: 'test'
  },
  sysAdmin: {
    username: 'e.mayuka',
    password: 'test'
  },
  nsysAdmin: {
    username: 'j.campbell',
    password: 'test'
  }
}

function getToken(role: keyof typeof users) {
  const user = users[role]
  return cy
    .request({
      url: `${Cypress.env('AUTH_URL')}authenticate`,
      method: 'POST',
      body: {
        username: user.username,
        password: user.password
      }
    })
    .its('body')
    .then((body) => {
      cy.request({
        url: `${Cypress.env('AUTH_URL')}verifyCode`,
        method: 'POST',
        body: {
          nonce: body.nonce,
          code: '000000'
        }
      })
        .its('body')
        .then((body) => {
          return body.token
        })
    })
}

export function getDateMonthYearFromString(dateString: string): {
  dd: string
  mm: string
  yyyy: string
} {
  if (!dateString) {
    return
  }
  const dateSplit = dateString.split('-')
  return {
    dd: dateSplit[2],
    mm: dateSplit[1],
    yyyy: dateSplit[0]
  }
}

Cypress.Commands.add('login', (userType) => {
  getToken(userType).then((token) => {
    cy.visit(`${Cypress.env('CLIENT_URL')}?token=${token}`)
  })

  // Wait for app to load so token can be stored
  cy.get('#pin-input')
})

Cypress.Commands.add('selectOption', (selector, _text, option) => {
  cy.get(`${selector} input`).first().click({ force: true })
  cy.get(`${selector} .react-select__menu`).contains(option).click()
})

Cypress.Commands.add('logout', () => {
  cy.get('#ProfileMenuToggleButton').click()
  cy.get('#ProfileMenuItem1').click()
  cy.url().should('include', `${Cypress.env('LOGIN_URL')}`)
})

function goToNextFormSection() {
  cy.get('#next_section').click()
}

Cypress.Commands.add('createPin', () => {
  // CREATE PIN
  cy.get('#pin-input', { timeout: 130000 }).click()
  for (let i = 1; i <= 8; i++) {
    cy.get('#pin-input').type(`${i % 2}`)
  }
})

Cypress.Commands.add('waitForOutboxToClear', () => {
  cy.get('#navigation_outbox').should('contain.text', '1')
  cy.get('#navigation_outbox').should('not.contain.text', '1')
})

const hasOperationName = (
  req: CyHttpMessages.IncomingRequest,
  operationName: string
) => {
  const { body } = req
  return 'operationName' in body && body.operationName === operationName
}

Cypress.Commands.add('submitDeclaration', (incomplete = false) => {
  cy.intercept('/graphql', (req) => {
    if (hasOperationName(req, 'createBirthRegistration')) {
      req.alias = 'createRegistration'
      req.on('response', (res) => {
        const compositionId =
          res.body?.data?.createBirthRegistration?.compositionId
        expect(compositionId).to.be.a('string')
      })
    }
    if (hasOperationName(req, 'createDeathRegistration')) {
      req.alias = 'createRegistration'
      req.on('response', (res) => {
        const compositionId =
          res.body?.data?.createDeathRegistration?.compositionId
        expect(compositionId).to.be.a('string')
      })
    }
  })
  if (!incomplete) {
    cy.contains('Declaration complete')
  }
  cy.get('#submit_form').click()
  cy.get('#submit_confirm').click()

  cy.log('Waiting for declaration to sync...')
  cy.wait('@createRegistration', {
    timeout: 60000
  })
})

Cypress.Commands.add('reviewForm', () => {
  cy.get('#navigation_readyForReview').click()
  cy.downloadFirstDeclaration()
  cy.get('#ListItemAction-0-Review').click()
})

Cypress.Commands.add('registerForm', () => {
  cy.get('#registerDeclarationBtn').click()
  cy.get('#submit_confirm').click()
  cy.waitForOutboxToClear()
})

Cypress.Commands.add('clickUserListItemByName', (name, actionText) => {
  cy.xpath(
    `//button[contains(text(), "${name}")]/ancestor::tr/descendant::nav/button`
  ).click({ force: true })

  cy.get('[id$=-menuSubMenu]').should('is.visible')
  cy.get('[id$=-menuSubMenu]').scrollIntoView()
  cy.get('[id$=-menuSubMenu] > li').contains(actionText).click()
})

Cypress.Commands.add('rejectDeclaration', () => {
  cy.get('#rejectDeclarationBtn').click()
  // REJECT MODAL
  cy.get('#rejectionCommentForHealthWorker').click()
  cy.get('#rejectionCommentForHealthWorker').type(
    'Lack of information, please notify informant about it.'
  )
  // PREVIEW
  cy.get('#submit_reject_form').click()
  cy.log('Waiting for declaration to sync...')
  cy.get('#Spinner').should('exist')
})

Cypress.Commands.add('registerDeclaration', () => {
  cy.get('#registerDeclarationBtn').click()
  // MODAL
  cy.get('#submit_confirm').click()
  cy.log('Waiting for declaration to sync...')
  cy.get('#Spinner').should('exist')
  cy.get('#navigation_readyForReview').contains('Ready for review')
})

Cypress.Commands.add('goToVitalEventSelection', () => {
  cy.get('#header_new_event').click()
})

Cypress.Commands.add('downloadFirstDeclaration', () => {
  cy.get('#ListItemAction-0-icon').first().click()
  // If the declaration is already assigned to the user
  // then the modal won't show up
  cy.get('body').then(($body) => {
    if ($body.find('#assignment').length) {
      cy.get('#assign').click()
    }
  })
  cy.log('Waiting for declaration to sync...')

  cy.get('#action-loading-ListItemAction-0').should('not.exist')
})

export function getRandomNumbers(stringLength: number) {
  let result = ''
  for (let i = 0; i < stringLength; i++) {
    result += Math.floor(Math.random() * 10)
  }
  return result
}

function getLocationWithName(token: string, name: string) {
  return cy
    .request<{ entry: Array<{ resource: Location }> }>({
      method: 'GET',
      url: `${Cypress.env(
        'GATEWAY_URL'
      )}location?type=ADMIN_STRUCTURE&_count=0`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .its('body')
    .then((body) => {
      return body.entry
        .map((fhirEntry) => generateLocationResource(fhirEntry.resource))
        .find((location) => location.name === name)
    })
}

function getRandomFacility(token: string, location: Location) {
  return cy
    .request<{ entry: Array<{ resource: any }> }>({
      method: 'GET',
      url: `${Cypress.env(
        'GATEWAY_URL'
      )}location?type=HEALTH_FACILITY&_count=0`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .its('body')
    .then((body) => {
      return body.entry
        .map((fhirEntry) => generateLocationResource(fhirEntry.resource))
        .find(
          (facility: Facility) => facility.partOf === `Location/${location.id}`
        )
    })
}

Cypress.Commands.add('createBirthRegistrationAs', (role, options = {}) => {
  return getToken(role).then((token) => {
    return getLocationWithName(token, 'Ibombo').then((location) => {
      return getRandomFacility(token, location).then(async (facility) => {
        cy.readFile('cypress/support/assets/528KB-random.png', 'base64').then(
          (file) => {
            const details = createBirthDeclarationData(
              'male',
              new Date('2018-05-18T13:18:26.240Z'),
              new Date(),
              location,
              facility,
              file
            )

            if (options.firstName) {
              details.child.name = [
                {
                  use: 'en',
                  firstNames: options.firstName || faker.name.firstName(),
                  familyName: options.familyName || faker.name.lastName()
                }
              ]
            }
            cy.intercept('/graphql', (req) => {
              if (hasOperationName(req, 'createBirthRegistration')) {
                req.on('response', (res) => {
                  const compositionId =
                    res.body?.data?.createBirthRegistration?.compositionId
                  expect(compositionId).to.be.a('string')
                })
              }
            })

            cy.request({
              url: Cypress.env('GATEWAY_URL') + 'graphql',
              method: 'POST',
              headers: {
                authorization: `Bearer ${token}`
              },
              body: {
                operationName: 'createBirthRegistration',
                variables: {
                  details
                },
                query:
                  'mutation createBirthRegistration($details: BirthRegistrationInput!) {\n  createBirthRegistration(details: $details) {\n    trackingId\n    compositionId\n    __typename\n  }\n}\n'
              }
            }).as('createRegistration')
            cy.get('@createRegistration').should((response) => {
              expect((response as any).status).to.eq(200)
            })
          }
        )
      })
    })
  })
})

Cypress.Commands.add('enterBirthMaximumInput', (options) => {
  const childDoBSplit = getDateMonthYearFromString(options?.childDoB)
  const motherDoBSplit = getDateMonthYearFromString(options?.motherDoB)
  const fatherDoBSplit = getDateMonthYearFromString(options?.fatherDoB)
  const informantDoBSplit = getDateMonthYearFromString(options?.informantDoB)

  // EVENTS
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()

  // DECLARATION FORM

  // INTRODUCTION
  goToNextFormSection()

  // CHILD DETAILS
  cy.get('#firstNamesEng').type(
    options?.childFirstNames || faker.name.firstName()
  )
  cy.get('#familyNameEng').type(options?.childLastName || faker.name.lastName())
  cy.selectOption(
    '#gender',
    options?.childGender || 'Male',
    options?.childGender || 'Male'
  )
  cy.get('#childBirthDate-dd').type(childDoBSplit?.dd || '11')
  cy.get('#childBirthDate-mm').type(childDoBSplit?.mm || '11')
  cy.get('#childBirthDate-yyyy').type(childDoBSplit?.yyyy || '1997')
  cy.get('body').then(($body) => {
    if ($body.find('#reasonForLateRegistration').length) {
      cy.get('#reasonForLateRegistration').type('Late registration')
    }
  })
  cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
  cy.selectOption('#birthType', 'Single', 'Single')
  cy.get('#weightAtBirth').type('1.5')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Residential address')
  cy.selectOption('#countryPlaceofbirth', 'Farajaland', 'Farajaland')
  cy.selectOption(
    '#statePlaceofbirth',
    options?.eventLocationLevel1 || 'Pualula',
    options?.eventLocationLevel1 || 'Pualula'
  )
  cy.selectOption(
    '#districtPlaceofbirth',
    options?.eventLocationLevel2 || 'Embe',
    options?.eventLocationLevel2 || 'Embe'
  )
  cy.get('#cityPlaceofbirth').type('My city')
  cy.get('#addressLine1UrbanOptionPlaceofbirth').type('My residential area')
  cy.get('#addressLine2UrbanOptionPlaceofbirth').type('My street')
  cy.get('#addressLine3UrbanOptionPlaceofbirth').type('40')
  goToNextFormSection()

  // INFORMANT DETAILS
  selectInformant(options?.informantType || 'Grandfather')
  cy.get('#registrationPhone').type('07' + getRandomNumbers(8))
  cy.get('#registrationEmail').type('axonishere@gmail.com')

  //INFORMANT DETAILS(IF informant data is available)
  if (!['Father', 'Mother'].includes(options?.informantType)) {
    cy.get('#firstNamesEng').type(options?.informantFirstNames || 'Alom')
    cy.get('#familyNameEng').type(options?.informantFamilyName || 'Mia')
    cy.get('#informantBirthDate-dd').type(informantDoBSplit.dd || '23')
    cy.get('#informantBirthDate-mm').type(informantDoBSplit.mm || '10')
    cy.get('#informantBirthDate-yyyy').type(informantDoBSplit.yyyy || '1975')
    cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
    cy.selectOption('#informantIdType', 'National ID', 'National ID')
    cy.get('#informantNationalId').type(getRandomNumbers(10))
    cy.selectOption('#countryPrimaryInformant', 'Farajaland', 'Farajaland')
    cy.selectOption('#statePrimaryInformant', 'Pualula', 'Pualula')
    cy.selectOption('#districtPrimaryInformant', 'Embe', 'Embe')
  }
  goToNextFormSection()
  // MOTHER DETAILS
  cy.selectOption('#motherIdType', 'National ID', 'National ID')
  cy.get('#motherNationalId').type(getRandomNumbers(10))
  cy.get('#motherBirthDate-dd').type(motherDoBSplit?.dd || '23')
  cy.get('#motherBirthDate-mm').type(motherDoBSplit?.mm || '10')
  cy.get('#motherBirthDate-yyyy').type(motherDoBSplit?.yyyy || '1969')
  cy.get('#firstNamesEng').type(options?.motherFirstNames || 'Agnes')
  cy.get('#familyNameEng').type(
    options?.motherFamilyName || faker.name.lastName()
  )
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#multipleBirth').type('2')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
  cy.selectOption('#countryPrimaryMother', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryMother', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryMother', 'Embe', 'Embe')
  cy.get('#cityPrimaryMother').type('My town')
  cy.get('#addressLine1UrbanOptionPrimaryMother').type('My residental area')

  cy.get('#addressLine2UrbanOptionPrimaryMother').type('My street')
  cy.get('#addressLine3UrbanOptionPrimaryMother').type('40')
  goToNextFormSection()

  // FATHER DETAILS
  cy.selectOption('#fatherIdType', 'National ID', 'National ID')
  cy.get('#fatherNationalId').type(getRandomNumbers(10))
  cy.get('#fatherBirthDate-dd').type(fatherDoBSplit?.dd || '23')
  cy.get('#fatherBirthDate-mm').type(fatherDoBSplit?.mm || '10')
  cy.get('#fatherBirthDate-yyyy').type(fatherDoBSplit?.yyyy || '1969')
  cy.get('#firstNamesEng').type(options?.fatherFirstNames || 'Jack')
  cy.get('#familyNameEng').type(options?.fatherFamilyName || 'Maa')
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
  cy.get('#primaryAddressSameAsOtherPrimary_false').click()
  cy.selectOption('#countryPrimaryFather', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryFather', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryFather', 'Embe', 'Embe')
  cy.get('#cityPrimaryFather').type('My town')
  cy.get('#addressLine1UrbanOptionPrimaryFather').type('My residential area')
  cy.get('#addressLine2UrbanOptionPrimaryFather').type('My street')
  cy.get('#addressLine2UrbanOptionPrimaryFather').type('40')
  goToNextFormSection()

  // DOCUMENTS
  goToNextFormSection()
})

function selectInformant(informantType: string) {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500)
  // SELECT INFORMANT
  cy.selectOption('#informantType', informantType, informantType)
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500)
}

Cypress.Commands.add('enterBirthMinimumInput', () => {
  // EVENTS
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()

  // DECLARATION FORM

  // INTRODUCTION
  goToNextFormSection()

  // CHILD DETAILS
  cy.get('#firstNamesEng').type(faker.name.firstName())
  cy.get('#familyNameEng').type(faker.name.lastName())
  cy.selectOption('#gender', 'Male', 'Male')
  cy.get('#childBirthDate-dd').type(
    Math.floor(1 + Math.random() * 27)
      .toString()
      .padStart(2, '0')
  )
  cy.get('#childBirthDate-mm').type(
    Math.floor(1 + Math.random() * 12)
      .toString()
      .padStart(2, '0')
  )
  cy.get('#childBirthDate-yyyy').type('2018')
  cy.get('body').then(($body) => {
    if ($body.find('#reasonForLateRegistration').length) {
      cy.get('#reasonForLateRegistration').type('Late registration')
    }
  })
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Residential address')
  cy.selectOption('#countryPlaceofbirth', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePlaceofbirth', 'Pualula', 'Pualula')
  cy.selectOption('#districtPlaceofbirth', 'Embe', 'Embe')
  goToNextFormSection()

  // INFORMANT DETAILS
  selectInformant('Mother')

  cy.get('#registrationEmail').type(faker.internet.email())
  goToNextFormSection()

  // MOTHER DETAILS
  cy.selectOption('#motherIdType', 'National ID', 'National ID')
  cy.get('#motherNationalId').type(getRandomNumbers(10))
  cy.get('#firstNamesEng').type('Rokeya')
  cy.get('#familyNameEng').type(faker.name.lastName())
  cy.get('#motherBirthDate-dd').type('23')
  cy.get('#motherBirthDate-mm').type('10')
  cy.get('#motherBirthDate-yyyy').type('1969')
  cy.selectOption('#countryPrimaryMother', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryMother', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryMother', 'Embe', 'Embe')
  goToNextFormSection()

  // FATHER DETAILS
  cy.selectOption('#fatherIdType', 'National ID', 'National ID')
  cy.get('#fatherNationalId').type(getRandomNumbers(10))

  cy.get('#firstNamesEng').type('Joe')
  cy.get('#familyNameEng').type('Bieden')
  cy.get('#fatherBirthDate-dd').type('23')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1969')
  goToNextFormSection()

  // DOCUMENTS
  goToNextFormSection()
})

Cypress.Commands.add('enterDeathMinimumInput', (options) => {
  // DECLARATION FORM
  cy.get('#select_death_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  goToNextFormSection()

  // DECEASED DETAILS

  cy.selectOption('#deceasedIdType', 'National ID', 'National ID')
  cy.get('#deceasedNationalId').type('1234567891')

  cy.get('#firstNamesEng').type(options?.deceasedFirstNames || 'Agnes')
  cy.get('#familyNameEng').type(options?.deceasedFamilyName || 'Aktar')
  cy.get('#deceasedBirthDate-dd').type('16')
  cy.get('#deceasedBirthDate-mm').type('06')
  cy.get('#deceasedBirthDate-yyyy').type('1988')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.selectOption('#countryPrimaryDeceased', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryDeceased', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryDeceased', 'Embe', 'Embe')
  goToNextFormSection()

  // EVENT DETAILS

  cy.get('#deathDate-dd').type('18')
  cy.get('#deathDate-mm').type('01')
  cy.get('#deathDate-yyyy').type('2022')
  cy.get('body').then(($body) => {
    if ($body.find('#reasonForLateRegistration').length) {
      cy.get('#reasonForLateRegistration').type('Late registration')
    }
  })

  // MANNER OF DEATH
  cy.selectOption('#mannerOfDeath', '', 'Natural causes')
  cy.get('#causeOfDeathEstablished').click()
  cy.selectOption('#causeOfDeathMethod', '', 'Physician')
  cy.selectOption('#placeOfDeath', '', "Deceased's usual place of residence")

  goToNextFormSection()

  // Informant details

  const informantType = options?.informantType ?? 'Spouse'

  selectInformant(informantType)

  if (informantType !== 'Spouse') {
    cy.selectOption('#informantIdType', 'National ID', 'National ID')
    cy.get('#informantNationalId').type('9123456781')
    cy.get('#informantBirthDate-dd').type('16')
    cy.get('#informantBirthDate-mm').type('06')
    cy.get('#informantBirthDate-yyyy').type('1988')
    cy.get('#firstNamesEng').type('Soumita')
    cy.get('#familyNameEng').type('Aktar')
  }
  cy.get('#registrationEmail').type(faker.internet.email())

  goToNextFormSection()

  // Spouse section

  cy.selectOption('#spouseIdType', 'National ID', 'National ID')
  cy.get('#spouseNationalId').type('9123456781')
  cy.get('#spouseBirthDate-dd').type('12')
  cy.get('#spouseBirthDate-mm').type('09')
  cy.get('#spouseBirthDate-yyyy').type('1995')
  cy.get('#firstNamesEng').type('Jannet')
  cy.get('#familyNameEng').type('Stacy')

  goToNextFormSection()

  // Supporting documents

  goToNextFormSection()
})

Cypress.Commands.add('enterDeathMaximumInput', (options) => {
  const deceasedDoBSplit = getDateMonthYearFromString(options?.deceasedDoB)
  const informantDoBSplit = getDateMonthYearFromString(options?.informantDoB)
  // DECLARATION FORM
  cy.get('#select_death_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  goToNextFormSection()

  // DECEASED DETAILS
  cy.selectOption('#deceasedIdType', 'National ID', 'National ID')
  cy.get('#deceasedNationalId').type('1234567891')

  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#firstNamesEng').type(
    options?.deceasedFirstNames || faker.name.firstName()
  )
  cy.get('#familyNameEng').type(
    options?.deceasedFamilyName || faker.name.lastName()
  )
  cy.get('#deceasedBirthDate-dd').type(deceasedDoBSplit?.dd || '16')
  cy.get('#deceasedBirthDate-mm').type(deceasedDoBSplit?.mm || '06')
  cy.get('#deceasedBirthDate-yyyy').type(deceasedDoBSplit?.yyyy || '1971')

  cy.selectOption(
    '#gender',
    options?.deceasedGender || 'Male',
    options?.deceasedGender || 'Male'
  )
  cy.selectOption('#countryPrimaryDeceased', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryDeceased', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryDeceased', 'Embe', 'Embe')
  cy.get('#cityPrimaryDeceased').type('My town')
  cy.get('#addressLine1UrbanOptionPrimaryDeceased').type('My residential area')
  cy.get('#addressLine2UrbanOptionPrimaryDeceased').type('My street')
  cy.get('#addressLine3UrbanOptionPrimaryDeceased').type('40')
  cy.get('#postalCodePrimaryDeceased').type('9000')
  goToNextFormSection()

  // EVENT DETAILS
  cy.get('#deathDate-dd').type('18')
  cy.get('#deathDate-mm').type('01')
  cy.get('#deathDate-yyyy').type('2019')
  cy.get('body').then(($body) => {
    if ($body.find('#reasonForLateRegistration').length) {
      cy.get('#reasonForLateRegistration').type('Late registration')
    }
  })

  // CAUSE OF DEATH DETAILS
  cy.selectOption('#mannerOfDeath', '', 'Homicide')
  cy.get('#causeOfDeathEstablished').click()
  cy.selectOption('#causeOfDeathMethod', '', 'Physician')
  cy.selectOption('#placeOfDeath', '', 'Other')

  cy.selectOption('#countryPlaceofdeath', 'Farajaland', 'Farajaland')
  cy.selectOption(
    '#statePlaceofdeath',
    options?.eventLocationLevel1 || 'Pualula',
    options?.eventLocationLevel1 || 'Pualula'
  )
  cy.selectOption(
    '#districtPlaceofdeath',
    options?.eventLocationLevel2 || 'Embe',
    options?.eventLocationLevel2 || 'Embe'
  )
  cy.get('#cityPlaceofdeath').type('My city')
  cy.get('#addressLine1UrbanOptionPlaceofdeath').type('My residential area')
  cy.get('#addressLine2UrbanOptionPlaceofdeath').type('My street')
  cy.get('#addressLine3UrbanOptionPlaceofdeath').type('40')
  cy.get('#postalCodePlaceofdeath').type('9000')

  goToNextFormSection()

  // INFORMANT DETAILS

  const informantType = options?.informantType ?? 'Spouse'
  selectInformant(informantType)

  if (informantType !== 'Spouse') {
    cy.get('#firstNamesEng').type(options?.informantFirstNames || 'Alom')
    cy.get('#familyNameEng').type(options?.informantFamilyName || 'Mia')
    cy.get('#informantBirthDate-dd').type(informantDoBSplit?.dd || '23')
    cy.get('#informantBirthDate-mm').type(informantDoBSplit?.mm || '10')
    cy.get('#informantBirthDate-yyyy').type(informantDoBSplit?.yyyy || '1975')
    cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
    cy.selectOption('#informantIdType', 'National ID', 'National ID')
    cy.get('#informantNationalId').type(getRandomNumbers(10))
    cy.get('#primaryAddressSameAsOtherPrimary_false').click()
    cy.selectOption('#countryPrimaryInformant', 'Farajaland', 'Farajaland')
    cy.selectOption('#statePrimaryInformant', 'Pualula', 'Pualula')
    cy.selectOption('#districtPrimaryInformant', 'Embe', 'Embe')
    cy.get('#cityPrimaryInformant').type('My town')
    cy.get('#postalCodePrimaryInformant').type('9000')
  }
  cy.get('#registrationPhone').type('07' + getRandomNumbers(8))
  cy.get('#registrationEmail').type('axonishere@gmail.com')
  goToNextFormSection()

  // Spouse section
  cy.get('#firstNamesEng').type(options?.informantFirstNames || 'Alom')
  cy.get('#familyNameEng').type(options?.informantFamilyName || 'Mia')
  cy.get('#spouseBirthDate-dd').type(informantDoBSplit?.dd || '23')
  cy.get('#spouseBirthDate-mm').type(informantDoBSplit?.mm || '10')
  cy.get('#spouseBirthDate-yyyy').type(informantDoBSplit?.yyyy || '1975')
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.selectOption('#spouseIdType', 'National ID', 'National ID')
  cy.get('#spouseNationalId').type(getRandomNumbers(10))
  cy.get('#primaryAddressSameAsOtherPrimary_false').click()
  cy.selectOption('#countryPrimarySpouse', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimarySpouse', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimarySpouse', 'Embe', 'Embe')
  cy.get('#cityPrimarySpouse').type('My town')
  cy.get('#postalCodePrimarySpouse').type('9000')

  goToNextFormSection()

  // Supporting documents

  goToNextFormSection()
})

Cypress.Commands.add('someoneElseJourney', () => {
  // EVENTS
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()

  // EVENT INFO
  goToNextFormSection()

  // DECLARATION FORM
  // CHILD DETAILS
  cy.get('#firstNamesEng').type('Aniq')
  cy.get('#familyNameEng').type('Hoque')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.get('#childBirthDate-dd').type('23')
  cy.get('#childBirthDate-mm').type('10')
  cy.get('#childBirthDate-yyyy').type('1994')
  cy.get('body').then(($body) => {
    if ($body.find('#reasonForLateRegistration').length) {
      cy.get('#reasonForLateRegistration').type('Late registration')
    }
  })
  cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
  cy.selectOption('#birthType', 'Single', 'Single')
  cy.get('#weightAtBirth').type('1.5')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Residential address')
  cy.selectOption('#countryPlaceofbirth', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePlaceofbirth', 'Pualula', 'Pualula')
  cy.selectOption('#districtPlaceofbirth', 'Embe', 'Embe')
  cy.get('#cityPlaceofbirth').type('My city')
  cy.get('#addressLine1UrbanOptionPlaceofbirth').type('My residential area')
  cy.get('#addressLine2UrbanOptionPlaceofbirth').type('My street')
  cy.get('#addressLine3UrbanOptionPlaceofbirth').type('40')
  goToNextFormSection()

  // INFORMANT'S DETAILS
  selectInformant('Someone else')
  cy.get('#otherInformantType').type('Someone else')
  cy.get('#registrationPhone').type('07' + getRandomNumbers(8))
  cy.get('#registrationEmail').type('axonishere@gmail.com')

  cy.get('#firstNamesEng').type('Alom')
  cy.get('#familyNameEng').type('Mia')
  cy.get('#informantBirthDate-dd').type('23')
  cy.get('#informantBirthDate-mm').type('10')
  cy.get('#informantBirthDate-yyyy').type('1975')
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.selectOption('#informantIdType', 'National ID', 'National ID')
  cy.get('#informantNationalId').type('1234567111')
  cy.selectOption('#countryPrimaryInformant', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryInformant', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryInformant', 'Embe', 'Embe')
  goToNextFormSection()

  // MOTHER DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.selectOption('#motherIdType', 'National ID', 'National ID')
  cy.get('#motherNationalId').type(getRandomNumbers(10))
  cy.get('#motherBirthDate-dd').type('23')
  cy.get('#motherBirthDate-mm').type('10')
  cy.get('#motherBirthDate-yyyy').type('1975')
  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type('Aktar')
  cy.selectOption('#countryPrimaryMother', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimaryMother', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimaryMother', 'Embe', 'Embe')
  goToNextFormSection()

  //  FATHER DETAILS
  cy.selectOption('#fatherIdType', 'National ID', 'National ID')
  cy.get('#fatherNationalId').type(getRandomNumbers(10))
  cy.get('#firstNamesEng').type('Karim')
  cy.get('#familyNameEng').type('Sheikh')
  cy.get('#fatherBirthDate-dd').type('10')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1971')
  goToNextFormSection()

  // DOCUMENTS
  goToNextFormSection()
})

Cypress.Commands.add('getReduxStore', () => {
  return cy.window().then((win) => {
    const container = Object.entries(win.document.getElementById('root')).find(
      ([x, y]) => x.includes('reactContainer')
    )[1]

    if (!container) {
      throw new Error('React container not found')
    }

    const store = container.memoizedState?.element?.props?.store
    if (!store) {
      throw new Error('Redux store not found')
    }

    return store
  })
})
