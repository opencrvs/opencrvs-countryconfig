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

context('Performance view', () => {
  beforeEach(() => {
    cy.initializeFakeTimers()
    indexedDB.deleteDatabase('OpenCRVS')
    cy.registerApplicationWithMinimumInput('Yeasin', 'Hossein')
  })

  it('allows downloading metrics data as a CSV', () => {
    cy.server()
    cy.route('GET', '**/export/monthlyPerformanceMetrics?**').as('getExport')
    cy.get('#menu-performance').click()
    cy.get('#operational-select').click()
    cy.get('#react-select-2-option-1').click()
    cy.get('#row_0 button')
      .eq(1)
      .click()
    cy.wait('@getExport')
    cy.get('#row_0 button')
      .eq(3)
      .click()
    cy.wait('@getExport')
  })
})
