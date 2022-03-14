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

context('Performance view', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })
  it('Tests from declaration to certification using minimum input', () => {
    
    cy.declareDeclarationWithMinimumInput('Mr', 'Performance')
  
  })

 
  it('Login as registrar to register & Downloads CSV data to observe Performance',() => {
    
    cy.login('registrar')
     // CREATE PIN
    cy.createPin()
     //review declaration
    cy.reviewForm()
     //register declaration
     cy.get('#registerDeclarationBtn').click()
     cy.get('#submit_confirm').click()
    cy.get('#navigation_performance').click()
    cy.get('#operational-select').click()
    cy.get('#react-select-2-option-1').click()
    cy.get('#row_0 button')
      .eq(1)
      .click()
    cy.get('#listTable-undefined').click()
    
  }) 

})
