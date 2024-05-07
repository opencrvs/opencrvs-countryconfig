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
/// <reference types="cypress" />

type BirthDeclarationOptions = {
  firstName?: string
  familyName?: string
}

interface DeclarationOptions {
  registrationStatuses?: string
  dateOfEvent?: string
  dateOfEventStart?: string
  dateOfEventEnd?: string
  dateOfRegistration?: string
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventCountry?: string
  eventLocationId?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  childFirstNames?: string
  childLastName?: string
  childDoB?: string
  childDoBStart?: string
  childDoBEnd?: string
  childGender?: string
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: string
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: string
  motherDoBStart?: string
  motherDoBEnd?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: string
  fatherDoBStart?: string
  fatherDoBEnd?: string
  informantType?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: string
  informantDoBStart?: string
  informantDoBEnd?: string
}

type UserType = 'fieldWorker' | 'registrar' | 'sysAdmin' | 'nsysAdmin'

/* eslint-disable no-unused-vars */
declare namespace Cypress {
  interface Chainable {
    login: (userType: UserType) => void
    logout: () => void
    selectOption: (selector: string, text: string, option: string) => void
    createPin: () => void
    reviewForm: () => void
    clickUserListItemByName: (name: string, actionText: string) => void
    registerForm: () => void
    submitDeclaration: (incomplete?: boolean) => void
    createBirthRegistrationAs: (
      role: UserType,
      options?: BirthDeclarationOptions
    ) => void
    waitForOutboxToClear: () => void
    rejectDeclaration: () => void
    registerDeclaration: () => void
    goToVitalEventSelection: () => void
    downloadFirstDeclaration: () => void
    enterBirthMaximumInput: (options?: DeclarationOptions) => void
    enterBirthMinimumInput: (options?: DeclarationOptions) => void
    enterDeathMaximumInput: (options?: DeclarationOptions) => void
    enterDeathMinimumInput: (options?: DeclarationOptions) => void
    someoneElseJourney: () => void
    getReduxStore: () => Cypress.Chainable<{
      getState: () => any
      dispatch: (action: any) => void
    }>
  }
}
/* eslint-enable no-unused-vars */
