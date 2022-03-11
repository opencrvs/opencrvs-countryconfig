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

Cypress.Commands.add('login', (userType, options = {}) => {
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
    }
  }

  const user = users[userType]
  cy.request({
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
          cy.visit(`${Cypress.env('CLIENT_URL')}?token=${body.token}`)
        })
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
})

Cypress.Commands.add('logout', () => {
  cy.get('#sub-menu').click()
  cy.get('#Logout-menu-item').click()
})

Cypress.Commands.add('goToNextFormSection', () => {

  cy.clock()
  cy.tick(10000) // Clear debounce wait from form

  cy.get('#next_section').click()

})

Cypress.Commands.add('createPin', () => {
  // CREATE PIN
  cy.get('#createPinBtn', { timeout: 30000 }).should('be.visible')
  cy.get('#createPinBtn', { timeout: 30000 }).click()
  for (let i = 1; i <= 8; i++) {
    cy.get('#pin-keypad-container')
      .click()
      .type(`${i % 2}`)
  }
  cy.wait(2000)
})

Cypress.Commands.add('submitDeclaration', () => {
  var compositionId;
  cy.intercept('/graphql', (req) => {
    req.on('response', (res) => {

      compositionId = res.body?.data?.createBirthRegistration?.compositionId

      expect(compositionId).to.not.equal('empty')
    })
  }).as('exam')


  // PREVIEW
  cy.get('#submit_form').click()
  // MODAL
  cy.get('#submit_confirm').click()
  
  cy.log('Waiting for declaration to sync...')
  cy.wait('@exam')
  cy.clock()
  cy.tick(40000)
  console.log(compositionId)

  // TODO: This Command should be added in the next sprint though it's not working presently
  // cy.get('#row_0 #submitted0').should('exist')

})

Cypress.Commands.add('submitAplication', () => {
  var compositionId;
  cy.intercept('/graphql', (req) => {
    req.on('response', (res) => {

      compositionId = res.body?.data?.createBirthRegistration?.compositionId

      expect(compositionId).to.not.equal('empty')
    })
  }).as('exam')


  // PREVIEW
  cy.get('#registerDeclarationBtn').click()
  // MODAL
  cy.get('#submit_confirm').click()
  
  cy.log('Waiting for declaration to sync...')
  cy.wait('@exam')
  cy.clock()
  cy.tick(40000)
  console.log(compositionId)


})
Cypress.Commands.add('logOut',()=>{
  // cy.get('#ProfileMenuToggleButton').click()
  // cy.get('#ProfileMenuItem1').click()
})
Cypress.Commands.add('reviewForm', () => {
  cy.get('#navigation_review').click()
  cy.get('#ListItemAction-0-icon').click()
  cy.get('#ListItemAction-0-Review').click()
})

Cypress.Commands.add('submitForm',() => {
  cy.get('#registerDeclarationBtn').click()
  cy.get('#submit_confirm').click()
  cy.wait(5000)
  cy.reload()
})



Cypress.Commands.add('printDeclaration',() => {
  cy.get('#navigation_print').click()
  cy.get('#ListItemAction-0-icon').click()
  cy.get('#ListItemAction-0-Print').click()
  cy.get('#type_MOTHER').click()
  cy.get('#confirm_form').click()
  cy.get('#verifyPositive').click()
  cy.get('#confirm-print').click()
  cy.get('.react-pdf__message react-pdf__message--no-data').should(
    'not.exist')

  cy.get('#print-certificate').should('exist')
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
  cy.clock()
  cy.tick(20000)
  cy.get('#Spinner').should('exist')
})

Cypress.Commands.add('registerDeclaration', () => {
  cy.get('#registerDeclarationBtn').click()
  // MODAL
  cy.get('#submit_confirm').click()
  cy.log('Waiting for declaration to sync...')
  cy.tick(20000)
  cy.get('#Spinner').should('exist')
  cy.get('#navigation_review').contains('Ready for review')
})

Cypress.Commands.add('verifyLandingPageVisible', () => {
  cy.get('#header_new_event', { timeout: 30000 }).should('be.visible')
  cy.get('#header_new_event').click()
})
Cypress.Commands.add('initializeFakeTimers', () => {
  cy.clock(new Date().getTime())
})
Cypress.Commands.add('downloadFirstDeclaration', () => {
  cy.clock()
  cy.tick(10000)
  cy.get('#ListItemAction-0-icon').should('exist')
  cy.get('#ListItemAction-0-icon')
    .first()
    .click()
  cy.log('Waiting for declaration to sync...')
  cy.tick(20000)
  cy.get('#action-loading-ListItemAction-0').should('not.exist')
})

