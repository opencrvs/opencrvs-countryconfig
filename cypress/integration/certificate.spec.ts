// /*
//  * This Source Code Form is subject to the terms of the Mozilla Public
//  * License, v. 2.0. If a copy of the MPL was not distributed with this
//  * file, You can obtain one at https://mozilla.org/MPL/2.0/.
//  *
//  * OpenCRVS is also distributed under the terms of the Civil Registration
//  * & Healthcare Disclaimer located at http://opencrvs.org/license.
//  *
//  * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
//  * graphic logo are (registered/a) trademark(s) of Plan International.
//  */

/// <reference types="Cypress" />

context('Certificate Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests from application to certification using minimum input', () => {
    
    cy.declareApplicationWithMinimumInput('Sakib', 'Al-Hasan')
  
  })

  it('Registers Minimum input application',() => {
   
     cy.login('registrar')
     // CREATE PIN
     cy.createPin()
     cy.get('#tab_review').click()
     cy.get('#ListItemAction-0-icon > .sc-lmgQde > svg').click()
     cy.get('#ListItemAction-0-Review').click()

     //register 
     cy.get('#registerApplicationBtn').click()
     cy.get('#submit_confirm').click()
     cy.wait(5000)
     cy.reload()
  })

  it('Prints minimum input application',() => {
   
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.printApplication() 
  })
})
