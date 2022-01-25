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
    
   cy.declareApplicationWithMinimumInput('sakib', 'Al-Hasan')
   cy.wait(1000)
  
  })

  it('Register Minimum input application & Print it out',() => {
   
     cy.login('registrar')
     // CREATE PIN
     cy.createPin()
     
     cy.get('#ListItemAction-0-icon > .sc-lmgQde > svg').click()
     cy.get('#ListItemAction-0-Review').click()
     cy.wait(1000)
     cy.get('#registerApplicationBtn').click()
     cy.get('#submit_confirm').click()
     cy.wait(2000)
     //cy.reload()
 
     cy.printApplication() 


     
   })



})