export function getRandomNumbers(stringLength) {
  let result = ''
  for (let i = 0; i < stringLength; i++) {
    result += Math.floor(Math.random() * 10)
  }
  return result
}

Cypress.Commands.add(
  'registrarDeclarationInprogress',
  (firstName, lastName) => {
    // LOGIN
    cy.login('registrar')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.clock(new Date().getTime())
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()

    // EVENT INFO
    cy.get('#continue').click()

    // SELECT INFORMANT
    cy.get('#informant_FATHER').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT

    cy.get('#contactPoint_MOTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '07' + getRandomNumbers(8)
    )
    cy.goToNextFormSection()

    // DECLARATION FORM
    // CHILD DETAILS

    cy.get('#firstNamesEng').type(firstName)
    cy.get('#familyNameEng').type(lastName)
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type(
      Math.floor(1 + Math.random() * 27).toString()
    )
    cy.get('#childBirthDate-mm').type(
      Math.floor(1 + Math.random() * 12).toString()
    )
    cy.clock(new Date().getTime())
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.get('#multipleBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
    cy.selectOption('#country', 'Farajaland', 'Farajaland')
    cy.selectOption('#state', 'Pualula', 'Pualula')
    cy.selectOption('#district', 'Embe', 'Embe')
    cy.goToNextFormSection()
  }
)

Cypress.Commands.add(
  'fieldDeclarationInprogress',
  (firstName, lastName) => {
    // LOGIN
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.clock(new Date().getTime())
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()

    // EVENT INFO
    cy.get('#continue').click()
    cy.get('#informant_MOTHER').click()
    cy.get('#continue').click()

  }
)

Cypress.Commands.add(
  'declareDeclarationWithMinimumInput',
  (firstName, lastName) => {
    // LOGIN
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.clock(new Date().getTime())
    // EVENTS
    cy.get('#select_vital_event_view').should('be.visible')
    cy.get('#select_birth_event').click()
    cy.get('#continue').click()

    // EVENT INFO
    cy.get('#continue').click()

    // SELECT INFORMANT
    cy.get('#informant_FATHER').click()
    cy.get('#continue').click()
    // SELECT MAIN CONTACT POINT

    cy.get('#contactPoint_MOTHER').click()
    cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
      '07' + getRandomNumbers(8)
    )
    cy.goToNextFormSection()

    // DECLARATION FORM
    // CHILD DETAILS

    cy.get('#firstNamesEng').type(firstName)
    cy.get('#familyNameEng').type(lastName)
    cy.selectOption('#gender', 'Male', 'Male')
    cy.get('#childBirthDate-dd').type(
      Math.floor(1 + Math.random() * 27).toString()
    )
    cy.get('#childBirthDate-mm').type(
      Math.floor(1 + Math.random() * 12).toString()
    )
    cy.clock(new Date().getTime())
    cy.get('#childBirthDate-yyyy').type('2018')
    cy.get('#multipleBirth').type('1')
    cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
    cy.selectOption('#country', 'Farajaland', 'Farajaland')
    cy.selectOption('#state', 'Pualula', 'Pualula')
    cy.selectOption('#district', 'Embe', 'Embe')
    cy.goToNextFormSection()

    // MOTHER DETAILS
    cy.get('#iD').type('123456789')
    cy.get('#firstNamesEng').type('Rokeya')
    cy.get('#familyNameEng').type(lastName)
    cy.selectOption('#countryPlaceOfHeritage', 'Farajaland', 'Farajaland')
    cy.selectOption(
      '#statePlaceOfHeritage',
      'Pualula',
      'Pualula'
    )
    cy.selectOption(
      '#districtPlaceOfHeritage',
      'Embe',
      'Embe'
    )
    cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
    cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
    cy.selectOption('#districtPermanent', 'Embe', 'Embe')
    cy.goToNextFormSection()

    // FATHER DETAILS
    cy.get('#fathersDetailsExist_false').click()
    cy.goToNextFormSection()

    // DOCUMENTS
    cy.goToNextFormSection()

    cy.submitDeclaration()

    // LOG OUT

    cy.wait(5000)
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
  }
)

