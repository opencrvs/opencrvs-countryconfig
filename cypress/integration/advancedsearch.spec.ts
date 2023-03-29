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

import faker from '@faker-js/faker'
import { getDateMonthYearFromString } from '../support/commands'

context('Advanced Search Integration Test', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('OpenCRVS')
  })

  it('birth declaration can be found with  minimum advancedSearch inputs', () => {
    const firstName = faker.name.firstName()
    const familyName = faker.name.lastName()

    cy.createBirthRegistrationAs('fieldWorker', {
      firstName,
      familyName
    })

    cy.login('registrar')
    cy.createPin()

    cy.get('#searchType').click()
    cy.get('#advanced-search').click()
    cy.get('#BirthChildDetails-accordion').click()
    cy.get('#childFirstNames').type(firstName)
    cy.get('#childLastName').type(familyName)
    cy.get('#BirthRegistrationDetails-accordion').click()

    cy.get('#search').click()
    cy.get(`:contains("${firstName} ${familyName}")`).should('be.visible')
    cy.logout()
  })

  it('birth declaration can be found with  maximum advancedSearch inputs', () => {
    //PREPARE DATA
    const childFirstNames = faker.name.firstName()
    const childLastName = faker.name.lastName()
    const fatherFirstNames = faker.name.firstName()
    const fatherFamilyName = faker.name.lastName()
    const motherFirstNames = faker.name.firstName()
    const motherFamilyName = faker.name.lastName()
    const childDoB = '1998-08-19'
    const childGender = 'Male'
    const motherDoB = '1971-01-19'
    const fatherDoB = '1961-01-31'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const informantDoB = '1998-08-20'
    const childDoBSplit = getDateMonthYearFromString(childDoB)
    const motherDoBSplit = getDateMonthYearFromString(motherDoB)
    const fatherDoBSplit = getDateMonthYearFromString(fatherDoB)
    const informantDoBSplit = getDateMonthYearFromString(informantDoB)
    const eventCountry = 'Farajaland'
    const eventLocationLevel1 = 'Pualula'
    const eventLocationLevel2 = 'Embe'

    //LOGIN
    cy.login('registrar')
    cy.createPin()

    //CREATE REGISTRATION
    cy.verifyLandingPageVisible()
    cy.enterMaximumInput({
      childFirstNames,
      childLastName,
      childDoB,
      childGender,
      motherFirstNames,
      motherFamilyName,
      motherDoB,
      fatherFirstNames,
      fatherFamilyName,
      fatherDoB,
      informantFirstNames,
      informantFamilyName,
      informantDoB,
      eventCountry,
      eventLocationLevel1,
      eventLocationLevel2
    })
    //register declaration
    cy.get('#registerDeclarationBtn').click()
    cy.get('#submit_confirm').click()

    //OPEN ADVANCED SEARCH
    cy.get('#searchType').click()
    cy.get('#advanced-search').click()

    //ENTER REGISTRATION DETAILS FOR SEARCH
    cy.get('#BirthRegistrationDetails-accordion').click()
    cy.get('#placeOfRegistration').type('Ibombo District Office')
    cy.selectLocation('span', 'Ibombo District Office')
    cy.get('#dateOfRegistration-date_range_button').click()
    cy.get('#date-range-confirm-action').click()
    cy.selectOption('#registrationStatuses', 'Any status', 'Any status')
    //ENTER CHILD DETAILS FOR SEARCH
    cy.get('#BirthChildDetails-accordion').click()
    cy.get('#childDoBexact-dd').type(childDoBSplit.dd)
    cy.get('#childDoBexact-mm').type(childDoBSplit.mm)
    cy.get('#childDoBexact-yyyy').type(childDoBSplit.yyyy)
    cy.get('#childFirstNames').type(childFirstNames)
    cy.get('#childLastName').type(childLastName)
    cy.selectOption('#childGender', childGender, childGender)

    //ENTER EVENT DETAILS FOR SEARCH
    cy.get('#BirthEventDetails-accordion').click()
    cy.selectOption(
      '#eventLocationType',
      'Residential address',
      'Residential address'
    )
    cy.selectOption('#eventCountry', eventCountry, eventCountry)
    cy.selectOption(
      '#eventLocationLevel1',
      eventLocationLevel1,
      eventLocationLevel1
    )
    cy.selectOption(
      '#eventLocationLevel2',
      eventLocationLevel2,
      eventLocationLevel2
    )

    //ENTER MOTHER DETAILS FOR SEARCH
    cy.get('#BirthMotherDetails-accordion').click()
    cy.get('#motherDoBexact-dd').type(motherDoBSplit.dd)
    cy.get('#motherDoBexact-mm').type(motherDoBSplit.mm)
    cy.get('#motherDoBexact-yyyy').type(motherDoBSplit.yyyy)
    cy.get('#motherFirstNames').type(motherFirstNames)
    cy.get('#motherFamilyName').type(motherFamilyName)

    //ENTER FATHER DETAILS FOR SEARCH
    cy.get('#BirthFatherDetails-accordion').click()
    cy.get('#fatherDoBexact-dd').type(fatherDoBSplit.dd)
    cy.get('#fatherDoBexact-mm').type(fatherDoBSplit.mm)
    cy.get('#fatherDoBexact-yyyy').type(fatherDoBSplit.yyyy)
    cy.get('#fatherFirstNames').type(fatherFirstNames)
    cy.get('#fatherFamilyName').type(fatherFamilyName)

    // ENTER INFORMANT DETAILS FOR SEARCH
    cy.get('#BirthInformantDetails-accordion-header').click()
    cy.get('#informantDoBexact-dd').type(informantDoBSplit.dd)
    cy.get('#informantDoBexact-mm').type(informantDoBSplit.mm)
    cy.get('#informantDoBexact-yyyy').type(informantDoBSplit.yyyy)
    cy.get('#informantFirstNames').type(informantFirstNames)
    cy.get('#informantFamilyName').type(informantFamilyName)

    cy.get('#search').click()
    cy.get(`:contains("${childFirstNames} ${childLastName}")`).should(
      'be.visible'
    )
    cy.logout()
  })

  it('death declaration can be found with minimum advancedSearch inputs', () => {
    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()
    const deceasedDoB = '1988-08-19'
    const deceasedGender = 'Male'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const informantDoB = '1993-02-20'
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

    cy.login('registrar')
    cy.createPin()

    cy.get('#searchType').click()
    cy.get('#advanced-search').click()
    cy.get('#tab_death').click()
    cy.get('#DeathRegistrationDetails-accordion').click()
    cy.get('#dateOfRegistration-date_range_button').click()
    cy.get('#date-range-confirm-action').click()

    cy.selectOption('#registrationStatuses', 'Any status', 'Any status')
    cy.get('#search').click()
    cy.get(`:contains("${deceasedFirstNames} ${deceasedFamilyName}")`).should(
      'be.visible'
    )
    cy.logout()
  })

  it('death declaration can be found with maximum advancedSearch inputs', () => {
    const deceasedFirstNames = faker.name.firstName()
    const deceasedFamilyName = faker.name.lastName()
    const deceasedDoB = '1998-08-19'
    const deceasedGender = 'Male'
    const informantFirstNames = faker.name.firstName()
    const informantFamilyName = faker.name.lastName()
    const informantDoB = '1998-08-20'
    const deceasedDoBSplit = getDateMonthYearFromString(deceasedDoB)
    const informantDoBSplit = getDateMonthYearFromString(informantDoB)
    const eventCountry = 'Farajaland'
    const eventLocationLevel1 = 'Pualula'
    const eventLocationLevel2 = 'Embe'

    cy.declareDeathDeclarationWithMaximumInput({
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

    cy.login('registrar')
    cy.createPin()
    //OPEN ADVANCED SEARCH
    cy.get('#searchType').click()
    cy.get('#advanced-search').click()
    cy.get('#tab_death').click()
    //ENTER REGISTRATION DETAILS FOR SEARCH
    cy.get('#DeathRegistrationDetails-accordion').click()
    cy.get('#placeOfRegistration').type('Ibombo District Office')
    cy.selectLocation('span', 'Ibombo District Office')
    cy.get('#dateOfRegistration-date_range_button').click()
    cy.get('#date-range-confirm-action').click()
    cy.selectOption('#registrationStatuses', 'Any status', 'Any status')
    //ENTER DECEASED DETAILS FOR SEARCH
    cy.get('#DeathdeceasedDetails-accordion-header').click()
    cy.get('#deceasedDoBexact-dd').type(deceasedDoBSplit.dd)
    cy.get('#deceasedDoBexact-mm').type(deceasedDoBSplit.mm)
    cy.get('#deceasedDoBexact-yyyy').type(deceasedDoBSplit.yyyy)
    cy.get('#deceasedFirstNames').type(deceasedFirstNames)
    cy.get('#deceasedFamilyName').type(deceasedFamilyName)
    cy.selectOption('#deceasedGender', deceasedGender, deceasedGender)
    //ENTER EVENT DETAILS FOR SEARCH
    cy.get('#DeathEventDetails-accordion').click()
    cy.selectOption(
      '#eventLocationType',
      'Residential address',
      'Residential address'
    )
    cy.selectOption('#eventCountry', eventCountry, eventCountry)
    cy.selectOption(
      '#eventLocationLevel1',
      eventLocationLevel1,
      eventLocationLevel1
    )
    cy.selectOption(
      '#eventLocationLevel2',
      eventLocationLevel2,
      eventLocationLevel2
    )
    //ENTER INFORMANT DETAILS FOR SEARCH
    cy.get('#DeathInformantDetails-accordion-header').click()
    cy.get('#informantDoBexact-dd').type(informantDoBSplit.dd)
    cy.get('#informantDoBexact-mm').type(informantDoBSplit.mm)
    cy.get('#informantDoBexact-yyyy').type(informantDoBSplit.yyyy)
    cy.get('#informantFirstNames').type(informantFirstNames)
    cy.get('#informantFamilyName').type(informantFamilyName)
    //GOTO SEARCH RESULT
    cy.get('#search').click()
    cy.get(`:contains("${deceasedFirstNames} ${deceasedFamilyName}")`).should(
      'be.visible'
    )
  })
})
