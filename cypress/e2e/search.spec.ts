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

context('Search Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it("declaration can be found with child's name", () => {
    const firstName = faker.name.firstName()
    const familyName = faker.name.lastName()

    cy.createBirthRegistrationAs('fieldWorker', {
      firstName,
      familyName
    })

    cy.login('registrar')
    cy.createPin()

    cy.get('#searchType').click()
    cy.get('#name').click()
    cy.get('#searchText').type(familyName)
    cy.get('#searchText').type('{enter}')

    cy.get(`:contains("${firstName} ${familyName}")`).should('be.visible')
  })
})
