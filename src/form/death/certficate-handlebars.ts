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
  deceasedFirstName: 'deceasedFirstName',
  deceasedFamilyName: 'deceasedFamilyName',
  deceasedGender: 'deceasedGender',
  deceasedBirthDate: 'deceasedBirthDate',
  deceasedNationality: 'deceasedNationality',
  deceasedNID: 'deceasedNID',
  deceasedMaritalStatus: 'deceasedMaritalStatus',
  countryPrimaryDeceased: 'countryPrimaryDeceased',
  statePrimaryDeceased: 'statePrimaryDeceased', // @deprecated use statePrimaryDeceasedId instead
  statePrimaryDeceasedId: 'statePrimaryDeceasedId',
  districtPrimaryDeceased: 'districtPrimaryDeceased', // @deprecated use districtPrimaryDeceasedId instead
  districtPrimaryDeceasedId: 'districtPrimaryDeceasedId',
  cityPrimaryDeceased: 'cityPrimaryDeceased',
  ageOfDeceasedInYears: 'ageOfDeceasedInYears',
  addressLine3UrbanOptionPrimaryDeceased:
    'addressLine3UrbanOptionPrimaryDeceased',
  addressLine2UrbanOptionPrimaryDeceased:
    'addressLine2UrbanOptionPrimaryDeceased',
  addressLine1UrbanOptionPrimaryDeceased:
    'addressLine1UrbanOptionPrimaryDeceased',
  postalCodePrimaryDeceased: 'postalCodePrimaryDeceased',
  addressLine1RuralOptionPrimaryDeceased:
    'addressLine1RuralOptionPrimaryDeceased',
  internationalStatePrimaryDeceased: 'internationalStatePrimaryDeceased',
  internationalDistrictPrimaryDeceased: 'internationalDistrictPrimaryDeceased',
  internationalCityPrimaryDeceased: 'internationalCityPrimaryDeceased',
  internationalAddressLine1PrimaryDeceased:
    'internationalAddressLine1PrimaryDeceased',
  internationalAddressLine2PrimaryDeceased:
    'internationalAddressLine2PrimaryDeceased',
  internationalAddressLine3PrimaryDeceased:
    'internationalAddressLine3PrimaryDeceased',
  internationalPostalCodePrimaryDeceased:
    'internationalPostalCodePrimaryDeceased',
  mannerOfDeath: 'mannerOfDeath',
  causeOfDeathEstablished: 'causeOfDeathEstablished',
  causeOfDeathMethod: 'causeOfDeathMethod',
  deathDescription: 'deathDescription',
  placeOfDeath: 'placeOfDeath', // equal to either the name of a HEALTH_FACILITY or undefined
  placeOfDeathCountry: 'placeOfDeathCountry', // used where event occurs in a HEALTH_FACILITY
  placeOfDeathDistrict: 'placeOfDeathDistrict', // used where event occurs in a HEALTH_FACILITY
  placeOfDeathFacility: 'placeOfDeathFacility', // used where event occurs in a HEALTH_FACILITY
  placeOfDeathState: 'placeOfDeathState', // used where event occurs in a HEALTH_FACILITY
  countryPlaceofdeath: 'countryPlaceofdeath', // THE FOLLOWING are used where event occurs in a PRIVATE_HOME or OTHER therefore placeOfBirth is undefined
  statePlaceofdeath: 'statePlaceofdeath', // @deprecated use statePlaceofdeathId instead
  statePlaceofdeathId: 'statePlaceofdeathId',
  districtPlaceofdeath: 'districtPlaceofdeath', // @deprecated use districtPlaceofdeathId instead
  districtPlaceofdeathId: 'districtPlaceofdeathId',
  cityPlaceofdeath: 'cityPlaceofdeath',
  addressLine3UrbanOptionPlaceofdeath: 'addressLine3UrbanOptionPlaceofdeath',
  addressLine2UrbanOptionPlaceofdeath: 'addressLine2UrbanOptionPlaceofdeath',
  addressLine1UrbanOptionPlaceofdeath: 'addressLine1UrbanOptionPlaceofdeath',
  postalCodePlaceofdeath: 'postalCodePlaceofdeath',
  addressLine1RuralOptionPlaceofdeath: 'addressLine1RuralOptionPlaceofdeath',
  internationalStatePlaceofdeath: 'internationalStatePlaceofdeath',
  internationalDistrictPlaceofdeath: 'internationalDistrictPlaceofdeath',
  internationalCityPlaceofdeath: 'internationalCityPlaceofdeath',
  internationalAddressLine1Placeofdeath:
    'internationalAddressLine1Placeofdeath',
  internationalAddressLine2Placeofdeath:
    'internationalAddressLine2Placeofdeath',
  internationalAddressLine3Placeofdeath:
    'internationalAddressLine3Placeofdeath',
  internationalPostalCodePlaceofdeath: 'internationalPostalCodePlaceofdeath',
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
  spouseFirstName: 'spouseFirstName',
  spouseFamilyName: 'spouseFamilyName',
  spouseReasonNotApplying: 'spouseReasonNotApplying',
  spouseBirthDate: 'spouseBirthDate',
  spouseNationality: 'spouseNationality',
  spouseNID: 'spouseNID',
  spouseOccupation: 'spouseOccupation',
  spouseEducationalAttainment: 'spouseEducationalAttainment',
  countryPrimarySpouse: 'countryPrimarySpouse',
  statePrimarySpouse: 'statePrimarySpouse', // @deprecated use statePrimarySpouseId instead
  statePrimarySpouseId: 'statePrimarySpouseId',
  districtPrimarySpouse: 'districtPrimarySpouse', // @deprecated use districtPrimarySpouseId instead
  districtPrimarySpouseId: 'districtPrimarySpouseId',
  cityPrimarySpouse: 'cityPrimarySpouse',
  addressLine3UrbanOptionPrimarySpouse: 'addressLine3UrbanOptionPrimarySpouse',
  addressLine2UrbanOptionPrimarySpouse: 'addressLine2UrbanOptionPrimarySpouse',
  addressLine1UrbanOptionPrimarySpouse: 'addressLine1UrbanOptionPrimarySpouse',
  postalCodePrimarySpouse: 'postalCodePrimarySpouse',
  addressLine1RuralOptionPrimarySpouse: 'addressLine1RuralOptionPrimarySpouse',
  internationalStatePrimarySpouse: 'internationalStatePrimarySpouse',
  internationalDistrictPrimarySpouse: 'internationalDistrictPrimarySpouse',
  internationalCityPrimarySpouse: 'internationalCityPrimarySpouse',
  internationalAddressLine1PrimarySpouse:
    'internationalAddressLine1PrimarySpouse',
  internationalAddressLine2PrimarySpouse:
    'internationalAddressLine2PrimarySpouse',
  internationalAddressLine3PrimarySpouse:
    'internationalAddressLine3PrimarySpouse',
  internationalPostalCodePrimarySpouse: 'internationalPostalCodePrimarySpouse',
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
  countryPrimaryMother: 'countryPrimaryMother',
  statePrimaryMother: 'statePrimaryMother', // @deprecated use statePrimaryMotherId instead
  statePrimaryMotherId: 'statePrimaryMotherId',
  districtPrimaryMother: 'districtPrimaryMother', // @deprecated use districtPrimaryMotherId instead
  districtPrimaryMotherId: 'districtPrimaryMotherId',
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
  statePrimaryFather: 'statePrimaryFather', // @deprecated use statePrimaryFatherId instead
  statePrimaryFatherId: 'statePrimaryFatherId',
  districtPrimaryFather: 'districtPrimaryFather', // @deprecated use districtPrimaryFatherId instead
  districtPrimaryFatherId: 'districtPrimaryFatherId',
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
