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

context('Birth Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('login as a field agent, send a declaration using maximum input', () => {
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.enterMaximumInput()
    cy.submitDeclaration()
    cy.logout()
  })

  it('login as registrar and register declaration with maximum input', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
    cy.logout()
  })

  it('login as a field agent, send a declaration using minimum input', () => {
    cy.declareDeclarationWithMinimumInput()
  })

  it('login as registrar to register minimum input declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
    cy.logout()
  })

  it('login as a registrar and reject a maximum input declaration', () => {
    // Create declaration with an API call
    cy.createBirthRegistrationAs('fieldWorker')

    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.rejectDeclaration()
    cy.logout()
  })

  it('login as a registrar and create declaration with maximum input', () => {
    cy.login('registrar')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.enterMaximumInput()
    //register declaration
    cy.get('#registerDeclarationBtn').click()
    cy.get('#submit_confirm').click()
    cy.log('Waiting for declaration to sync...')
  })

  it('login as field agent, create birth declaration as "Someone else"', () => {
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()

    cy.someoneElseJourney()
    cy.submitDeclaration()
    cy.logout()
  })

  it('login as registrar & register "Someone else" declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
  })
})
