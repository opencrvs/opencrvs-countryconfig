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

import { faker } from '@faker-js/faker'

context('Team Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  const testUserFirstname = faker.name.firstName()
  const testUserLastname = faker.name.lastName()
  const fullName = `${testUserFirstname} ${testUserLastname}`

  it('Tests Local admin can create a new user', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#add-user').click()
    cy.get('#firstNamesEng').type(testUserFirstname)
    cy.get('#familyNameEng').type(testUserLastname)
    cy.get('#phoneNumber').type('0752658545')
    cy.selectOption('#role', 'Registration Clerk', 'Registration Clerk')
    cy.selectOption('#type', 'Data entry clerk', 'Data entry clerk')
    cy.get('#device').type('Xiamoi MI 8')
    cy.get('#confirm_form').click()
    // PREVIEW
    cy.get('#submit_user_form').click()
    cy.get('#submissionSuccessToast').should('be.visible') // Wait for application to be sync'd
    // LOG OUT
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
    // LOG IN AS FIELD AGENT
    cy.get('#username').type(
      `${testUserFirstname[0].toLowerCase()}.${testUserLastname.toLowerCase()}`
    )
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

  it('Tests Local admin can edit an user', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.clickUserListItemByName(fullName, 'Edit details')
    cy.get('#btn_change_firstNamesEng').click()
    cy.get('#firstNamesEng').type(' Sheikh')
    cy.get('#confirm_form').click()

    //submit user
    cy.get('#submit-edit-user-form').click()
  })

  it('Tests National Admin can deactivate an user', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#navigation_team').click()
    cy.get('#locationSearchInput').type('Ibombo')
    cy.contains('Ibombo').click()
    cy.get('#location-search-btn').click()
    cy.log('Choose an user')
    cy.clickUserListItemByName(
      `${testUserFirstname} Sheikh ${testUserLastname}`,
      'Deactivate'
    )
    cy.get('[for="reason_OTHER"]').click()
    cy.get('#comment').type('not a member now')
    cy.get('#deactivate-action').click()
    cy.contains('Registration Clerk').should('be.visible')
  })

  it('Tests National Admin can Reactivate an user', () => {
    // LOG IN AS national SYSTEM ADMIN
    cy.login('nsysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#navigation_team').click()
    cy.get('#locationSearchInput').type('Ibombo')
    cy.contains('Ibombo ').click()
    cy.get('#location-search-btn').click()
    cy.log('Choose an user')
    cy.clickUserListItemByName(
      `${testUserFirstname} Sheikh ${testUserLastname}`,
      'Reactivate'
    )
    cy.get('[for="reason_OTHER"]').click()
    cy.get('#comment').type('a member now')
    cy.get('#reactivate-action').click()
    cy.get('#ProfileMenuToggleButton').click()
    cy.get('#ProfileMenuItem1').click()
  })

  it('Tests Local Admin can deactivate an user', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.get('#navigation_team').click()
    cy.log('Choose an user')
    cy.clickUserListItemByName(
      `${testUserFirstname} Sheikh ${testUserLastname}`,
      'Deactivate'
    )
    cy.get('[for="reason_OTHER"]').should('be.visible')
    cy.get('[for="reason_OTHER"]').click()
    cy.get('#comment').type('not a member now')
    cy.get('#deactivate-action').click()
    cy.contains('State Registrar').should('be.visible')
  })

  it('local admin can reactivate an user', () => {
    // LOG IN AS SYSTEM ADMIN
    cy.login('sysAdmin')
    cy.createPin()
    cy.get('#navigation_team').click()
    cy.clickUserListItemByName(
      `${testUserFirstname} Sheikh ${testUserLastname}`,
      'Reactivate'
    )
    cy.get('[for="reason_OTHER"]').should('be.visible')
    cy.get('[for="reason_OTHER"]').click()
    cy.get('#comment').type(' a member now')
    cy.get('#reactivate-action').click()
  })
})
