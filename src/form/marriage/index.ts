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

import {
  exactDateOfBirthUnknown,
  getAgeOfIndividualInYears,
  registrationEmail,
  registrationPhone,
  divider,
  getNationalID
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
  exactDateOfBirthUnknownConditional,
  getNationalIDValidators
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

// ======================= FORM CONFIGURATION =======================

// A REGISTRATION FORM IS MADE UP OF PAGES OR "SECTIONS"

// A "SECTION" CAN BE SPLIT OVER MULTIPLE PAGES USING "GROUPS" ALTHOUGH THIS MAY BE DEPRECATED

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
          showExitButtonOnly: true,
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
              hideIfInformantBrideOrGroom,
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
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional.concat(
                hideIfInformantBrideOrGroom
              )
            ),
            getNationality(
              certificateHandlebars.informantNationality,
              hideIfInformantBrideOrGroom
            ), // Required field
            getNationalID(
              'informantID',
              hideIfInformantBrideOrGroom,
              getNationalIDValidators('informant'),
              certificateHandlebars.informantNID
            ),
            registrationPhone,
            registrationEmail
          ],
          previewGroups: [informantNameInEnglish]
        }
      ],
      mapping: {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
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
            getBirthDate(
              'groomBirthDate',
              [],
              brideOrGroomBirthDateValidators('groom'),
              certificateHandlebars.groomBirthDate
            ), // Required field
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfGroom,
              exactDateOfBirthUnknownConditional
            ),
            getNationality(certificateHandlebars.groomNationality, []), // Required field
            getNationalID(
              'iD',
              [],
              getNationalIDValidators('groom'),
              certificateHandlebars.groomNID
            ),
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
            getBirthDate(
              'brideBirthDate',
              [],
              brideOrGroomBirthDateValidators('bride'),
              certificateHandlebars.brideBirthDate
            ), // Required field
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(formMessageDescriptors.ageOfBride, [
              {
                action: 'hide',
                expression: '!values.exactDateOfBirthUnknown'
              }
            ]),
            getNationality(certificateHandlebars.brideNationality, []), // Required field
            getNationalID(
              'iD',
              [],
              getNationalIDValidators('bride'),
              certificateHandlebars.brideNID
            ),
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
      mapping: {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
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
      mapping: {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
    },
    documentsSection
  ]
}
