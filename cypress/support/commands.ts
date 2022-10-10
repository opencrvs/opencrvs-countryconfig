/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import { faker } from '@faker-js/faker'
import { createBirthDeclarationData } from '../../src/data-generator/declare'
import { Facility, Location } from '../../src/data-generator/location'

const users = {
  fieldWorker: {
    username: 'kalusha.bwalya',
    password: 'test'
  },
  registrar: {
    username: 'kennedy.mweene',
    password: 'test'
  },
  sysAdmin: {
    username: 'emmanuel.mayuka',
    password: 'test'
  },
  nsysAdmin: {
    username: 'jonathan.campbell',
    password: 'test'
  }
}
function getToken(role: string) {
  const user = users[role as keyof typeof users]
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
    .then(body => {
      cy.request({
        url: `${Cypress.env('AUTH_URL')}verifyCode`,
        method: 'POST',
        body: {
          nonce: body.nonce,
          code: '000000'
        }
      })
        .its('body')
        .then(body => {
          return body.token
        })
    })
}

Cypress.Commands.add('login', (userType, options = {}) => {
  getToken(userType).then(token => {
    cy.visit(`${Cypress.env('CLIENT_URL')}?token=${token}`)
  })

  // Wait for app to load so token can be stored
  cy.get('#createPinBtn')
})

Cypress.Commands.add('selectOption', (selector, text, option) => {
  cy.get(`${selector} input`)
    .first()
    .click({ force: true })
    .get(`${selector} .react-select__menu`)
    .contains(option)
    .click()

  cy.get(`${selector} input`)
    .focus()
    .blur()
})

Cypress.Commands.add('logout', () => {
  cy.get('#ProfileMenuToggleButton').click()
  cy.get('#ProfileMenuItem1').click()
})

Cypress.Commands.add('goToNextFormSection', () => {
  // Clear debounce wait from form
  cy.wait(500)

  cy.get('#next_section').click()
})

Cypress.Commands.add('createPin', () => {
  // CREATE PIN
  cy.get('#createPinBtn', { timeout: 130000 }).should('be.visible')
  cy.get('#createPinBtn', { timeout: 130000 }).click()
  for (let i = 1; i <= 8; i++) {
    cy.get('#pin-keypad-container')
      .click()
      .type(`${i % 2}`)
  }
})

const hasOperationName = (req, operationName) => {
  const { body } = req
  return (
    body.hasOwnProperty('operationName') && body.operationName === operationName
  )
}

Cypress.Commands.add('submitDeclaration', (type: 'birth' | 'death') => {
  cy.intercept('/graphql', req => {
    if (hasOperationName(req, 'createBirthRegistration')) {
      req.alias = 'createRegistration'
      req.on('response', res => {
        const compositionId =
          res.body?.data?.createBirthRegistration?.compositionId
        expect(compositionId).to.be.a('string')
      })
    }
    if (hasOperationName(req, 'createDeathRegistration')) {
      req.alias = 'createRegistration'
      req.on('response', res => {
        const compositionId =
          res.body?.data?.createDeathRegistration?.compositionId
        expect(compositionId).to.be.a('string')
      })
    }
  })
  cy.get('#submit_form').click()
  cy.get('#submit_confirm').click()

  cy.log('Waiting for declaration to sync...')
  cy.wait('@createRegistration', {
    timeout: 60000
  })
})

Cypress.Commands.add('reviewForm', () => {
  cy.get('#navigation_readyForReview').click()
  cy.get('#ListItemAction-0-icon').click()
  cy.get('#assignment').should('exist')
  cy.get('#assign').click()
  cy.get('#ListItemAction-0-Review').click()
})

Cypress.Commands.add('submitForm', () => {
  cy.get('#registerDeclarationBtn').click()
  cy.get('#submit_confirm').click()
  cy.get('#navigation_outbox').should('contain.text', '1')
  cy.get('#navigation_outbox').should('not.contain.text', '1')
})

