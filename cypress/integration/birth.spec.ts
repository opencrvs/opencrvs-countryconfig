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
  it('Tests from declaration to certification using minimum input', () => {
    cy.declareDeclarationWithMinimumInput('Arif', 'Antor')
    
  })
 
  it('Login as registrar to register minimum input Birth declaration',() => {
    cy.login('registrar')
      // CREATE PIN
    cy.createPin()
      //review declaration
    cy.reviewForm()

     //register Declaration
    cy.submitForm()
      // LOG OUT
    cy.logOut()
  }) 

  //Maximum input
  it('Tests from declaration to registration using maximum input', () => {
    cy.registerDeclarationWithMaximumInput('Sharifuz', 'Prantor')
  })

  it('LogIn as Registrar to Register Maximum input Declaration',() => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
      // CREATE PIN
    cy.createPin()
      //review declaration
    cy.reviewForm()

     //register Declaration
    cy.submitForm()
      // LOG OUT
    cy.logOut()
  })  

  
 // Rejection Minimum
  it('Tests from declaration to rejection using minimum input', () => {
   cy.declareDeclarationWithMinimumInput('Aariz', 'Sahil')
  })

  it('Login as Register & Reject Minimum input Declaration',() => {
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
    
    cy.createPin()
      // LANDING PAGE Download 1st declaration 
    cy.reviewForm()
      //Reject Declaration
    cy.rejectDeclaration()
      //logout
   cy.logOut()
  })
   
  //Rejection Maximum
  it('Tests from declaration to rejection using maximum input', () => {
    cy.declareDeclarationWithMaximumInput('Larry', 'Page')
  })

  it('Login as Registrar & Reject Maximum input Declaration',()=>{
      // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
      // CREATE PIN
    cy.createPin()
      // LANDING PAGE,Download Declaration
    cy.reviewForm()
    cy.rejectDeclaration()
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
    
    //register declaration
    cy.get('#registerDeclarationBtn').click()
    //MODAL
    cy.get('#submit_confirm').click()
    cy.log('Waiting for declaration to sync...')
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

    cy.submitDeclaration()
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
  }) 

  it('Login as Registrar & register Someone else minimum input declaration',()=>{
    // LOGIN AS LOCAL REGISTRAR
    cy.login('registrar')
    // CREATE PIN
  cy.createPin()
    //review declaration
  cy.reviewForm()

   //register Declaration
  cy.submitForm()
  cy.wait(1000)
    // LOG OUT
  // cy.get('#ProfileMenuToggleButton').click()
  // cy.get('#ProfileMenuItem1').click()
  })  

})
