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

  it('creates user as SYSTEM ADMIN and to activate account login for the first time as REGISTRAR', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#add-user').click()
    cy.get('#firstNamesEng').type('Naeem')
    cy.get('#familyNameEng').type('Ahmed')
    cy.get('#phoneNumber').type('0711919045')
    //cy.get('#nid').type('199475632')
    cy.selectOption('#role', 'Field Agent', 'Field Agent')
    cy.get('#device').type('Xiamoi MI 8')
    cy.get('#confirm_form').click()
    // PREVIEW
    cy.get('#submit_user_form').click()
    cy.get('#submissionSuccessToast').should('be.visible') // Wait for declaration to be sync'd
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOG IN AS FIELD AGENT
    cy.get('#username').type('n.ahmed')
    cy.get('#password').type('test')
    cy.get('#login-mobile-submit').click()
    cy.get('#user-setup-start-button', { timeout: 30000 }).click()
    cy.get('#NewPassword').type('Test0000')
    cy.get('#ConfirmPassword').type('Test0000')
    cy.get('#Continue').click()
    // SECURITY QUESTIONS
    cy.get('#question-0').should('exist')
    cy.selectOption('#question-0', 'BIRTH_TOWN', 'What city were you born in?')
    cy.get('#answer-0').type('Dhaka')
    cy.get('#question-1').should('exist')
    cy.selectOption(
      '#question-1',
      'FAVORITE_MOVIE',
      'What is your favorite movie?'
    )
    cy.get('#answer-1').type('Joker')
    cy.get('#question-2').should('exist')
    cy.selectOption(
      '#question-2',
      'FAVORITE_FOOD',
      'What is your favorite food?'
    )
    cy.get('#answer-2').type('Burger')
    cy.get('#submit-security-question').click()
    // PREVIEW
    cy.get('#Confirm').click()
    // WELCOME MESSAGE
    cy.get('#setup-login-button').click()
  })

  it('should reset username successfully', () => {
    cy.visit(Cypress.env('CLIENT_URL'))
    cy.get('#login-forgot-password').click()

    // Forgotten item form appears
    cy.get('#forgotten-item-form').should('be.visible')
    cy.get('#usernameOption').click()
    cy.get('#continue').click()

    // Phone number verification form appears
    cy.get('#phone-or-email-verification-form').should('be.visible')
    cy.get('#phone-number-input').type('0711919045')
    cy.get('#continue').click()

    // Security question form appears
    cy.get('#security-question-form').should('be.visible')
    cy.get('#content-name').then($q => {
      const question = $q.text()
      let answer
      if (question === 'What is your favorite food?') {
        answer = 'Burger'
      } else if (question === 'What is your favorite movie?') {
        answer = 'Joker'
      } else {
        answer = 'Dhaka'
      }

      cy.get('#security-answer-input').type(answer)
    })
    cy.get('#continue').click()

    // Success page appears
    cy.url().should('include', 'success')
    cy.get('#login-button').click()

    // Login page appears
    cy.get('#login-step-one-box').should('be.visible')
  })

  it('should reset password successfully', () => {
    cy.visit(Cypress.env('CLIENT_URL'))
    cy.get('#login-forgot-password').click()

    // Forgotten item form appears
    cy.get('#forgotten-item-form').should('be.visible')
    cy.get('#passwordOption').click()
    cy.get('#continue').click()

    // Phone number verification form appears
    cy.get('#phone-or-email-verification-form').should('be.visible')
    cy.get('#phone-number-input').type('0711919045')
    cy.get('#continue').click()

    // Recovery code entry form appears
    cy.get('#recovery-code-entry-form').should('be.visible')
    cy.get('#recovery-code-input').type('000000')
    cy.get('#continue').click()
    // Security question form appears
    cy.get('#security-question-form').should('be.visible')
    cy.get('#content-name').then($q => {
      const question = $q.text()
      let answer
      if (question === 'What is your favorite food?') {
        answer = 'Burger'
      } else if (question === 'What is your favorite movie?') {
        answer = 'Joker'
      } else {
        answer = 'Dhaka'
      }

      cy.get('#security-answer-input').type(answer)
    })
    cy.get('#continue').click()

    // Password update form appears
    cy.get('#password-update-form').should('be.visible')
    cy.get('#NewPassword').type('Asdf1234')
    cy.get('#ConfirmPassword').type('Asdf1234')
    cy.get('#continue-button').click()

    // Success page appears
    cy.url().should('include', 'success')
    cy.get('#login-button').click()

    // Login page appears
    cy.get('#login-step-one-box').should('be.visible')
  })
})
