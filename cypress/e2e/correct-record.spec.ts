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

function refreshTrackingIdSearchUntilNameIsFound(
  trackingId: string,
  firstName: string,
  lastName: string
) {
  cy.get('#searchText').clear()
  cy.get('#searchText').type('E2E REFRESHING')
  cy.get('#searchText').type('{enter}')
  cy.get('#searchText').clear()
  cy.get('#searchText').type(trackingId)
  cy.get('#searchText').type('{enter}')

  cy.get('#row_0')
    .invoke('text')
    .then((text) => {
      if (!text.includes(`${firstName} ${lastName}`)) {
        cy.wait(1000)
        refreshTrackingIdSearchUntilNameIsFound(trackingId, firstName, lastName)
      }
    })
}

context('Correct Record Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it("declaration can be found with child's name", () => {
    const originalFirstName = faker.name.firstName()
    const originalLastName = faker.name.lastName()

    cy.createBirthRegistrationAs('registrar', {
      firstName: originalFirstName,
      familyName: originalLastName
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
        const newFirstName = faker.name.firstName()
        const newLastName = faker.name.lastName()
        cy.get('#firstNamesEng').clear().type(newFirstName)
        cy.get('#familyNameEng').clear().type(newLastName)
        cy.get('#back-to-review-button').click()
        cy.get('#continue_button').click()
        cy.get('#supportDocumentRequiredForCorrection_false').click()
        cy.get('#confirm_form').click()
        cy.get('#type_CLERICAL_ERROR', { timeout: 10000 }).click()
        cy.get('#confirm_form').click()
        cy.get('#correctionFees_NOT_REQUIRED', { timeout: 10000 }).click()
        cy.get('#make_correction').click()

        cy.get('#searchType', { timeout: 10000 }).click()
        cy.get('#tracking-id').click()

        refreshTrackingIdSearchUntilNameIsFound(
          trackingId,
          newFirstName,
          newLastName
        )
      })
  })
})
