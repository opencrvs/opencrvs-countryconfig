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
/// <reference types="Cypress" />

context('Birth Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to registration using minimum input', () => {
    cy.initializeFakeTimers()
    cy.registerApplicationWithMinimumInput('Tahmid', 'Rahman')
  })

  it('Tests from application to registration using maximum input', () => {
    cy.initializeFakeTimers()
    cy.registerApplicationWithMaximumInput('Maruf', 'Hossein')
  })

  it('Tests from application to rejection using minimum input', () => {
    cy.initializeFakeTimers()
    cy.declareApplicationWithMinimumInput('Atiq', 'Zaman')
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()

    cy.rejectApplication()
  })

  it('Tests from application to rejection using maximum input', () => {
    cy.initializeFakeTimers()
    cy.declareApplicationWithMaximumInput('Evans', 'Kangwa')
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()

    cy.rejectApplication()
  })

  it('Tests registration by registrar using maximum input', () => {
    cy.initializeFakeTimers()
    // LOGIN AS FIELD WORKER
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // EVENTS
    cy.enterMaximumInput('Ryan', 'Crichton')

    cy.registerApplication() // Wait for application to be sync'd
  })

  it('Test Someone else journey using minimum input', () => {
    cy.initializeFakeTimers()
    // LOGIN
    cy.login('fieldWorker')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.someoneElseJourney()

    cy.submitApplication()
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE
    cy.downloadFirstApplication()
    cy.get('#ListItemAction-0-Review').should('exist')
    cy.get('#ListItemAction-0-Review')
      .first()
      .click()

    cy.registerApplication()
  })
})
