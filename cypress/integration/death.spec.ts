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
  }) 

  it('Tests registration by registrar using maximum input', () => {
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // APPLICATION FORM
    cy.initializeFakeTimers()
    cy.enterDeathMaximumInput()

    cy.registerApplication()
     
  }) 

  it('Tests from application to registration using minimum input', () => {
    cy.registerDeathApplicationWithMinimumInput()
  })

  it('Login as registrar to register minimum input death application',() => {
    
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.get('#ListItemAction-0-icon > .sc-lmgQde > svg').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)
    cy.get('#registerApplicationBtn').click()
    cy.get('#submit_confirm').click()
    cy.wait(1000)
    cy.reload()
    cy.get('#tab_review > .sc-jSFkmK').click()
    cy.wait(1000)
    cy.get('#tab_print > .sc-jSFkmK').click()
    // LOG OUT
    cy.logOut()
  }) 
  
  it('Tests from application to registration using maximum input', () => {
    cy.registerDeathApplicationWithMaximumInput()
  })

  it('Login as registrar to register maximum input death application',() => {
    
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.get('#ListItemAction-0-icon > .sc-lmgQde > svg').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)
    cy.get('#registerApplicationBtn').click()
    cy.get('#submit_confirm').click()
    cy.wait(1000)
    cy.reload()
    cy.get('#tab_review > .sc-jSFkmK').click()
    cy.wait(1000)
    cy.get('#tab_print > .sc-jSFkmK').click()
    // LOG OUT
    cy.logOut()
  }) 
  

  it('Tests from application to rejection using minimum input', () => {
    cy.declareDeathApplicationWithMinimumInput()
  })

  it('Login As Register & Reject Minimum input Death Application',() => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    
    cy.createPin()
    // LANDING PAGE Download 1st application & Reject Application
    cy.get('#ListItemAction-0-icon').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)

    //Reject Application
    cy.get('#rejectApplicationBtn').click()
     cy.get(':nth-child(3) > .sc-hYRTcE').click()
    cy.get('#rejectionCommentForHealthWorker').type('Missing Supporting information ')
    cy.get('#submit_reject_form').click()
    cy.wait(2000)
    //logout
    cy.logOut()
  }) 
  

  it('Tests from application to rejection using maximum input', () => {

    cy.declareDeathApplicationWithMaximumInput()
  }) 

  it('Login As Register & Reject Maximum input Death Application',() => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    
    cy.createPin()
    // LANDING PAGE Download 1st application & Reject Application
    cy.get('#ListItemAction-0-icon').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)

    //Reject Application
    cy.get('#rejectApplicationBtn').click()
    cy.get(':nth-child(3) > .sc-hYRTcE').click()
    cy.get('#rejectionCommentForHealthWorker').type('Missing Supporting information ')
    cy.get('#submit_reject_form').click()
    cy.wait(2000)
    
    //logout
    cy.logOut()
  }) 
  
  

})
