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

declare namespace Cypress {
  interface Chainable {
    login: (userType: string) => void
    logout: () => void
    selectOption: (selector: string, text: string, option: string) => void
    selectLocation: (selector: string, text: string) => void
    goToNextFormSection: () => void
    createPin: () => void
    reviewForm: () => void
    clickUserListItemByName: (name: string, actionText: string) => void
    submitForm: () => void
    submitDeclaration: (type?: 'birth' | 'death') => void
    createBirthRegistrationAs: (
      role: string,
      options?: BirthDeclarationOptions
    ) => void
    printDeclaration: () => void
    rejectDeclaration: () => void
    registerDeclaration: () => void
    verifyLandingPageVisible: () => void
    downloadFirstDeclaration: () => void
    enterMaximumInput: (options?: DeclarationOptions) => void
    enterDeathMaximumInput: (options?: DeclarationOptions) => void
    registerDeclarationWithMinimumInput: (
      firstName: string,
      lastName: string
    ) => void
    registerDeclarationWithMaximumInput: (
      firstName: string,
      lastName: string
    ) => void
    declareDeclarationWithMinimumInput: () => void
    declareDeclarationWithMaximumInput: (
      firstName: string,
      lastName: string
    ) => void
    declareDeathDeclarationWithMinimumInput: (
      options?: DeclarationOptions
    ) => void
    registerDeathDeclarationWithMinimumInput: () => void
    declareDeathDeclarationWithMaximumInput: (
      options?: DeclarationOptions
    ) => void
    registerDeathDeclarationWithMaximumInput: () => void
    someoneElseJourney: () => void
  }
}
