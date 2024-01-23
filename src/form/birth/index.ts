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

import { Event, ISerializedForm } from '../types/types'
import { formMessageDescriptors } from '../common/messages'
import { informantType } from './required-fields'
import {
  getBirthDate,
  getGender,
  getFamilyNameField,
  getFirstNameField,
  getNationality,
  otherInformantType,
  getNationalID,
  getDetailsExist,
  getReasonNotExisting
} from '../common/common-required-fields'
import {
  exactDateOfBirthUnknown,
  getAgeOfIndividualInYears,
  getMaritalStatus,
  registrationEmail,
  registrationPhone,
  getEducation,
  getOccupation,
  divider
} from '../common/common-optional-fields'
import {
  attendantAtBirth,
  birthType,
  multipleBirth,
  weightAtBirth
} from './optional-fields'
import {
  childNameInEnglish,
  fatherNameInEnglish,
  informantNameInEnglish,
  motherNameInEnglish
} from '../common/preview-groups'
import {
  isValidChildBirthDate,
  hideIfInformantMotherOrFather,
  mothersDetailsExistConditionals,
  mothersBirthDateConditionals,
  parentsBirthDateValidators,
  detailsExist,
  motherFirstNameConditionals,
  motherFamilyNameConditionals,
  fathersDetailsExistConditionals,
  fathersBirthDateConditionals,
  fatherFirstNameConditionals,
  fatherFamilyNameConditionals,
  informantNotMotherOrFather,
  detailsExistConditional,
  ageOfIndividualConditionals,
  ageOfParentsConditionals
} from '../common/default-validation-conditionals'
import {
  getNationalIDValidators,
  informantFirstNameConditionals,
  informantFamilyNameConditionals,
  informantBirthDateConditionals,
  exactDateOfBirthUnknownConditional,
  hideIfNidIntegrationEnabled
} from '../common/default-validation-conditionals'
import { documentsSection, registrationSection } from './required-sections'
import { certificateHandlebars } from './certificate-handlebars'
import { getSectionMapping } from '@countryconfig/utils/mapping/section/birth/mapping-utils'
import { getCommonSectionMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
// import { createCustomFieldExample } from '../custom-fields'

// ======================= FORM CONFIGURATION =======================

// A REGISTRATION FORM IS MADE UP OF PAGES OR "SECTIONS"

// A "SECTION" CAN BE SPLIT OVER MULTIPLE SUB-PAGES USING "GROUPS"

// GROUPS CONTAIN A FIELDS ARRAY AND EACH FIELD IS RENDERED BY A FORM FIELD FUNCTION

// MOVE FORM FIELD FUNCTIONS UP AND DOWN TO CHANGE THE VERTICAL ORDER OF FIELDS

// IN EACH GROUP, REQUIRED FIELDS MUST BE INCLUDED AS-IS FOR OPENCRVS TO FUNCTION

// OPTIONAL FIELDS CAN BE COMMENTED OUT OR REMOVED IF NOT REQUIRED

// DUPLICATE & FOLLOW THE INSTRUCTIONS IN THE createCustomFieldExample FUNCTION WHEN REQUIRED FOR ADDING NEW CUSTOM FIELDS

export const birthForm: ISerializedForm = {
  sections: [
    registrationSection, // REQUIRED HIDDEN SECTION CONTAINING IDENTIFIERS
    {
      id: 'information',
      viewType: 'form',
      name: {
        defaultMessage: 'Information',
        description: 'Form section name for Information',
        id: 'form.section.information.name'
      },
      groups: [
        {
          id: 'information-group',
          title: {
            defaultMessage:
              'Introduce the birth registration process to the informant',
            description: 'Event information title for the birth',
            id: 'register.eventInfo.birth.title'
          },
          conditionals: [
            {
              action: 'hide',
              expression: 'window.config.HIDE_BIRTH_EVENT_REGISTER_INFORMATION'
            }
          ],
          fields: [
            {
              name: 'list',
              type: 'BULLET_LIST',
              items: [
                {
                  defaultMessage:
                    'I am going to help you make a declaration of birth.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet1'
                },
                {
                  defaultMessage:
                    'As the legal Informant it is important that all the information provided by you is accurate.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet2'
                },
                {
                  defaultMessage:
                    'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet3'
                },
                {
                  defaultMessage:
                    'Make sure you collect the certificate. A birth certificate is critical for this child, especially to make their life easy later on. It will help to access health services, school examinations and government benefits.',
                  description: 'Form information for birth',
                  id: 'form.section.information.birth.bullet4'
                }
              ],
              // this is to set the title of the page
              label: {
                id: 'register.eventInfo.birth.title'
              },
              initialValue: '',
              validator: []
            }
          ]
        }
      ]
    },
    {
      id: 'child',
      viewType: 'form',
      name: formMessageDescriptors.childTab,
      title: formMessageDescriptors.childTitle,
      mapping: getSectionMapping('child'), // These mappings support configurable identifiers in the event-registration API
      groups: [
        {
          id: 'child-view-group',
          fields: [
            // COMMENT IN AND DUPLICATE AS REQUIRED IN ORDER TO CREATE A CUSTOM FIELD: createCustomFieldExample(),
            // createCustomFieldExample(),
            getFirstNameField(
              'childNameInEnglish',
              [],
              certificateHandlebars.childFirstName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getFamilyNameField(
              'childNameInEnglish',
              [],
              certificateHandlebars.childFamilyName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getGender(certificateHandlebars.childGender), // Required field.
            getBirthDate(
              'childBirthDate',
              [],
              isValidChildBirthDate,
              certificateHandlebars.eventDate
            ), // Required field.
            // PLACE OF BIRTH FIELDS WILL RENDER HERE
            divider('place-of-birth-seperator'),
            attendantAtBirth,
            birthType,
            weightAtBirth
          ],
          previewGroups: [childNameInEnglish] // Preview groups are used to structure data nicely in Review Page UI
        }
      ]
    },
    {
      id: 'informant',
      viewType: 'form',
      name: {
        defaultMessage: 'Informant',
        description: 'Form section name for Informant',
        id: 'form.section.informant.name'
      },
      title: formMessageDescriptors.birthInformantTitle,
      groups: [
        {
          id: 'informant-view-group',
          fields: [
            informantType, // Required field.
            otherInformantType(Event.Birth), // Required field.
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              certificateHandlebars.informantFirstName
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              certificateHandlebars.informantFamilyName
            ), // Required field.
            getBirthDate(
              'informantBirthDate',
              informantBirthDateConditionals.concat(
                hideIfInformantMotherOrFather
              ),
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
            ), // Required field.
            exactDateOfBirthUnknown(hideIfInformantMotherOrFather),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional.concat(
                hideIfInformantMotherOrFather
              ),
              ageOfIndividualConditionals
            ),
            getNationality(
              certificateHandlebars.informantNationality,
              hideIfInformantMotherOrFather
            ), // Required field.
            getNationalID(
              'informantID',
              hideIfNidIntegrationEnabled.concat(hideIfInformantMotherOrFather),
              getNationalIDValidators('informant'),
              certificateHandlebars.informantNID
            ),
            // preceding field of address fields
            divider('informant-nid-seperator', [
              {
                action: 'hide',
                expression: informantNotMotherOrFather
              }
            ]),
            // ADDRESS FIELDS WILL RENDER HERE
            divider('informant-address-seperator', [
              {
                action: 'hide',
                expression: informantNotMotherOrFather
              }
            ]),
            registrationPhone, // If you wish to enable automated SMS notifications to informants, include this
            registrationEmail // If you wish to enable automated Email notifications to informants, include this
          ],
          previewGroups: [informantNameInEnglish]
        }
      ],
      mapping: getCommonSectionMapping('informant')
    },
    {
      id: 'mother',
      viewType: 'form',
      name: formMessageDescriptors.motherName,
      title: formMessageDescriptors.motherTitle,
      groups: [
        {
          id: 'mother-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.mothersDetailsExist,
              mothersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            divider(
              'mother-details-seperator',
              mothersDetailsExistConditionals
            ),
            getReasonNotExisting(certificateHandlebars.motherReasonNotApplying), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getFirstNameField(
              'motherNameInEnglish',
              motherFirstNameConditionals,
              certificateHandlebars.motherFirstName
            ), // Required field.
            getFamilyNameField(
              'motherNameInEnglish',
              motherFamilyNameConditionals,
              certificateHandlebars.motherFamilyName
            ), // Required field.
            getBirthDate(
              'motherBirthDate',
              mothersBirthDateConditionals,
              parentsBirthDateValidators,
              certificateHandlebars.motherBirthDate
            ), // Required field.
            exactDateOfBirthUnknown(detailsExistConditional),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfMother,
              exactDateOfBirthUnknownConditional.concat(
                detailsExistConditional
              ),
              ageOfParentsConditionals
            ),
            getNationality(
              certificateHandlebars.motherNationality,
              detailsExist
            ), // Required field.
            getNationalID(
              'iD',
              hideIfNidIntegrationEnabled.concat(detailsExist),
              getNationalIDValidators('mother'),
              certificateHandlebars.motherNID
            ),
            // preceding field of address fields
            divider('mother-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            divider('mother-address-seperator', detailsExist),
            getMaritalStatus(certificateHandlebars.motherMaritalStatus, [
              {
                action: 'hide',
                expression: '!values.detailsExist'
              }
            ]),
            getEducation(certificateHandlebars.motherEducationalAttainment),
            getOccupation(certificateHandlebars.motherOccupation),
            multipleBirth
          ],
          previewGroups: [motherNameInEnglish]
        }
      ],
      mapping: getSectionMapping('mother')
    },
    {
      id: 'father',
      viewType: 'form',
      name: {
        defaultMessage: 'Father',
        description: 'Form section name for Father',
        id: 'form.section.father.name'
      },
      title: {
        defaultMessage: "Father's details",
        description: 'Form section title for Father',
        id: 'form.section.father.title'
      },
      groups: [
        {
          id: 'father-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.fathersDetailsExist,
              fathersDetailsExistConditionals
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            divider(
              'father-details-seperator',
              fathersDetailsExistConditionals
            ),
            getReasonNotExisting('fatherReasonNotApplying'), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getFirstNameField(
              'fatherNameInEnglish',
              fatherFirstNameConditionals,
              certificateHandlebars.fatherFirstName
            ), // Required field.
            getFamilyNameField(
              'fatherNameInEnglish',
              fatherFamilyNameConditionals,
              certificateHandlebars.fatherFamilyName
            ), // Required field.
            getBirthDate(
              'fatherBirthDate',
              fathersBirthDateConditionals,
              parentsBirthDateValidators,
              certificateHandlebars.fatherBirthDate
            ), // Required field.
            exactDateOfBirthUnknown(detailsExistConditional),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfFather,
              exactDateOfBirthUnknownConditional.concat(
                detailsExistConditional
              ),
              ageOfParentsConditionals
            ),
            getNationality(
              certificateHandlebars.fatherNationality,
              detailsExist
            ), // Required field.
            getNationalID(
              'iD',
              hideIfNidIntegrationEnabled.concat(detailsExist),
              getNationalIDValidators('father'),
              certificateHandlebars.fatherNID
            ),
            // preceding field of address fields
            divider('father-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            divider('father-address-seperator', detailsExist),
            getMaritalStatus(certificateHandlebars.fatherMaritalStatus, [
              {
                action: 'hide',
                expression: '!values.detailsExist'
              }
            ]),
            getEducation(certificateHandlebars.fatherEducationalAttainment),
            getOccupation(certificateHandlebars.fatherOccupation)
          ],
          previewGroups: [fatherNameInEnglish]
        }
      ],
      mapping: getSectionMapping('father')
    },
    documentsSection // REQUIRED SECTION FOR DOCUMENT ATTACHMENTS
  ]
}
