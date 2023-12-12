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

context('Death Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('Tests registration by registrar using maximum input', () => {
    cy.login('registrar')
    cy.createPin()
    cy.verifyLandingPageVisible()

    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()
    const deceasedDoB = '1978-03-19'
    const deceasedGender = 'Male'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const informantDoB = '1985-05-20'
    const eventCountry = 'Farajaland'
    const eventLocationLevel1 = 'Pualula'
    const eventLocationLevel2 = 'Embe'
    cy.enterDeathMaximumInput({
      deceasedFirstNames,
      deceasedFamilyName,
      deceasedDoB,
      deceasedGender,
      informantFirstNames,
      informantFamilyName,
      informantDoB,
      eventCountry,
      eventLocationLevel1,
      eventLocationLevel2
    })
    cy.registerDeclaration()
  })

  it('Login as field agent and tests from declaration to registration using minimum input ', () => {
    cy.registerDeathDeclarationWithMinimumInput()
  })

  it('Login as registrar to register minimum input death declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
  })

  it('Login as field agent and tests from declaration to registration using maximum input', () => {
    cy.registerDeathDeclarationWithMaximumInput()
  })

  it('Login as registrar to register maximum input death declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
  })

  it('Tests from declaration to rejection using minimum input', () => {
    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()
    const deceasedDoB = '1958-03-19'
    const deceasedGender = 'Male'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const informantDoB = '1983-03-15'
    const eventCountry = 'Farajaland'
    const eventLocationLevel1 = 'Pualula'
    const eventLocationLevel2 = 'Embe'

    cy.declareDeathDeclarationWithMinimumInput({
      deceasedFirstNames,
      deceasedFamilyName,
      deceasedDoB,
      deceasedGender,
      informantFirstNames,
      informantFamilyName,
      informantDoB,
      eventCountry,
      eventLocationLevel1,
      eventLocationLevel2
    })
  })

  it('Login As Register & Reject Minimum input Death Declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.rejectDeclaration()
  })

  it('Tests from declaration to rejection using maximum input', () => {
    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()
    cy.declareDeathDeclarationWithMaximumInput({
      deceasedFirstNames,
      deceasedFamilyName
    })
  })

  it('Login As Register & Reject Maximum input Death Declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.rejectDeclaration()
  })
})
