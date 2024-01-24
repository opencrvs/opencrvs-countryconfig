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
  registrarName: 'registrarName', // @deprecated use registrar.name instead
  role: 'role', // @deprecated use registrar.role instead
  registrarSignature: 'registrarSignature', // @deprecated use registrar.signature instead
  registrationDate: 'registrationDate',
  registrationLocation: 'registrationLocation', // @deprecated use registrar.office/state/district instead
  contactEmail: 'contactEmail',
  contactPhoneNumber: 'contactPhoneNumber',
  eventDate: 'eventDate',
  informantType: 'informantType',
  informantFirstName: 'informantFirstName',
  informantFamilyName: 'informantFamilyName',
  informantBirthDate: 'informantBirthDate',
  informantNationality: 'informantNationality',
  informantNID: 'informantNID',
  countryPrimaryInformant: 'countryPrimaryInformant',
  statePrimaryInformant: 'statePrimaryInformant', // @deprecated use statePrimaryInformantId instead
  statePrimaryInformantId: 'statePrimaryInformantId',
  districtPrimaryInformant: 'districtPrimaryInformant', // @deprecated use districtPrimaryInformantId instead
  districtPrimaryInformantId: 'districtPrimaryInformantId',
  cityPrimaryInformant: 'cityPrimaryInformant',
  addressLine3PrimaryInformant: 'addressLine3PrimaryInformant',
  addressLine2PrimaryInformant: 'addressLine2PrimaryInformant',
  addressLine1PrimaryInformant: 'addressLine1PrimaryInformant',
  postalCodePrimaryInformant: 'postalCodePrimaryInformant',
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
  groomSignature: 'groomSignature',
  brideSignature: 'brideSignature',
  witnessOneSignature: 'witnessOneSignature',
  witnessTwoSignature: 'witnessTwoSignature',
  groomFirstName: 'groomFirstName',
  groomFamilyName: 'groomFamilyName',
  groomBirthDate: 'groomBirthDate',
  groomNationality: 'groomNationality',
  groomNID: 'groomNID',
  groomMarriedLastNameEng: 'groomMarriedLastNameEng',
  countryPrimaryGroom: 'countryPrimaryGroom',
  statePrimaryGroom: 'statePrimaryGroom', // @deprecated use statePrimaryGroomId instead
  statePrimaryGroomId: 'statePrimaryGroomId',
  districtPrimaryGroom: 'districtPrimaryGroom', // @deprecated use districtPrimaryGroomId instead
  districtPrimaryGroomId: 'districtPrimaryGroomId',
  cityPrimaryGroom: 'cityPrimaryGroom',
  addressLine3PrimaryGroom: 'addressLine3PrimaryGroom',
  addressLine2PrimaryGroom: 'addressLine2PrimaryGroom',
  addressLine1PrimaryGroom: 'addressLine1PrimaryGroom',
  postalCodePrimaryGroom: 'postalCodePrimaryGroom',
  internationalStatePrimaryGroom: 'internationalStatePrimaryGroom',
  internationalDistrictPrimaryGroom: 'internationalDistrictPrimaryGroom',
  internationalCityPrimaryGroom: 'internationalCityPrimaryGroom',
  internationalAddressLine1PrimaryGroom:
    'internationalAddressLine1PrimaryGroom',
  internationalAddressLine2PrimaryGroom:
    'internationalAddressLine2PrimaryGroom',
  internationalAddressLine3PrimaryGroom:
    'internationalAddressLine3PrimaryGroom',
  internationalPostalCodePrimaryGroom: 'internationalPostalCodePrimaryGroom',
  brideFirstName: 'brideFirstName',
  brideFamilyName: 'brideFamilyName',
  brideBirthDate: 'brideBirthDate',
  brideNationality: 'brideNationality',
  brideNID: 'brideNID',
  brideMarriedLastNameEng: 'brideMarriedLastNameEng',
  countryPrimaryBride: 'countryPrimaryBride',
  statePrimaryBride: 'statePrimaryBride', // @deprecated use statePrimaryBrideId instead
  statePrimaryBrideId: 'statePrimaryBrideId',
  districtPrimaryBride: 'districtPrimaryBride', // @deprecated use districtPrimaryBrideId instead
  districtPrimaryBrideId: 'districtPrimaryBrideId',
  cityPrimaryBride: 'cityPrimaryBride',
  addressLine3PrimaryBride: 'addressLine3PrimaryBride',
  addressLine2PrimaryBride: 'addressLine2PrimaryBride',
  addressLine1PrimaryBride: 'addressLine1PrimaryBride',
  postalCodePrimaryBride: 'postalCodePrimaryBride',
  internationalStatePrimaryBride: 'internationalStatePrimaryBride',
  internationalDistrictPrimaryBride: 'internationalDistrictPrimaryBride',
  internationalCityPrimaryBride: 'internationalCityPrimaryBride',
  internationalAddressLine1PrimaryBride:
    'internationalAddressLine1PrimaryBride',
  internationalAddressLine2PrimaryBride:
    'internationalAddressLine2PrimaryBride',
  internationalAddressLine3PrimaryBride:
    'internationalAddressLine3PrimaryBride',
  internationalPostalCodePrimaryBride: 'internationalPostalCodePrimaryBride',
  typeOfMarriage: 'typeOfMarriage',
  countryPlaceofmarriage: 'countryPlaceofmarriage',
  statePlaceofmarriage: 'statePlaceofmarriage', // @deprecated use statePlaceofmarriageId instead
  statePlaceofmarriageId: 'statePlaceofmarriageId',
  districtPlaceofmarriage: 'districtPlaceofmarriage', // @deprecated use districtPlaceofmarriageId instead
  districtPlaceofmarriageId: 'districtPlaceofmarriageId',
  cityPlaceofmarriage: 'cityPlaceofmarriage',
  addressLine3Placeofmarriage: 'addressLine3Placeofmarriage',
  addressLine2Placeofmarriage: 'addressLine2Placeofmarriage',
  addressLine1Placeofmarriage: 'addressLine1Placeofmarriage',
  postalCodePlaceofmarriage: 'postalCodePlaceofmarriage',
  internationalStatePlaceofmarriage: 'internationalStatePlaceofmarriage',
  internationalDistrictPlaceofmarriage: 'internationalDistrictPlaceofmarriage',
  internationalCityPlaceofmarriage: 'internationalCityPlaceofmarriage',
  internationalAddressLine1Placeofmarriage:
    'internationalAddressLine1Placeofmarriage',
  internationalAddressLine2Placeofmarriage:
    'internationalAddressLine2Placeofmarriage',
  internationalAddressLine3Placeofmarriage:
    'internationalAddressLine3Placeofmarriage',
  internationalPostalCodePlaceofmarriage:
    'internationalPostalCodePlaceofmarriage',
  witnessOneFirstName: 'witnessOneFirstName',
  witnessOneFamilyName: 'witnessOneFamilyName',
  witnessTwoFirstName: 'witnessTwoFirstName',
  witnessTwoFamilyName: 'witnessTwoFamilyName'
}