Cypress.Commands.add(
  'declareDeclarationWithMaximumInput',
  (firstName, lastName) => {
    // LOGIN AS FIELD WORKER
    cy.login('fieldWorker')

    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.clock(new Date().getTime())
    cy.enterMaximumInput(firstName, lastName)

    cy.submitDeclaration()

    // LOG OUT

    cy.get('#ProfileMenuToggleButton').click()

    cy.get('#ProfileMenuItem1').click()
  }
)

Cypress.Commands.add('enterMaximumInput', (firstName, lastName) => {
  // EVENTS
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_birth_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  cy.get('#continue').click()
  cy.get('#informant_FATHER').click()
  cy.get('#continue').click()

  // SELECT MAIN CONTACT POINT
  cy.get('#contactPoint_FATHER').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()

  // DECLARATION FORM
  // CHILD DETAILS
  cy.get('#firstNamesEng').type(firstName)
  cy.get('#familyNameEng').type(lastName)
  cy.selectOption('#gender', 'Male', 'Male')
  cy.get('#childBirthDate-dd').type('11')
  cy.get('#childBirthDate-mm').type('11')
  cy.get('#childBirthDate-yyyy').type('1997')
  cy.selectOption('#attendantAtBirth', 'Physician', 'Physician')
  cy.selectOption('#birthType', 'Single', 'Single')
  cy.get('#multipleBirth').type('1')
  cy.get('#weightAtBirth').type('1.5')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')
  cy.get('#addressLine4CityOption').type('My city')
  cy.get('#addressLine3CityOption').type('My residential area')
  cy.get('#addressLine2CityOption').type('My street')
  cy.get('#numberOption').type('40')

  cy.goToNextFormSection()

  // MOTHER DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#iD').type('193456789')
  cy.get('#socialSecurityNo').type('123456789')
  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type(lastName)
  cy.get('#motherBirthDate-dd').type('23')
  cy.get('#motherBirthDate-mm').type('10')
  cy.get('#motherBirthDate-yyyy').type('1969')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
  cy.selectOption('#countryPlaceOfHeritage', 'Farajaland', 'Farajaland')
  cy.selectOption(
    '#statePlaceOfHeritage',
    'Pualula',
    'Pualula'
  )
  cy.selectOption(
    '#districtPlaceOfHeritage',
    'Embe',
    'Embe'
  )
  cy.get('#addressChiefPlaceOfHeritage').type('My chief')
  cy.get('#addressLine1PlaceOfHeritage').type('My village')
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')
  cy.get('#addressLine4CityOptionPermanent').type('My city')
  cy.get('#addressLine3CityOptionPermanent').type('My residential area')
  cy.get('#addressLine2CityOptionPermanent').type('My street')
  cy.get('#numberOptionPermanent').type('40')
  cy.get('#currentAddressSameAsPermanent_false').click()
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')
  cy.get('#addressLine4CityOption').type('My city')
  cy.get('#addressLine3CityOption').type('My residential area')
  cy.get('#addressLine2CityOption').type('My street')
  cy.get('#numberOption').type('40')
  cy.goToNextFormSection()

  // FATHER DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#iD').type('912345678')
  cy.get('#socialSecurityNo').type('123456789')
  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type('Aktar')
  cy.get('#fatherBirthDate-dd').type('23')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1969')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#educationalAttainment', 'PRIMARY_ISCED_1', 'Primary')
  cy.get('#permanentAddressSameAsMother_false').click()
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')
  cy.get('#addressLine4CityOptionPermanent').type('My city')
  cy.get('#addressLine3CityOptionPermanent').type('My residential area')
  cy.get('#addressLine2CityOptionPermanent').type('My street')
  cy.get('#numberOptionPermanent').type('40')
  cy.goToNextFormSection()

  // DOCUMENTS
  cy.goToNextFormSection()
})

Cypress.Commands.add(
  'registerDeclarationWithMinimumInput',
  (firstName, lastName) => {
    // DECLARE DECLARATION AS FIELD AGENT
    cy.declareDeclarationWithMinimumInput(firstName, lastName)

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
  }
)

Cypress.Commands.add(
  'registerDownloadLand', () => {
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
  }
)

