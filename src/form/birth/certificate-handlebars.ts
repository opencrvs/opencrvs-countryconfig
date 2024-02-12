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

// THE FOLLOWING HANDLEBARS CAN BE USED IN THE SVG CODE IN THE CERTIFICATE FOR THIS EVENT

export const certificateHandlebars = {
  registrationNumber: 'registrationNumber',
  qrCode: 'qrCode',
  certificateDate: 'certificateDate',
  registrar: 'registrar',
  registrationAgent: 'registrationAgent',
  registrarName: 'registrarName',
  role: 'role',
  registrarSignature: 'registrarSignature',
  registrationDate: 'registrationDate',
  registrationLocation: 'registrationLocation',
  contactEmail: 'contactEmail',
  contactPhoneNumber: 'contactPhoneNumber',
  mosipAid: 'mosipAid',
  mosipAIDLabel: 'mosipAIDLabel',
  birthConfigurableIdentifier1: 'birthConfigurableIdentifier1',
  birthConfigurableIdentifier2: 'birthConfigurableIdentifier2',
  birthConfigurableIdentifier3: 'birthConfigurableIdentifier3',
  placeOfBirth: 'placeOfBirth',
  informantType: 'informantType',
  attendantAtBirth: 'attendantAtBirth',
  multipleBirth: 'multipleBirth',
  weightAtBirth: 'weightAtBirth',
  birthType: 'birthType',
  childFirstName: 'childFirstName',
  childFamilyName: 'childFamilyName',
  childGender: 'childGender',
  eventDate: 'eventDate',
  informantFirstName: 'informantFirstName',
  informantFamilyName: 'informantFamilyName',
  informantBirthDate: 'informantBirthDate',
  informantNationality: 'informantNationality',
  informantNID: 'informantNID',
  motherReasonNotApplying: 'motherReasonNotApplying',
  motherBirthDate: 'motherBirthDate',
  motherFirstName: 'motherFirstName',
  motherFamilyName: 'motherFamilyName',
  motherNationality: 'motherNationality',
  motherNID: 'motherNID',
  motherMaritalStatus: 'motherMaritalStatus',
  motherOccupation: 'motherOccupation',
  motherEducationalAttainment: 'motherEducationalAttainment',
  fatherBirthDate: 'fatherBirthDate',
  fatherFirstName: 'fatherFirstName',
  fatherFamilyName: 'fatherFamilyName',
  fatherNationality: 'fatherNationality',
  fatherNID: 'fatherNID',
  fatherMaritalStatus: 'fatherMaritalStatus',
  fatherOccupation: 'fatherOccupation',
  fatherEducationalAttainment: 'fatherEducationalAttainment',
  countryPlaceofbirth: 'countryPlaceofbirth',
  statePlaceofbirth: 'statePlaceofbirth',
  districtPlaceofbirth: 'districtPlaceofbirth',
  cityPlaceofbirth: 'cityPlaceofbirth',
  addressLine3UrbanOptionPlaceofbirth: 'addressLine3UrbanOptionPlaceofbirth',
  addressLine2UrbanOptionPlaceofbirth: 'addressLine2UrbanOptionPlaceofbirth',
  addressLine1UrbanOptionPlaceofbirth: 'addressLine1UrbanOptionPlaceofbirth',
  postalCodePlaceofbirth: 'postalCodePlaceofbirth',
  addressLine1RuralOptionPlaceofbirth: 'addressLine1RuralOptionPlaceofbirth',
  internationalStatePlaceofbirth: 'internationalStatePlaceofbirth',
  internationalDistrictPlaceofbirth: 'internationalDistrictPlaceofbirth',
  internationalCityPlaceofbirth: 'internationalCityPlaceofbirth',
  internationalAddressLine1Placeofbirth:
    'internationalAddressLine1Placeofbirth',
  internationalAddressLine2Placeofbirth:
    'internationalAddressLine2Placeofbirth',
  internationalAddressLine3Placeofbirth:
    'internationalAddressLine3Placeofbirth',
  internationalPostalCodePlaceofbirth: 'internationalPostalCodePlaceofbirth',
  countryPrimaryInformant: 'countryPrimaryInformant',
  statePrimaryInformant: 'statePrimaryInformant',
  districtPrimaryInformant: 'districtPrimaryInformant',
  cityPrimaryInformant: 'cityPrimaryInformant',
  addressLine3UrbanOptionPrimaryInformant:
    'addressLine3UrbanOptionPrimaryInformant',
  addressLine2UrbanOptionPrimaryInformant:
    'addressLine2UrbanOptionPrimaryInformant',
  addressLine1UrbanOptionPrimaryInformant:
    'addressLine1UrbanOptionPrimaryInformant',
  postalCodePrimaryInformant: 'postalCodePrimaryInformant',
  addressLine1RuralOptionPrimaryInformant:
    'addressLine1RuralOptionPrimaryInformant',
  internationalStatePrimaryInformant: 'internationalStatePrimaryInformant',
  internationalDistrictPrimaryInformant:
    'internationalDistrictPrimaryInformant',
  internationalCityPrimaryInformant: 'internationalCityPrimaryInformant',
  internationalAddressLine1PrimaryInformant:
    'internationalAddressLine1PrimaryInformant',
  internationalAddressLine2PrimaryInformant:
    'internationalAddressLine2PrimaryInformant',
  internationalAddressLine3PrimaryInformant:
    'internationalAddressLine3PrimaryInformant',
  internationalPostalCodePrimaryInformant:
    'internationalPostalCodePrimaryInformant',
  countryPrimaryMother: 'countryPrimaryMother',
  statePrimaryMother: 'statePrimaryMother',
  districtPrimaryMother: 'districtPrimaryMother',
  cityPrimaryMother: 'cityPrimaryMother',
  addressLine3UrbanOptionPrimaryMother: 'addressLine3UrbanOptionPrimaryMother',
  addressLine2UrbanOptionPrimaryMother: 'addressLine2UrbanOptionPrimaryMother',
  addressLine1UrbanOptionPrimaryMother: 'addressLine1UrbanOptionPrimaryMother',
  postalCodePrimaryMother: 'postalCodePrimaryMother',
  addressLine1RuralOptionPrimaryMother: 'addressLine1RuralOptionPrimaryMother',
  internationalStatePrimaryMother: 'internationalStatePrimaryMother',
  internationalDistrictPrimaryMother: 'internationalDistrictPrimaryMother',
  internationalCityPrimaryMother: 'internationalCityPrimaryMother',
  internationalAddressLine1PrimaryMother:
    'internationalAddressLine1PrimaryMother',
  internationalAddressLine2PrimaryMother:
    'internationalAddressLine2PrimaryMother',
  internationalAddressLine3PrimaryMother:
    'internationalAddressLine3PrimaryMother',
  internationalPostalCodePrimaryMother: 'internationalPostalCodePrimaryMother',
  fatherReasonNotApplying: 'fatherReasonNotApplying',
  countryPrimaryFather: 'countryPrimaryFather',
  statePrimaryFather: 'statePrimaryFather',
  districtPrimaryFather: 'districtPrimaryFather',
  cityPrimaryFather: 'cityPrimaryFather',
  addressLine3UrbanOptionPrimaryFather: 'addressLine3UrbanOptionPrimaryFather',
  addressLine2UrbanOptionPrimaryFather: 'addressLine2UrbanOptionPrimaryFather',
  addressLine1UrbanOptionPrimaryFather: 'addressLine1UrbanOptionPrimaryFather',
  postalCodePrimaryFather: 'postalCodePrimaryFather',
  addressLine1RuralOptionPrimaryFather: 'addressLine1RuralOptionPrimaryFather',
  internationalStatePrimaryFather: 'internationalStatePrimaryFather',
  internationalDistrictPrimaryFather: 'internationalDistrictPrimaryFather',
  internationalCityPrimaryFather: 'internationalCityPrimaryFather',
  internationalAddressLine1PrimaryFather:
    'internationalAddressLine1PrimaryFather',
  internationalAddressLine2PrimaryFather:
    'internationalAddressLine2PrimaryFather',
  internationalAddressLine3PrimaryFather:
    'internationalAddressLine3PrimaryFather',
  internationalPostalCodePrimaryFather: 'internationalPostalCodePrimaryFather'
}
