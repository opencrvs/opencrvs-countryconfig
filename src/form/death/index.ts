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
  getMaritalStatus,
  registrationEmail,
  registrationPhone,
  divider
  // getOccupation
} from '../common/common-optional-fields'
import {
  getGender,
  getBirthDate,
  getFamilyNameField,
  getFirstNameField,
  getNationality,
  otherInformantType,
  getDetailsExist,
  getReasonNotExisting
} from '../common/common-required-fields'
import {
  deathInformantType,
  getCauseOfDeath,
  getCauseOfDeathMethod,
  getDeathDate,
  getDeathDescription,
  getMannerOfDeath
} from './required-fields'
import { formMessageDescriptors } from '../common/messages'
import { Event, ISerializedForm } from '../types/types'
import {
  informantBirthDateConditionals,
  informantFamilyNameConditionals,
  ageOfIndividualValidators,
  ageOfDeceasedConditionals,
  informantFirstNameConditionals,
  exactDateOfBirthUnknownConditional,
  isValidBirthDate /*,
  fathersDetailsExistConditionals,
  fatherFirstNameConditionals,
  fatherFamilyNameConditionals,
  fathersBirthDateConditionals,
  parentsBirthDateValidators,
  detailsExistConditional,
  motherFirstNameConditionals,
  motherFamilyNameConditionals,
  mothersBirthDateConditionals,
  mothersDetailsExistConditionals,*/,
  spouseDetailsExistConditionals,
  detailsExist,
  spouseBirthDateConditionals,
  spouseFamilyNameConditionals,
  spouseFirstNameConditionals,
  hideIfInformantSpouse,
  hideIfNidIntegrationEnabled
} from '../common/default-validation-conditionals'
import { documentsSection, registrationSection } from './required-sections'
import {
  deceasedNameInEnglish,
  informantNameInEnglish /*,
  fatherNameInEnglish,
  motherNameInEnglish,*/,
  spouseNameInEnglish
} from '../common/preview-groups'
import { certificateHandlebars } from './certficate-handlebars'
import { getCommonSectionMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { getNumberOfDependants } from '@countryconfig/form/death/custom-fields'
import { getIDNumberFields, getIDType } from '@countryconfig/form/custom-fields'
import { getSectionMapping } from '@countryconfig/utils/mapping/section/death/mapping-utils'
//import { getSectionMapping } from '@countryconfig/utils/mapping/section/death/mapping-utils'
import { getReasonForLateRegistration } from '../custom-fields'

// import { createCustomFieldExample } from '../custom-fields'

// ======================= FORM CONFIGURATION =======================

// A REGISTRATION FORM IS MADE UP OF PAGES OR "SECTIONS"

// A "SECTION" CAN BE SPLIT OVER MULTIPLE SUB-PAGES USING "GROUPS"

// GROUPS CONTAIN A FIELDS ARRAY AND EACH FIELD IS RENDERED BY A FORM FIELD FUNCTION

// MOVE FORM FIELD FUNCTIONS UP AND DOWN TO CHANGE THE VERTICAL ORDER OF FIELDS

// IN EACH GROUP, REQUIRED FIELDS MUST BE INCLUDED AS-IS FOR OPENCRVS TO FUNCTION

// OPTIONAL FIELDS CAN BE COMMENTED OUT OR REMOVED IF NOT REQUIRED

// DUPLICATE & FOLLOW THE INSTRUCTIONS IN THE createCustomFieldExample FUNCTION WHEN REQUIRED FOR ADDING NEW CUSTOM FIELDS

export const deathForm = {
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
              'Introduce the death registration process to the informant',
            description: 'Event information title for the birth',
            id: 'register.eventInfo.death.title'
          },
          conditionals: [
            {
              action: 'hide',
              expression: 'window.config.HIDE_DEATH_EVENT_REGISTER_INFORMATION'
            }
          ],
          fields: [
            {
              name: 'list',
              type: 'BULLET_LIST',
              items: [
                {
                  defaultMessage:
                    'I am going to help you make a declaration of death.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet1'
                },
                {
                  defaultMessage:
                    'As the legal Informant it is important that all the information provided by you is accurate.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet2'
                },
                {
                  defaultMessage:
                    'Once the declaration is processed you will receive you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet3'
                },
                {
                  defaultMessage:
                    'Make sure you collect the certificate. A death certificate is critical to support with inheritance claims and to resolve the affairs of the deceased e.g. closing bank accounts and setting loans.',
                  description: 'Form information for birth',
                  id: 'form.section.information.death.bullet4'
                }
              ],
              label: {
                id: 'register.eventInfo.death.title'
              },
              initialValue: '',
              validator: []
            }
          ]
        }
      ]
    },
    {
      id: 'deceased',
      viewType: 'form',
      name: formMessageDescriptors.deceasedName,
      title: formMessageDescriptors.deceasedTitle,
      groups: [
        {
          id: 'deceased-view-group',
          fields: [
            getFirstNameField(
              'deceasedNameInEnglish',
              [],
              certificateHandlebars.deceasedFirstName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getFamilyNameField(
              'deceasedNameInEnglish',
              [],
              certificateHandlebars.deceasedFamilyName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getGender(certificateHandlebars.deceasedGender), // Required field.
            getBirthDate(
              'deceasedBirthDate',
              [
                {
                  action: 'hide',
                  expression: 'values.exactDateOfBirthUnknown'
                }
              ],
              isValidBirthDate,
              certificateHandlebars.deceasedBirthDate
            ), // Required field.,
            exactDateOfBirthUnknown([]),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfDeceased,
              exactDateOfBirthUnknownConditional,
              ageOfDeceasedConditionals,
              certificateHandlebars.ageOfDeceasedInYears
            ),
            getNationality(certificateHandlebars.deceasedNationality, []),
            getIDType('death', 'deceased', [], true),
            ...getIDNumberFields('deceased', [], true),
            getMaritalStatus(certificateHandlebars.deceasedMaritalStatus, []),
            getNumberOfDependants()
          ],
          previewGroups: [deceasedNameInEnglish]
        }
      ]
    },
    {
      id: 'deathEvent',
      viewType: 'form',
      name: formMessageDescriptors.deathEventName,
      title: formMessageDescriptors.deathEventTitle,
      groups: [
        {
          id: 'death-event-details',
          fields: [
            getDeathDate(
              'deathDate',
              [],
              [
                {
                  operation: 'isValidDeathOccurrenceDate'
                }
              ]
            ),
            getReasonForLateRegistration('death'),
            getMannerOfDeath,
            getCauseOfDeath,
            getCauseOfDeathMethod,
            getDeathDescription
            // PLACE OF DEATH FIELDS WILL RENDER HERE
          ]
        }
      ]
    },
    {
      id: 'informant',
      viewType: 'form',
      name: formMessageDescriptors.informantName,
      title: formMessageDescriptors.deathInformantTitle,
      groups: [
        {
          id: 'informant-view-group',
          fields: [
            deathInformantType,
            otherInformantType(Event.Death),
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals.concat(hideIfInformantSpouse),
              certificateHandlebars.informantFirstName
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals.concat(hideIfInformantSpouse),
              certificateHandlebars.informantFamilyName
            ), // Required field.
            getBirthDate(
              'informantBirthDate',
              informantBirthDateConditionals.concat(hideIfInformantSpouse),
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
            exactDateOfBirthUnknown(hideIfInformantSpouse),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional.concat(hideIfInformantSpouse),
              ageOfIndividualValidators
            ),
            getNationality(
              certificateHandlebars.informantNationality,
              hideIfInformantSpouse
            ),
            getIDType(
              'death',
              'informant',
              hideIfNidIntegrationEnabled.concat(hideIfInformantSpouse),
              true
            ),
            ...getIDNumberFields(
              'informant',
              hideIfNidIntegrationEnabled.concat(hideIfInformantSpouse),
              true
            ),
            // ADDRESS FIELDS WILL RENDER HERE
            divider('informant-address-separator', hideIfInformantSpouse),
            registrationPhone,
            registrationEmail
          ],
          previewGroups: [informantNameInEnglish]
        }
      ],
      mapping: getCommonSectionMapping('informant')
    },
    {
      id: 'spouse',
      viewType: 'form',
      name: formMessageDescriptors.spouseSectionName,
      title: formMessageDescriptors.spouseSectionName,
      groups: [
        {
          id: 'spouse-view-group',
          fields: [
            getDetailsExist(
              formMessageDescriptors.spouseDetailsExist,
              spouseDetailsExistConditionals
            ),
            divider('spouse-details-seperator', spouseDetailsExistConditionals),
            getReasonNotExisting(certificateHandlebars.spouseReasonNotApplying),
            getFirstNameField(
              'spouseNameInEnglish',
              spouseFirstNameConditionals,
              certificateHandlebars.spouseFirstName
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'spouseNameInEnglish',
              spouseFamilyNameConditionals,
              certificateHandlebars.spouseFamilyName
            ), // Required field.
            getBirthDate(
              'spouseBirthDate',
              spouseBirthDateConditionals,
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
              certificateHandlebars.spouseBirthDate
            ), // Required field.
            exactDateOfBirthUnknown(detailsExist),
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfSpouse,
              exactDateOfBirthUnknownConditional.concat(detailsExist),
              ageOfIndividualValidators
            ),
            getNationality(
              certificateHandlebars.spouseNationality,
              detailsExist
            ),
            getIDType('death', 'spouse', detailsExist, true),
            ...getIDNumberFields('spouse', detailsExist, true),
            // preceding field of address fields
            divider('spouse-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            divider('spouse-address-separator')
          ],
          previewGroups: [spouseNameInEnglish]
        }
      ],
      mapping: getSectionMapping('spouse')
    },
    /*
    OTHER POSSIBLE SECTIONS FOR DEATH INCLUDE:
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
            ),
            divider(
              'mother-details-seperator',
              mothersDetailsExistConditionals
            ),
            getReasonNotExisting(certificateHandlebars.motherReasonNotApplying),
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
              exactDateOfBirthUnknownConditional.concat(detailsExistConditional)
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
            getOccupation(certificateHandlebars.motherOccupation, [
              {
                action: 'hide',
                expression: '!values.detailsExist'
              }
            ])
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
              exactDateOfBirthUnknownConditional.concat(detailsExistConditional)
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
            getOccupation(certificateHandlebars.fatherOccupation, [
              {
                action: 'hide',
                expression: '!values.detailsExist'
              }
            ])
          ],
          previewGroups: [fatherNameInEnglish]
        }
      ],
      mapping: getSectionMapping('father')
    },*/
    documentsSection
  ]
} satisfies ISerializedForm
