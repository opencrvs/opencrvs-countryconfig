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

context('Reports Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests for performance reports birth using minimum input', () => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    cy.createPin()

    // CLICK PERFORMANCE Navigation ITEM
    cy.get('#navigation_performance').click()
    // INPUT SEARCH LOCATION
    cy.get('#change-location-link').click()
    cy.get('#locationSearchInput').type('Sulaka')
    cy.initializeFakeTimers()
    cy.get('#locationSearchInput')
      .siblings('ul')
      .children()
      .first()
      .click()
    cy.clock()
    cy.tick(20000)
    cy.get('#location-search-btn').click()

    //select Reports
    cy.selectOption('#operational-select', 'Operational', 'Reports')

    // CLICK MONTHLY REPORTS BIRTH CURRENT MONTH ROW FIRST COLUMN
    cy.get('#row_' + new Date().getMonth())
      .first()
      .children()
      .first()
      .children()
      .click()
    cy.clock()
    cy.wait(100)
    cy.tick(20000)
  })
})
