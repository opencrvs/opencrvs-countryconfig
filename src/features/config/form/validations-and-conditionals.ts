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

// TODO: add in all the validations and conditionals logic and generate a js file client can load

import { MessageDescriptor } from 'react-intl'
import { IFormData, IFormFieldValue } from './types'

export interface IConditional {
  description?: string
  action: string
  expression: string
}

export interface IConditionals {
  informantType: IConditional
  iDType: IConditional
  isOfficePreSelected: IConditional
  fathersDetailsExist: IConditional
  primaryAddressSameAsOtherPrimary: IConditional
  countryPrimary: IConditional
  statePrimary: IConditional
  districtPrimary: IConditional
  addressLine4Primary: IConditional
  addressLine3Primary: IConditional
  country: IConditional
  state: IConditional
  district: IConditional
  addressLine4: IConditional
  addressLine3: IConditional
  uploadDocForWhom: IConditional
  motherCollectsCertificate: IConditional
  fatherCollectsCertificate: IConditional
  informantCollectsCertificate: IConditional
  otherPersonCollectsCertificate: IConditional
  birthCertificateCollectorNotVerified: IConditional
  deathCertificateCollectorNotVerified: IConditional
  placeOfBirthHospital: IConditional
  placeOfDeathTypeHeathInstitue: IConditional
  otherBirthEventLocation: IConditional
  isNotCityLocation: IConditional
  isCityLocation: IConditional
  isDefaultCountry: IConditional
  isNotCityLocationPrimary: IConditional
  isDefaultCountryPrimary: IConditional
  isCityLocationPrimary: IConditional
  informantPrimaryAddressSameAsCurrent: IConditional
  iDAvailable: IConditional
  deathPlaceOther: IConditional
  deathPlaceAtPrivateHome: IConditional
  deathPlaceAtOtherLocation: IConditional
  causeOfDeathEstablished: IConditional
  isMarried: IConditional
  identifierIDSelected: IConditional
  fatherContactDetailsRequired: IConditional
  withInTargetDays: IConditional
  between46daysTo5yrs: IConditional
  after5yrs: IConditional
  deceasedNationIdSelected: IConditional
  isRegistrarRoleSelected: IConditional
  certCollectorOther: IConditional
  userAuditReasonSpecified: IConditional
  userAuditReasonOther: IConditional
  isAuditActionDeactivate: IConditional
  isAuditActionReactivate: IConditional
}
export interface IValidationResult {
  message: MessageDescriptor
  props?: { [key: string]: any }
}

export type RangeValidation = (
  min: number,
  max: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type MaxLengthValidation = (
  customisation: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type Validation = (
  value: IFormFieldValue,
  drafts?: IFormData,
  offlineCountryConfig?: any
) => IValidationResult | undefined

export type ValidationInitializer = (...value: any[]) => Validation