Cypress.Commands.add('printDeclaration', () => {
  cy.get('#navigation_print').click()
  cy.get('#ListItemAction-0-icon', { timeout: 30000 }).click()
  cy.get('#assignment').should('exist')
  cy.get('#assign').click()
  cy.get('#ListItemAction-0-Print', { timeout: 30000 }).click()
  cy.get('#type_MOTHER').click()
  cy.get('#confirm_form').click()
  cy.get('#verifyPositive').click()
  // Verify payment
  cy.get('#Continue').click()
  cy.get('#confirm-print').click()
  cy.get('.react-pdf__message react-pdf__message--no-data').should('not.exist')

  cy.get('#print-certificate').click()
  cy.get('#navigation_outbox').should('contain.text', '1')
  cy.get('#navigation_outbox').should('not.contain.text', '1')
})

Cypress.Commands.add('clickUserListItemByName', (name, actionText) => {
  cy.xpath(
    `//span[contains(text(), "${name}")]/ancestor::div[@data-test-id="list-view-label"]/../following-sibling::div[@data-test-id="list-view-actions"][1]/descendant::button`
  ).click({ force: true })

  cy.get('[id$=-menuSubMenu]').should('is.visible')
  const actionsMenu = cy.get('[id$=-menuSubMenu]')
  actionsMenu.scrollIntoView().should('is.visible')
  const action = actionsMenu.get('li').contains(actionText)
  action.should('is.visible')
  action.click()
})

