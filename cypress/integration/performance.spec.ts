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
  it.only('Tests from application to certification using minimum input', () => {
    cy.registerApplicationWithMaximumInput('Pricila', 'chan')
    cy.wait(1000)
  })
 
  it.only('Login as registrar to register & Downloads CSV data to observe Performance',() => {
    
    cy.login('registrar')
     // CREATE PIN
    cy.createPin()
     //review application
    cy.reviewForm()
     //register application
    // cy.submitForm()
    cy.submitAplication()
    cy.get('#navigation_performance').click()
    //go to Navigation performance
    // cy.get('#navigation_performance').click()
    cy.get('#operational-select').click()
    cy.get('#react-select-2-option-1').click()
    cy.get('#row_0 button')
      .eq(1)
      .click()
    cy.get('#listTable-undefined').click()
    
  }) 

})