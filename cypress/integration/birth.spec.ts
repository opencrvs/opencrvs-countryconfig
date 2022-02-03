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
  // Minimum input 
  it('Tests from application to certification using minimum input', () => {
    cy.declareApplicationWithMinimumInput('Arif', 'Antor')
    
  })
 
  it('Login as registrar to register minimum input Birth application',() => {
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

  //Maximum input
  it('Tests from application to registration using maximum input', () => {
    cy.registerApplicationWithMaximumInput('Sharifuz', 'Prantor')
  })

  it('LogIn as Registrar to Register Maximum input Application',() => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    cy.createPin()

    //LANDING PAGE download and register application
    cy.get('#ListItemAction-0-icon > .sc-lmgQde > svg').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)
    cy.get('#registerApplicationBtn').click()
    cy.get('#submit_confirm').click()
    cy.wait(1000)
    cy.reload()

    // LOG OUT
    cy.logOut()
  })  

  
 // Rejection Minimum
  it('Tests from application to rejection using minimum input', () => {
   cy.declareApplicationWithMinimumInput('Atiq', 'Zaman')
  })

  it('Login as Register & Reject Minimum input Application',() => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    
    cy.createPin()
    // LANDING PAGE Download 1st application & Reject Application
    cy.get('#ListItemAction-0-icon').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)

    //Reject Application
  
    cy.rejectApplication()
    
    //logout
   cy.logOut()
  })
   
  //Rejection Maximum
  it('Tests from application to rejection using maximum input', () => {
   
    cy.declareApplicationWithMaximumInput('Evans', 'Kangwa')
    
  })

  it('Login as Registrar & Reject Maximum input Application',()=>{
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE,Download Application
    cy.get('#ListItemAction-0-icon').click()
    cy.get('#ListItemAction-0-Review').click()
    cy.wait(1000)

    //Reject Application
    cy.get('#rejectApplicationBtn').click()
    cy.get(':nth-child(3) > .sc-hYRTcE').click()
    cy.get('#rejectionCommentForHealthWorker').type('Missing Supporting information ')
    cy.get('#submit_reject_form').click()
    cy.wait(3000)
    //logout
    cy.logOut()
  })
 
    
  //Maximum input by Register
  it('Tests registration by registrar using maximum input', () => {
    // LOGIN AS FIELD WORKER
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    // EVENTS
    cy.clock(new Date().getTime())
    cy.enterMaximumInput('Ryan', 'Crichton')
    cy.get('.sc-bCwgka').click()
    //register application
    cy.get('#registerApplicationBtn').click()
    //MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for application to sync...')
    cy.tick(20000)
  }) 

  
  //SomeOne Else giving input
  it('Tests Someone else journey using minimum input', () => {
    // LOGIN
    cy.login('fieldWorker')
    // CREATE PIN
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.initializeFakeTimers()
    cy.someoneElseJourney()

    cy.submitApplication()
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
  }) 

  it('Login as Registrar & register Someone else minimum input application',()=>{
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    cy.createPin()
    // LANDING PAGE,Download & register application 
    cy.wait(1000)
    //download first application
    cy.get('#ListItemAction-0-icon').click()
    //review 
    cy.get('#ListItemAction-0-Review').click()
    //Register button
    cy.get('#registerApplicationBtn').click()
    //submit confirm
    cy.get('#submit_confirm').click()
    cy.wait(2000)

    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
  })  

})