Cypress.Commands.add('rejectDeclaration', () => {
  cy.get('#rejectDeclarationBtn').click()
  // REJECT MODAL
  cy.get('#rejectionReasonother').click()
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

Cypress.Commands.add('verifyLandingPageVisible', () => {
  cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
  cy.get('#header_new_event').click()
})

Cypress.Commands.add('downloadFirstDeclaration', () => {
  cy.get('#ListItemAction-0-icon').should('exist')
  cy.get('#ListItemAction-0-icon')
    .first()
    .click()
  cy.get('assignment').should('exist')
  cy.get('#assign').click()
  cy.log('Waiting for declaration to sync...')

  cy.get('#action-loading-ListItemAction-0').should('not.exist')
})

export function getRandomNumbers(stringLength) {
  let result = ''
  for (let i = 0; i < stringLength; i++) {
    result += Math.floor(Math.random() * 10)
  }
  return result
}

Cypress.Commands.add('declareDeclarationWithMinimumInput', () => {
  // LOGIN
  cy.login('fieldWorker')
  cy.createPin()
  cy.verifyLandingPageVisible()
  // EVENTS
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()

  // EVENT INFO
  cy.get('#continue').click()

  // SELECT INFORMANT

  cy.get('#informantType_MOTHER').click()

  cy.goToNextFormSection()
  // SELECT MAIN CONTACT POINT

  cy.get('#contactPoint_MOTHER').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()

  // DECLARATION FORM
  // CHILD DETAILS

  cy.get('#firstNamesEng').type(faker.name.firstName())
  cy.get('#familyNameEng').type(faker.name.lastName())
  cy.selectOption('#gender', 'Male', 'Male')
  cy.get('#childBirthDate-dd').type(
    Math.floor(1 + Math.random() * 27).toString()
  )
  cy.get('#childBirthDate-mm').type(
    Math.floor(1 + Math.random() * 12).toString()
  )
  cy.get('#childBirthDate-yyyy').type('2018')
  cy.selectOption('#birthType', 'Single', 'Single')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Residential address')
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')
  cy.goToNextFormSection()

  // MOTHER DETAILS
  cy.get('#iD').type('321456789')
  cy.get('#firstNamesEng').type('Rokeya')
  cy.get('#familyNameEng').type(faker.name.lastName())
  cy.get('#motherBirthDate-dd').type('23')
  cy.get('#motherBirthDate-mm').type('10')
  cy.get('#motherBirthDate-yyyy').type('1969')
  cy.selectOption('#countryPrimary-form-input', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')

  cy.goToNextFormSection()

  // FATHER DETAILS
  cy.get('#detailsExist_true').click()
  cy.get('#iD').type('331345378')

  cy.get('#firstNamesEng').type('Joe')
  cy.get('#familyNameEng').type('Bieden')
  cy.get('#fatherBirthDate-dd').type('23')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1969')

  cy.goToNextFormSection()

  // DOCUMENTS
  cy.goToNextFormSection()
  cy.submitDeclaration()

  cy.logout()
})

function getLocationWithName(token, name) {
  return cy
    .request<{ data: Record<string, Location> }>({
      method: 'GET',
      url: `${Cypress.env('COUNTRYCONFIG_URL')}locations`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .its('body')
    .then(body => {
      return Object.values(body.data).find(location => location.name === name)
    })
}

function getRandomFacility(token, location) {
  return cy
    .request<{ data: Record<string, Facility> }>({
      method: 'GET',
      url: `${Cypress.env('COUNTRYCONFIG_URL')}facilities`,
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .its('body')
    .then(body => {
      return Object.values(body.data).find(
        facility => facility.partOf === `Location/${location.id}`
      )
    })
}

Cypress.Commands.add('createBirthRegistrationAs', (role, options = {}) => {
  return getToken(role).then(token => {
    return getLocationWithName(token, 'Ibombo').then(location => {
      return getRandomFacility(token, location).then(facility => {
        const details = createBirthDeclarationData(
          'male',
          new Date('2018-05-18T13:18:26.240Z'),
          new Date(),
          location,
          facility
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
        cy.intercept('/graphql', req => {
          if (hasOperationName(req, 'createBirthRegistration')) {
            req.on('response', res => {
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
        cy.get('@createRegistration').should(response => {
          expect((response as any).status).to.eq(200)
        })
      })
    })
  })
})

Cypress.Commands.add('enterMaximumInput', () => {
  // EVENTS
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  cy.get('#continue').click()

  cy.get('#informantType_FATHER').click()

  cy.goToNextFormSection()

  // SELECT MAIN CONTACT POINT
  cy.get('#contactPoint_FATHER').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()

  // DECLARATION FORM
  // CHILD DETAILS
  cy.get('#firstNamesEng').type(faker.name.firstName())
  cy.get('#familyNameEng').type(faker.name.lastName())
  cy.selectOption('#gender', 'Male', 'Male')
  cy.get('#childBirthDate-dd').type('11')
  cy.get('#childBirthDate-mm').type('11')
  cy.get('#childBirthDate-yyyy').type('1997')
  cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
  cy.selectOption('#birthType', 'Single', 'Single')
  cy.get('#weightAtBirth').type('1.5')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Residential address')
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')
  cy.get('#cityUrbanOption').type('My city')
  cy.get('#addressLine3UrbanOption').type('My residential area')
  cy.get('#addressLine2UrbanOption').type('My street')
  cy.get('#numberUrbanOption').type('40')

  cy.goToNextFormSection()

  // MOTHER DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#iD').type('193456777')

  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type(faker.name.lastName())
  cy.get('#motherBirthDate-dd').type('23')
  cy.get('#motherBirthDate-mm').type('10')
  cy.get('#motherBirthDate-yyyy').type('1969')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
  cy.selectOption('#countryPrimary-form-input', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')
  cy.get('#cityUrbanOptionPrimary').type('My town')
  cy.get('#addressLine3UrbanOptionPrimary').type('My residental area')

  cy.get('#addressLine2UrbanOptionPrimary').type('My street')
  cy.get('#numberUrbanOptionPrimary').type('40')
  cy.goToNextFormSection()

  // FATHER DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#iD').type('912345378')

  cy.get('#firstNamesEng').type('Jack')
  cy.get('#familyNameEng').type('Maa')
  cy.get('#fatherBirthDate-dd').type('23')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1969')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')

  cy.get('#primaryAddressSameAsOtherPrimary_false').click()

  cy.selectOption('#countryPrimary', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')
  cy.get('#cityUrbanOptionPrimary').type('My town')
  cy.get('#addressLine3UrbanOptionPrimary').type('My residential area')
  cy.get('#addressLine2UrbanOptionPrimary').type('My street')
  cy.get('#numberUrbanOptionPrimary').type('40')
  cy.goToNextFormSection()

  // DOCUMENTS
  cy.goToNextFormSection()
})

Cypress.Commands.add('registerDeclarationWithMinimumInput', () => {
  // DECLARE DECLARATION AS FIELD AGENT
  cy.declareDeclarationWithMinimumInput()

  // LOGIN AS LOCAL REGISTRAR
  cy.login('registrar')
  cy.createPin()

  // LANDING PAGE
  cy.downloadFirstDeclaration()
  cy.get('#ListItemAction-0-Review').should('exist')
  cy.get('#ListItemAction-0-Review')
    .first()
    .click()

  cy.registerDeclaration()
})

Cypress.Commands.add('registerDeclarationWithMaximumInput', () => {
  // DECLARE DECLARATION AS FIELD AGENT
  cy.declareDeclarationWithMaximumInput(
    faker.name.firstName(),
    faker.name.lastName()
  )
})

Cypress.Commands.add('declareDeathDeclarationWithMinimumInput', () => {
  // LOGIN
  cy.login('fieldWorker')
  cy.createPin()
  cy.verifyLandingPageVisible()
  // DECLARATION FORM
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_death_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  cy.get('#continue').click()
  // SELECT INFORMANT
  cy.get('#informantType_SPOUSE').click()
  cy.goToNextFormSection()
  // SELECT MAIN CONTACT POINT

  cy.get('#contactPoint_SPOUSE').click()
  // cy.get('#contactPoint_INFORMANT').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()
  // DECEASED DETAILS

  cy.get('#iD').type('123456789')

  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type('Aktar')
  cy.get('#birthDate-dd').type('16')
  cy.get('#birthDate-mm').type('06')
  cy.get('#birthDate-yyyy').type('1988')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.selectOption('#countryPrimary', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')
  cy.goToNextFormSection()
  // EVENT DETAILS

  cy.get('#deathDate-dd').type('18')
  cy.get('#deathDate-mm').type('01')
  cy.get('#deathDate-yyyy').type('2022')

  // MANNER OF DEATH
  cy.selectOption('#manner', '', 'Natural causes')
  cy.selectOption('#causeOfDeathMethod', '', 'Physician')
  cy.selectOption('#placeOfDeath', '', "Deceased's usual place of residence")

  cy.goToNextFormSection()
  // Informant details
  cy.get('#informantID').type('912345678')
  cy.get('#informantBirthDate-dd').type('16')
  cy.get('#informantBirthDate-mm').type('06')
  cy.get('#informantBirthDate-yyyy').type('1988')
  cy.get('#firstNamesEng').type('Soumita')
  cy.get('#familyNameEng').type('Aktar')

  cy.goToNextFormSection()

  // Supporting documents

  cy.goToNextFormSection()

  // Review

  // PREVIEW
  cy.submitDeclaration()

  // LOG OUT
  cy.logout()
})

Cypress.Commands.add('declareDeathDeclarationWithMaximumInput', () => {
  // LOGIN
  cy.login('fieldWorker')
  cy.createPin()
  cy.verifyLandingPageVisible()
  cy.enterDeathMaximumInput()
  // PREVIEW
  cy.submitDeclaration()

  // LOG OUT
  cy.get('#ProfileMenuToggleButton').click()
  cy.get('#ProfileMenuItem1').click()
})

Cypress.Commands.add('registerDeathDeclarationWithMinimumInput', () => {
  cy.declareDeathDeclarationWithMinimumInput()
})

Cypress.Commands.add('registerDeathDeclarationWithMaximumInput', () => {
  cy.declareDeathDeclarationWithMaximumInput()
})

Cypress.Commands.add('enterDeathMaximumInput', () => {
  // DECLARATION FORM
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_death_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  cy.get('#continue').click()
  // SELECT INFORMANT
  cy.get('#informantType_SPOUSE').click()
  cy.goToNextFormSection()
  // SELECT ADDITIONAL INFORMANT
  cy.get('#contactPoint_MOTHER').click()
  // cy.get('#contactPoint\\.nestedFields\\.contactRelationship').type('Colleague')
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()
  // DECEASED DETAILS
  cy.get('#iD').type('123456789')

  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#firstNamesEng').type('Nafiz')
  cy.get('#familyNameEng').type('Sadik')
  cy.get('#birthDate-dd').type('16')
  cy.get('#birthDate-mm').type('06')
  cy.get('#birthDate-yyyy').type('1971')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.selectOption('#maritalStatus', 'Married', 'Married')

  cy.selectOption('#countryPrimary', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')
  cy.get('#addressLine3UrbanOptionPrimary').type('My residential area')
  cy.get('#addressLine2UrbanOptionPrimary').type('My street')
  cy.get('#numberUrbanOptionPrimary').type('40')
  cy.goToNextFormSection()
  // EVENT DETAILS
  cy.get('#deathDate-dd').type('18')
  cy.get('#deathDate-mm').type('01')
  cy.get('#deathDate-yyyy').type('2019')

  // CAUSE OF DEATH DETAILS
  cy.selectOption('#manner', '', 'Homicide')
  cy.get('#causeOfDeathEstablished_true').click()
  cy.selectOption('#causeOfDeathMethod', '', 'Physician')
  cy.selectOption('#placeOfDeath', '', 'Other')

  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')
  cy.get('#cityUrbanOption').type('My city')
  cy.get('#addressLine3UrbanOption').type('My residential area')
  cy.get('#addressLine2UrbanOption').type('My street')
  cy.get('#numberUrbanOption').type('40')

  cy.goToNextFormSection()
  // INFORMANT DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#informantID').type('912345678')
  cy.get('#informantBirthDate-dd').type('16')
  cy.get('#informantBirthDate-mm').type('06')
  cy.get('#informantBirthDate-yyyy').type('1988')
  cy.get('#firstNamesEng').type('Anne')
  cy.get('#familyNameEng').type('Salim')
  cy.get('#primaryAddressSameAsOtherPrimary_false').click()

  cy.selectOption('#countryPrimary', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')
  cy.goToNextFormSection()
  cy.goToNextFormSection()
})

Cypress.Commands.add('someoneElseJourney', () => {
  // EVENTS
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  cy.get('#continue').click()
  // SELECT INFORMANT
  cy.get('#informantType_FATHER').click()
  cy.goToNextFormSection()

  // SELECT INFORMANT

  cy.get('#contactPoint_OTHER').click()
  // cy.get('#informant\\.nestedFields\\.otherRelationShip').type(
  //   'Unnamed relation'
  // )
  // cy.goToNextFormSection()
  // SELECT MAIN CONTACT POINT

  cy.get('#contactPoint_MOTHER').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()
  // DECLARATION FORM
  // CHILD DETAILS
  cy.get('#firstNamesEng').type('Aniq')
  cy.get('#familyNameEng').type('Hoque')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.get('#childBirthDate-dd').type('23')
  cy.get('#childBirthDate-mm').type('10')
  cy.get('#childBirthDate-yyyy').type('1994')
  cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
  cy.selectOption('#birthType', 'Single', 'Single')
  cy.get('#weightAtBirth').type('1.5')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Residential address')
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')

  cy.get('#cityUrbanOption').type('My city')
  cy.get('#addressLine3UrbanOption').type('My residential area')
  cy.get('#addressLine2UrbanOption').type('My street')
  cy.get('#numberUrbanOption').type('40')

  cy.goToNextFormSection()
  // INFORMANT'S DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#iD').type('123456711')
  cy.get('#motherBirthDate-dd').type('23')
  cy.get('#motherBirthDate-mm').type('10')
  cy.get('#motherBirthDate-yyyy').type('1975')
  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type('Aktar')
  cy.selectOption('#countryPrimary-form-input', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePrimary', 'Pualula', 'Pualula')
  cy.selectOption('#districtPrimary', 'Embe', 'Embe')

  cy.goToNextFormSection()
  //  PRIMARY CARE GIVER DETAILS
  cy.get('#iD').type('121256789')
  cy.get('#firstNamesEng').type('Karim')
  cy.get('#familyNameEng').type('Sheikh')
  cy.get('#fatherBirthDate-dd').type('10')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1971')

  cy.goToNextFormSection()
  // //  Why are the mother and father not applying?

  cy.goToNextFormSection()
  //  Who is looking after the child?
  // DOCUMENTS
})
