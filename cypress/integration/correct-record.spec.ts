/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
/// <reference types="Cypress" />

import faker from '@faker-js/faker'

context('Correct Record Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it("declaration can be found with child's name", () => {
    let firstName = faker.name.firstName()
    let familyName = faker.name.lastName()

    cy.createBirthRegistrationAs('registrar', {
      firstName,
      familyName
    })

    cy.login('registrar')
    cy.createPin()
    cy.get('#navigation_print').click()
    cy.get('#ListItemAction-0-icon').click()
    cy.get('#assignment').should('exist')
    cy.get('#assign').click()
    cy.get('#name_0').click()
    cy.get('[data-testid=trackingId-value]')
      .invoke('text')
      .then((trackingId) => {
        cy.get('#btn-correct-record').click()
        cy.get('#relationship-form-input')
          .contains('Another registration agent or field agent')
          .click()
        cy.get('#confirm_form').click()
        cy.get('#btn_change_child_familyNameEng').click()
        cy.get('#firstNamesEng').clear().type('Jonas')
        cy.get('#familyNameEng').clear().type('Kahnwald')
        firstName = 'Jonas'
        familyName = 'Kahnwald'
        cy.get('#back-to-review-button').click()
        cy.get('#continue_button').click()
        cy.get('#supportDocumentRequiredForCorrection_false').click()
        cy.get('#confirm_form').click()
        // we need to figure out a way to remove these waits
        cy.wait(5000)
        cy.get('#type_CLERICAL_ERROR').click()
        cy.get('#confirm_form').click()
        cy.wait(5000)
        cy.get('#correctionFees_NOT_REQUIRED').click()
        cy.get('#make_correction').click()
        cy.wait(10000)
        cy.get('#searchType').click()
        cy.get('#tracking-id').click()
        cy.get('#searchText').type(trackingId)
        cy.get('#searchText').type('{enter}')
        cy.get(`:contains("${firstName} ${familyName}")`).should('be.visible')
      })
  })
})