Cypress.Commands.add(
  'registerDeclarationWithMaximumInput',
  (firstName, lastName) => {
    // DECLARE DECLARATION AS FIELD AGENT
    cy.declareDeclarationWithMaximumInput(firstName, lastName)
  }
)

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
  cy.get('#relationship_SPOUSE').click()
  cy.get('#continue').click()
  // SELECT MAIN CONTACT POINT

  cy.get('#contactPoint_SPOUSE').click()
  // cy.get('#contactPoint_INFORMANT').click()
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.wait(1000)
  cy.clock(new Date().getTime())
  cy.goToNextFormSection()
  // DECEASED DETAILS

  cy.get('#iD').type('123456789')
  cy.get('#socialSecurityNo').type('123456789')
  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type('Aktar')
  cy.get('#birthDate-dd').type('16')
  cy.get('#birthDate-mm').type('06')
  cy.get('#birthDate-yyyy').type('1988')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')
  cy.goToNextFormSection()
  // EVENT DETAILS

  cy.get('#deathDate-dd').type('18')
  cy.get('#deathDate-mm').type('01')
  cy.get('#deathDate-yyyy').type('2022')
  cy.goToNextFormSection()
  // MANNER OF DEATH
  cy.get('#manner_NATURAL_CAUSES').click()
  cy.goToNextFormSection()
  // DEATH OCCURRING PLACE
  cy.get('#deathPlaceAddress_PERMANENT').click()
  cy.goToNextFormSection()
  // CAUSE OF DEATH DETAILS
  cy.get('#causeOfDeathEstablished_false').click()
  cy.goToNextFormSection()
  // INFORMANT DETAILS
  cy.get('#informantID').type('912345678')
  cy.get('#firstNamesEng').type('Soumita')
  cy.get('#familyNameEng').type('Aktar')
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')

  cy.goToNextFormSection()

  // FATHER DETAILS
  cy.get('#fatherFamilyNameEng').type('Bill')
  cy.get('#fatherFamilyNameEng').type('Uddin')
  cy.goToNextFormSection()
  // MOTHER DETAILS
  cy.get('#motherFamilyNameEng').type('Jenny')
  cy.get('#motherFamilyNameEng').type('Uddin')
  cy.goToNextFormSection()
  // DOCUMENT DETAILS
  cy.goToNextFormSection()
  // PREVIEW
  cy.submitDeclaration()
  // LOG OUT
  cy.get('#ProfileMenuToggleButton').click()
  cy.get('#ProfileMenuItem1').click()
})

