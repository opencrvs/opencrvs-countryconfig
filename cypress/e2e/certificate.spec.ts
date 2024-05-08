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

context('Certificate Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Prints minimum input declaration showing the pdf form', () => {
    cy.createBirthRegistrationAs('fieldWorker')

    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.registerForm()
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000)
    cy.get('#navigation_print').click()
    cy.downloadFirstDeclaration()
    cy.get('#ListItemAction-0-Print').click()
    cy.get('#type_INFORMANT_Mother').click()
    cy.get('#confirm_form').click()
    cy.get('#verifyPositive').click()

    // Verify payment
    cy.get('#Continue').click()
    cy.get('#confirm-print').click()
    cy.get('.react-pdf__message react-pdf__message--no-data').should(
      'not.exist'
    )

    cy.window().then((win) => {
      cy.stub(win, 'open')
        .as('open')
        .returns({
          location: {
            href: ''
          }
        })
    })

    cy.get('#print-certificate').click()
    cy.waitForOutboxToClear()

    cy.logout()
  })
})
