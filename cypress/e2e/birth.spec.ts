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

import faker from '@faker-js/faker'

context('Birth Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('login as a field agent, send a declaration using maximum input', () => {
    const motherDoB = '1971-01-19'
    const fatherDoB = '1961-01-31'
    const informantDoB = '1981-01-31'
    const informantType = 'Grandfather'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const motherFirstNames = faker.name.firstName()
    const motherFamilyName = faker.name.lastName()
    const fatherFirstNames = faker.name.firstName()
    const fatherFamilyName = faker.name.lastName()
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.enterMaximumInput({
      informantType,
      motherDoB,
      motherFirstNames,
      motherFamilyName,
      fatherDoB,
      fatherFirstNames,
      fatherFamilyName,
      informantFirstNames,
      informantFamilyName,
      informantDoB
    })
    cy.submitDeclaration()
    cy.logout()
  })

  it('login as registrar and register declaration with maximum input', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
    cy.logout()
  })

  it('login as a field agent, send a declaration using minimum input', () => {
    cy.declareDeclarationWithMinimumInput()
  })

  it('login as registrar to register minimum input declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
    cy.logout()
  })

  it('login as a registrar and reject a maximum input declaration', () => {
    // Create declaration with an API call
    cy.createBirthRegistrationAs('fieldWorker')

    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.rejectDeclaration()
    cy.logout()
  })

  it('login as a registrar and create declaration with maximum input', () => {
    const motherDoB = '1971-01-19'
    const fatherDoB = '1961-01-31'
    const informantDoB = '1981-01-31'
    const informantType = 'Grandfather'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const motherFirstNames = faker.name.firstName()
    const motherFamilyName = faker.name.lastName()
    const fatherFirstNames = faker.name.firstName()
    const fatherFamilyName = faker.name.lastName()

    cy.login('registrar')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.enterMaximumInput({
      informantType,
      motherDoB,
      motherFirstNames,
      motherFamilyName,
      fatherDoB,
      fatherFirstNames,
      fatherFamilyName,
      informantFirstNames,
      informantFamilyName,
      informantDoB
    })
    //register declaration
    cy.get('#registerDeclarationBtn').click()
    cy.get('#submit_confirm').click()
    cy.log('Waiting for declaration to sync...')
  })

  it('login as field agent, create birth declaration as "Someone else"', () => {
    cy.login('fieldWorker')
    cy.createPin()
    cy.verifyLandingPageVisible()
    cy.someoneElseJourney()
    cy.submitDeclaration()
    cy.logout()
  })

  it('login as registrar & register "Someone else" declaration', () => {
    cy.login('registrar')
    cy.createPin()
    cy.reviewForm()
    cy.submitForm()
  })
})
