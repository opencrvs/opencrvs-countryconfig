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

context('Death Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
    cy.initializeFakeTimers()
  })

  it('Tests from application to registration using minimum input', () => {
    cy.initializeFakeTimers()
    cy.registerDeathApplicationWithMinimumInput()
  })

  it('Tests from application to registration using maximum input', () => {
    cy.initializeFakeTimers()
    cy.registerDeathApplicationWithMaximumInput()
  })

  it('Tests from application to rejection using minimum input', () => {
    cy.initializeFakeTimers()
    cy.declareDeathApplicationWithMinimumInput()
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
    cy.declareDeathApplicationWithMaximumInput()
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
    // Fix time to 2019-11-12
    cy.clock(1573557567230)
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.enterDeathMaximumInput()

    cy.registerApplication()
  })
})
