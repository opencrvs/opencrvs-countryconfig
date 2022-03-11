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

context('User Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests Local Admin can deactivate an user', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#navigation_team').click()
    cy.log('Choose an user')
    cy.get('#user-item-8-menuToggleButton').click()
    cy.get('#user-item-8-menuItem2').click()
    cy.get('#reason_OTHER').click()
    cy.get('#comment').type('not a member now')
    cy.get('#deactivate-action').click()
    // cy.contains('State Registrar').should('be.visible')
    // cy.get('#row_8').should('have.text','Active')
       
  })
  it.only('Tests admin can reactivate an user', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#user-item-8-menuToggleButton').click()
    cy.get('#user-item-8-menuItem1').click()
    cy.get('#reason_OTHER').click()
    cy.get('#comment').type('not a member now')
    cy.get('#reactivate-action').click()
  })
  

})