Cypress.Commands.add('declareDeathDeclarationWithMaximumInput', () => {
  // LOGIN
  cy.login('fieldWorker')
  cy.createPin()
  cy.verifyLandingPageVisible()
  cy.enterDeathMaximumInput()
  // PREVIEW
  cy.submitDeclaration()
  cy.wait(2000)

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
  cy.initializeFakeTimers()
  // DECLARATION FORM
  cy.get('#select_vital_event_view').should('be.visible')
  cy.get('#select_death_event').click()
  cy.get('#continue').click()
  // EVENT INFO
  cy.get('#continue').click()
  // SELECT INFORMANT
  cy.get('#relationship_MOTHER').click()
  cy.get('#continue').click()
  // SELECT ADDITIONAL INFORMANT
  cy.get('#contactPoint_MOTHER').click()
  // cy.get('#contactPoint\\.nestedFields\\.contactRelationship').type('Colleague')
  cy.get('#contactPoint\\.nestedFields\\.registrationPhone').type(
    '07' + getRandomNumbers(8)
  )
  cy.goToNextFormSection()
  // DECEASED DETAILS
  cy.get('#iD').type('123456789')
  cy.get('#socialSecurityNo').type('123456789')
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#firstNamesEng').type('Nafiza')
  cy.get('#familyNameEng').type('Firuj')
  cy.get('#birthDate-dd').type('16')
  cy.get('#birthDate-mm').type('06')
  cy.get('#birthDate-yyyy').type('1988')
  cy.selectOption('#gender', 'Male', 'Male')
  cy.selectOption('#maritalStatus', 'Married', 'Married')
  cy.get('#occupation').type('Lawyer')
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')
  cy.get('#addressLine4CityOptionPermanent').type('My city')
  cy.get('#addressLine3CityOptionPermanent').type('My residential area')
  cy.get('#addressLine2CityOptionPermanent').type('My street')
  cy.get('#numberOptionPermanent').type('40')
  cy.goToNextFormSection()
  // EVENT DETAILS
  cy.get('#deathDate-dd').type('18')
  cy.get('#deathDate-mm').type('01')
  cy.get('#deathDate-yyyy').type('2019')
  cy.goToNextFormSection()
  cy.get('#manner_HOMICIDE').click()
  cy.goToNextFormSection()
  cy.get('#deathPlaceAddress_OTHER').click()
  cy.goToNextFormSection()
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')
  cy.get('#addressLine4CityOption').type('My city')
  cy.get('#addressLine3CityOption').type('My residential area')
  cy.get('#addressLine2CityOption').type('My street')
  cy.get('#numberOption').type('40')
  cy.goToNextFormSection()
  // CAUSE OF DEATH DETAILS
  cy.get('#causeOfDeathEstablished_true').click()
  cy.goToNextFormSection()
  cy.get('#causeOfDeathCode').type('Chronic Obstructive Pulmonary Disease')
  cy.goToNextFormSection()
  // INFORMANT DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#informantID').type('912345678')
  cy.get('#firstNamesEng').type('Anne')
  cy.get('#familyNameEng').type('Salim')
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')
  cy.goToNextFormSection()
  // FATHER DETAILS
  cy.get('#fatherFirstNamesEng').type('Mokhtar')
  cy.get('#fatherFamilyNameEng').type('Khan')
  cy.goToNextFormSection()
  // cy.get('#hasDetails_Yes').click()
  // // MOTHER DETAILS
  // // cy.get('#motherFirstNamesEng').type('Rabeya')
  // // cy.get('#motherFamilyNameEng').type('Khan')
  // cy.goToNextFormSection()
  // SPOUSE DETAILS
  cy.get('#hasDetails_Yes').click()
  cy.get('#hasDetails\\.nestedFields\\.spouseFirstNamesEng').type('Angela')
  cy.get('#hasDetails\\.nestedFields\\.spouseFamilyNameEng').type('Mweene')
  cy.goToNextFormSection()
  // DOCUMENT DETAILS
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
  cy.get('#informant_FATHER').click()
  cy.get('#continue').click()
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
  cy.get('#multipleBirth').type('1')
  cy.get('#weightAtBirth').type('1.5')
  cy.selectOption('#placeOfBirth', 'Private_Home', 'Private Home')
  cy.selectOption('#country', 'Farajaland', 'Farajaland')
  cy.selectOption('#state', 'Pualula', 'Pualula')
  cy.selectOption('#district', 'Embe', 'Embe')

  cy.get('#addressLine4CityOption').type('My city')
  cy.get('#addressLine3CityOption').type('My residential area')
  cy.get('#addressLine2CityOption').type('My street')
  cy.get('#numberOption').type('40')

  cy.goToNextFormSection()
  // INFORMANT'S DETAILS
  cy.selectOption('#nationality', 'Farajaland', 'Farajaland')
  cy.get('#iD').type('123456789')
  cy.get('#firstNamesEng').type('Agnes')
  cy.get('#familyNameEng').type('Aktar')
  cy.selectOption('#countryPlaceOfHeritage', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePlaceOfHeritage', 'Pualula', 'Pualula')
  cy.selectOption('#districtPlaceOfHeritage', 'Embe', 'Embe')
  cy.selectOption('#countryPermanent', 'Farajaland', 'Farajaland')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')

  cy.goToNextFormSection()
  //  PRIMARY CARE GIVER DETAILS
  cy.get('#fathersDetailsExist_true').click()
  cy.get('#iD').type('121256789')
  cy.get('#familyNameEng').type('Sheikh')
  cy.get('#fatherBirthDate-dd').type('10')
  cy.get('#fatherBirthDate-mm').type('10')
  cy.get('#fatherBirthDate-yyyy').type('1971')
  cy.selectOption('#statePermanent', 'Pualula', 'Pualula')
  cy.selectOption('#districtPermanent', 'Embe', 'Embe')
  cy.get('#addressLine4CityOptionPermanent').type('My city')
  cy.get('#addressLine3CityOptionPermanent').type('My residential area')
  cy.get('#addressLine2CityOptionPermanent').type('My street')
  cy.get('#numberOptionPermanent').type('40')
  cy.goToNextFormSection()
  // //  Why are the mother and father not applying?
  // cy.get('#reasonMotherNotApplying').type('She is very sick to come.')
  // cy.get('#fatherIsDeceaseddeceased').click()
  cy.goToNextFormSection()
  //  Who is looking after the child?
  // cy.get('#primaryCaregiverType_INFORMANT').click()
  // cy.goToNextFormSection()
  // DOCUMENTS

})
