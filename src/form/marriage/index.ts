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

import {
  exactDateOfBirthUnknown,
  getAgeOfIndividualInYears,
  registrationEmail,
  registrationPhone,
  divider
} from '../common/common-optional-fields'
import {
  getBirthDate,
  getFamilyNameField,
  getFirstNameField,
  getNationality,
  otherInformantType
} from '../common/common-required-fields'
import {
  formMessageDescriptors,
  informantMessageDescriptors
} from '../common/messages'
import {
  getMarriedLastName,
  getTypeOfMarriage,
  placeOfMarriageSubsection
} from './optional-fields'
import {
  getMarriageDate,
  getRelationshipToSpousesForWitness,
  marriageInformantType,
  witnessRelationshipForOthers
} from './required-fields'
import { Event, ISerializedForm } from '../types/types'
import {
  ageOfIndividualValidators,
  brideOrGroomAgeValidators,
  exactDateOfBirthUnknownConditional
} from '../common/default-validation-conditionals'
import {
  hideIfInformantBrideOrGroom,
  brideOrGroomBirthDateValidators
} from '../common/default-validation-conditionals'
import { documentsSection, registrationSection } from './required-sections'
import {
  brideNameInEnglish,
  groomNameInEnglish,
  informantNameInEnglish,
  witnessOneNameInEnglish,
  witnessTwoNameInEnglish
} from '../common/preview-groups'
import { certificateHandlebars } from './certificate-handlebars'
import { getCommonSectionMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { getIDNumberFields, getIDType } from '../custom-fields'

// import { createCustomFieldExample } from '../custom-fields'

// ======================= FORM CONFIGURATION =======================

// A REGISTRATION FORM IS MADE UP OF PAGES OR "SECTIONS"

// A "SECTION" CAN BE SPLIT OVER MULTIPLE SUB-PAGES USING "GROUPS"

// GROUPS CONTAIN A FIELDS ARRAY AND EACH FIELD IS RENDERED BY A FORM FIELD FUNCTION

// MOVE FORM FIELD FUNCTIONS UP AND DOWN TO CHANGE THE VERTICAL ORDER OF FIELDS

// IN EACH GROUP, REQUIRED FIELDS MUST BE INCLUDED AS-IS FOR OPENCRVS TO FUNCTION

// OPTIONAL FIELDS CAN BE COMMENTED OUT OR REMOVED IF NOT REQUIRED

// DUPLICATE & FOLLOW THE INSTRUCTIONS IN THE createCustomFieldExample FUNCTION WHEN REQUIRED FOR ADDING NEW CUSTOM FIELDS

export const marriageForm: ISerializedForm = {
  sections: [
    registrationSection, // REQUIRED HIDDEN SECTION CONTAINING IDENTIFIERS
    {
      id: 'informant',
      viewType: 'form',
      name: formMessageDescriptors.registrationName,
      title: formMessageDescriptors.informantTitle,
      groups: [
        {
          id: 'who-is-applying-view-group',
          title: informantMessageDescriptors.marriageInformantTitle,
          conditionals: [],
          fields: [
            marriageInformantType,
            otherInformantType(Event.Marriage), // Required field
            getFirstNameField(
              'informantNameInEnglish',
              hideIfInformantBrideOrGroom,
              certificateHandlebars.informantFirstName
            ), // Required field
            getFamilyNameField(
              'informantNameInEnglish',
              hideIfInformantBrideOrGroom,
              certificateHandlebars.informantFamilyName
            ), // Required field
            getBirthDate(
              'informantBirthDate',
              hideIfInformantBrideOrGroom.concat([
                {
                  action: 'hide',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ]),
              [
                {
                  operation: 'dateFormatIsCorrect',
                  parameters: []
                },
                {
                  operation: 'dateInPast',
                  parameters: []
                }
              ],
              certificateHandlebars.informantBirthDate
            ), // Required field
            exactDateOfBirthUnknown(hideIfInformantBrideOrGroom),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional.concat(
                hideIfInformantBrideOrGroom
              ),
              ageOfIndividualValidators
            ),
            getNationality(
              certificateHandlebars.informantNationality,
              hideIfInformantBrideOrGroom
            ), // Required field
            getIDType(
              'marriage',
              'informant',
              hideIfInformantBrideOrGroom,
              true
            ),
            ...getIDNumberFields(
              'informant',
              hideIfInformantBrideOrGroom,
              true
            ),
            // ADDRESS FIELDS WILL RENDER HERE
            registrationPhone,
            registrationEmail
          ],
          previewGroups: [informantNameInEnglish]
        }
      ],
      mapping: getCommonSectionMapping('informant')
    },
    {
      id: 'groom',
      viewType: 'form',
      name: formMessageDescriptors.groomName,
      title: formMessageDescriptors.groomTitle,
      groups: [
        {
          id: 'groom-view-group',
          fields: [
            getFirstNameField(
              'groomNameInEnglish',
              [],
              certificateHandlebars.groomFirstName
            ), // Required field
            getFamilyNameField(
              'groomNameInEnglish',
              [],
              certificateHandlebars.groomFamilyName
            ), // Required field
            // ADDRESS FIELDS WILL RENDER HERE
            getBirthDate(
              'groomBirthDate',
              [
                {
                  action: 'hide',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
              brideOrGroomBirthDateValidators('groom'),
              certificateHandlebars.groomBirthDate
            ), // Required field
            exactDateOfBirthUnknown([]),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfGroom,
              exactDateOfBirthUnknownConditional,
              brideOrGroomAgeValidators
            ),
            getNationality(certificateHandlebars.groomNationality, []), // Required field
            getIDType('marriage', 'groom', [], true),
            ...getIDNumberFields('groom', [], true),
            getMarriedLastName(certificateHandlebars.groomMarriedLastNameEng)
          ],
          previewGroups: [groomNameInEnglish]
        }
      ]
    },
    {
      id: 'bride',
      viewType: 'form',
      name: formMessageDescriptors.brideName,
      title: formMessageDescriptors.brideTitle,
      groups: [
        {
          id: 'bride-view-group',
          fields: [
            getFirstNameField(
              'brideNameInEnglish',
              [],
              certificateHandlebars.brideFirstName
            ), // Required field
            getFamilyNameField(
              'brideNameInEnglish',
              [],
              certificateHandlebars.brideFamilyName
            ), // Required field
            // ADDRESS FIELDS WILL RENDER HERE
            getBirthDate(
              'brideBirthDate',
              [
                {
                  action: 'hide',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
              brideOrGroomBirthDateValidators('bride'),
              certificateHandlebars.brideBirthDate
            ), // Required field
            exactDateOfBirthUnknown([]),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfBride,
              exactDateOfBirthUnknownConditional,
              brideOrGroomAgeValidators
            ),
            getNationality(certificateHandlebars.brideNationality, []), // Required field
            getIDType('marriage', 'bride', [], true),
            ...getIDNumberFields('bride', [], true),
            getMarriedLastName(certificateHandlebars.brideMarriedLastNameEng)
          ],
          previewGroups: [brideNameInEnglish]
        }
      ]
    },
    {
      id: 'marriageEvent',
      viewType: 'form',
      name: formMessageDescriptors.marriageEventName,
      title: formMessageDescriptors.marriageEventTitle,
      groups: [
        {
          id: 'marriage-event-details',
          fields: [
            getMarriageDate, // Required field
            getTypeOfMarriage,
            placeOfMarriageSubsection,
            divider('place-of-marriage-seperator')
            // PLACE OF MARRIAGE FIELDS WILL RENDER HERE
          ]
        }
      ]
    },
    {
      id: 'witnessOne',
      viewType: 'form',
      name: formMessageDescriptors.witnessName,
      title: formMessageDescriptors.witnessOneTitle,
      groups: [
        {
          id: 'witness-view-group',
          fields: [
            getFirstNameField(
              'witnessOneNameInEnglish',
              [],
              certificateHandlebars.witnessOneFirstName
            ), // Required field
            getFamilyNameField(
              'witnessOneNameInEnglish',
              [],
              certificateHandlebars.witnessOneFamilyName
            ), // Required field
            getRelationshipToSpousesForWitness, // Required field
            witnessRelationshipForOthers // Required field
          ],
          previewGroups: [witnessOneNameInEnglish]
        }
      ],
      mapping: getCommonSectionMapping('informant')
    },
    {
      id: 'witnessTwo',
      viewType: 'form',
      name: formMessageDescriptors.witnessName,
      title: formMessageDescriptors.witnessTwoTitle,
      groups: [
        {
          id: 'witness-view-group',
          fields: [
            getFirstNameField(
              'witnessTwoNameInEnglish',
              [],
              certificateHandlebars.witnessTwoFirstName
            ), // Required field
            getFamilyNameField(
              'witnessTwoNameInEnglish',
              [],
              certificateHandlebars.witnessTwoFamilyName
            ), // Required field
            getRelationshipToSpousesForWitness, // Required field
            witnessRelationshipForOthers // Required field
          ],
          previewGroups: [witnessTwoNameInEnglish]
        }
      ],
      mapping: getCommonSectionMapping('informant')
    },
    documentsSection
  ]
}
