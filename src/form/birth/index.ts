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
import {
  formMessageDescriptors,
  mentionMessageDescriptors
} from '../common/messages'
import { informantType } from './required-fields'
import {
  getBirthDate,
  getGender,
  getFamilyNameField,
  getFirstNameField,
  getNationality,
  otherInformantType,
  getDetailsExist,
  getReasonNotExisting
} from '../common/common-required-fields'
import {
  getMaritalStatus,
  registrationPhone,
  getOccupation,
  divider
} from '../common/common-optional-fields'
import { attendantAtBirth, weightAtBirth } from './optional-fields'
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
  detailsExistConditional,
  yearOfBirthValidtors,
  motherYearOfBirthValidators,
  hideIfDistrictPrimaryAddressNotSelected,
  hideIfFatherPrimaryAddressConditionsDontMeet,
  hideIfNotDefaultCountry
} from '../common/default-validation-conditionals'
import {
  getNationalIDValidators,
  informantFirstNameConditionals,
  informantFamilyNameConditionals,
  informantBirthDateConditionals,
  exactDateOfBirthUnknownConditional,
  hideIfNidIntegrationEnabled
} from '../common/default-validation-conditionals'
import {
  documentsSection,
  registrationSection,
  previewSection,
  reviewSection
} from './required-sections'
import { certificateHandlebars } from './certificate-handlebars'
import { getSectionMapping } from '@countryconfig/utils/mapping/section/birth/mapping-utils'
import { getCommonSectionMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import {
  getLegacyBirthRegistrationDate,
  getLegacyBirthRegistrationNumber,
  getLegacyBirthRegistrationTime,
  getPlaceOfBirth,
  getTimeOfBirth,
  getFatherHasFormallyRecognisedChild,
  typeOfMention,
  availableMentionTypes,
  getRecognitionMentionFields,
  getSimpleAdoptionMentionFields,
  getJudicialAdoptionMentionFields,
  getMarriageMentionFields,
  getDivorceMentionFields,
  getNameChangeMentionFields,
  getDeathMentionFields,
  getNotes,
  getDetailsMentionExist
} from './custom-fields'
import {
  getCustomizedExactDateOfBirthUnknown,
  getFatherIsDeceased,
  getFokontanyCustomAddress,
  getMotherIsDeceased,
  getNUI,
  getYearOfBirth
} from '../common/common-custom-fields'
import { conditionals } from './custom-conditionals'

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
            getFamilyNameField(
              'childNameInEnglish',
              [],
              certificateHandlebars.childFamilyName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getFirstNameField(
              'childNameInEnglish',
              [],
              certificateHandlebars.childFirstName
            ),
            getGender(certificateHandlebars.childGender), // Required field.
            getBirthDate(
              'childBirthDate',
              [],
              isValidChildBirthDate,
              certificateHandlebars.eventDate
            ), // Required field.
            // COMMENT IN AND DUPLICATE AS REQUIRED IN ORDER TO CREATE A CUSTOM FIELD: createCustomFieldExample(),
            getTimeOfBirth(),
            weightAtBirth,
            // PLACE OF BIRTH FIELDS WILL RENDER HERE
            getFokontanyCustomAddress(
              Event.Birth,
              'child',
              [
                {
                  action: 'hide',
                  expression:
                    'values.placeOfBirth!="PRIVATE_HOME" && values.placeOfBirth!="OTHER"'
                },
                {
                  action: 'hide',
                  expression: ' !values.districtPlaceofbirth'
                },
                ...hideIfNotDefaultCountry('countryPlaceofbirth')
              ],
              true,
              // locationOfBirthIsNotHealthFacility, // this display the field fktCustomAddress at the first opening of child section
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              },
              'placeOfBirth'
            ),
            attendantAtBirth,
            {
              name: 'createNUI',
              type: 'HTTP',
              hideInPreview: true,
              custom: true,
              label: { id: 'form.label.empty', defaultMessage: ' ' },
              conditionals: [
                conditionals.hide.whenFieldAgent,
                conditionals.hide.whenRegistrationAgent
              ],
              validator: [],
              options: {
                headers: {
                  'Content-Type': 'application/json'
                },
                url: '/api/countryconfig/nui',
                method: 'POST',
                body: {
                  office: '$user.primaryOffice.name'
                }
              },
              mapping: {
                mutation: {
                  operation: 'ignoreFieldTransformer'
                }
              }
            },
            {
              name: 'iD',
              type: 'TEXT',
              label: formMessageDescriptors.nui,
              required: true,
              custom: true,
              initialValue: {
                expression: '$form.createNUI?.data',
                dependsOn: ['createNUI']
              },
              maxLength: 10,
              conditionals: [
                conditionals.hide.whenFieldAgent,
                conditionals.hide.whenRegistrationAgent,
                {
                  action: 'hide',
                  expression:
                    '!$form.createNUI?.data && !$form.iD || !!$form.iDManual'
                },
                {
                  action: 'disable',
                  expression: '$form.createNUI?.data'
                }
              ],
              validator: [
                {
                  operation: 'validIDNumberCustom' as const,
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['mother.iD']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['father.iD']
                }
              ],
              mapping: {
                template: {
                  fieldName: 'childNID',
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                mutation: {
                  operation: 'fieldToIdentityTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                },
                query: {
                  operation: 'identityToFieldTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                }
              }
            },
            {
              name: 'nuiGenerator',
              type: 'BUTTON',
              custom: true,
              required: true,
              validator: [],
              options: {
                trigger: 'createNUI',
                shouldHandleLoadingState: true
              },
              conditionals: [
                conditionals.hide.whenFieldAgent,
                conditionals.hide.whenRegistrationAgent,
                {
                  action: 'hide',
                  expression: '$form.createNUI?.data || $form.iD'
                },
                {
                  action: 'disable',
                  expression: '$form.createNUI?.loading'
                },
                {
                  action: 'hide',
                  expression:
                    '$form.createNUI?.error || !window.navigator.onLine'
                }
              ],
              label: formMessageDescriptors.nui,
              buttonLabel: formMessageDescriptors.generateNUI,
              icon: 'UserCircle',
              loadingLabel: formMessageDescriptors.generatingNUI
            },
            {
              name: 'nuiGeneratorError',
              type: 'BUTTON',
              custom: true,
              hideInPreview: true,
              required: false,
              validator: [],
              options: {
                trigger: 'createNUI',
                shouldHandleLoadingState: true
              },
              conditionals: [
                conditionals.hide.whenFieldAgent,
                conditionals.hide.whenRegistrationAgent,
                {
                  action: 'disable',
                  expression:
                    '!window.navigator.onLine || $form.createNUI?.error'
                },
                {
                  action: 'hide',
                  expression:
                    '!$form.createNUI?.error && window.navigator.onLine'
                }
              ],
              label: formMessageDescriptors.nui,
              buttonLabel: formMessageDescriptors.generateNUI,
              icon: 'UserCircle',
              loadingLabel: formMessageDescriptors.generatingNUI
            },
            {
              name: 'iDManual',
              type: 'TEXT',
              label: {
                id: 'form.field.label.idManual',
                defaultMessage: 'Enter NUI manually'
              },
              previewGroup: 'iDManual',
              required: true,
              custom: true,
              initialValue: '',
              maxLength: 10,
              conditionals: [
                conditionals.hide.whenFieldAgent,
                conditionals.hide.whenRegistrationAgent,
                {
                  action: 'hide',
                  expression:
                    '!$form.iDManual && ((window.navigator.onLine && !$form.createNUI?.error) || (!!$form.createNUI?.data || !!$form.iD))'
                }
              ],
              validator: [
                {
                  operation: 'validIDNumberCustom' as const,
                  parameters: ['NATIONAL_ID']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['mother.iD']
                },
                {
                  operation: 'duplicateIDNumber',
                  parameters: ['father.iD']
                }
              ],
              mapping: {
                mutation: {
                  operation: 'fieldToIdentityTransformer',
                  parameters: ['id', 'NATIONAL_ID']
                }
              }
            },
            getLegacyBirthRegistrationNumber({
              conditionals: [conditionals.hide.whenFieldAgent],
              subject: 'child'
            }),
            getLegacyBirthRegistrationDate({
              conditionals: [conditionals.hide.whenFieldAgent]
            }),
            getLegacyBirthRegistrationTime({
              conditionals: [conditionals.hide.whenFieldAgent]
            })
          ],
          previewGroups: [
            childNameInEnglish,
            {
              id: 'iDManual',
              label: formMessageDescriptors.nui,
              fieldToRedirect: 'iDManual',
              delimiter: ' '
            }
          ] // Preview groups are used to structure data nicely in Review Page UI
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
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              certificateHandlebars.informantFamilyName
            ), // Required field.
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals.concat(
                hideIfInformantMotherOrFather
              ),
              certificateHandlebars.informantFirstName
            ),
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
                },
                {
                  operation: 'isInformantOfLegalAgeCustom'
                }
              ],
              certificateHandlebars.informantBirthDate
            ), // Required field.
            getCustomizedExactDateOfBirthUnknown(
              Event.Birth,
              'informant',
              hideIfInformantMotherOrFather
            ),
            getYearOfBirth(
              Event.Birth,
              'informant',
              exactDateOfBirthUnknownConditional.concat(
                hideIfInformantMotherOrFather
              ),
              yearOfBirthValidtors
            ),
            getNationality(
              certificateHandlebars.informantNationality,
              hideIfInformantMotherOrFather
            ), // Required field.
            getNUI(
              hideIfNidIntegrationEnabled.concat(hideIfInformantMotherOrFather),
              getNationalIDValidators('informant'),
              false,
              certificateHandlebars.informantNID
            ),
            getPlaceOfBirth('informant', hideIfInformantMotherOrFather, false),
            // preceding field of address fields
            divider('informant-nid-seperator', hideIfInformantMotherOrFather),
            // ADDRESS FIELDS WILL RENDER HERE
            getFokontanyCustomAddress(
              Event.Birth,
              'informant',
              hideIfInformantMotherOrFather
                .concat(hideIfDistrictPrimaryAddressNotSelected('informant'))
                .concat(hideIfNotDefaultCountry('countryPrimaryInformant')),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              },
              'primaryAddress'
            ),
            getOccupation(
              hideIfInformantMotherOrFather,
              certificateHandlebars.informantOccupation,
              true
            ),
            registrationPhone // If you wish to enable automated SMS notifications to informants, include this
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
            getReasonNotExisting(
              certificateHandlebars.motherReasonNotApplying,
              formMessageDescriptors.reasonMotherNotApplying
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getMotherIsDeceased(Event.Birth, detailsExistConditional),
            getFamilyNameField(
              'motherNameInEnglish',
              motherFamilyNameConditionals,
              certificateHandlebars.motherFamilyName
            ), // Required field.
            getFirstNameField(
              'motherNameInEnglish',
              motherFirstNameConditionals,
              certificateHandlebars.motherFirstName
            ),
            getBirthDate(
              'motherBirthDate',
              mothersBirthDateConditionals,
              parentsBirthDateValidators,
              certificateHandlebars.motherBirthDate
            ), // Required field.
            getCustomizedExactDateOfBirthUnknown(
              Event.Birth,
              'mother',
              detailsExistConditional
            ),
            getYearOfBirth(
              Event.Birth,
              'mother',
              exactDateOfBirthUnknownConditional.concat(
                detailsExistConditional
              ),
              motherYearOfBirthValidators
            ),
            getNationality(
              certificateHandlebars.motherNationality,
              detailsExist
            ), // Required field.
            getNUI(
              hideIfNidIntegrationEnabled.concat(detailsExist),
              getNationalIDValidators('mother'),
              false,
              certificateHandlebars.motherNID
            ),
            getPlaceOfBirth('mother', detailsExistConditional, true),
            // preceding field of address fields
            divider('mother-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            getFokontanyCustomAddress(
              Event.Birth,
              'mother',
              detailsExistConditional
                .concat(hideIfDistrictPrimaryAddressNotSelected('mother'))
                .concat(hideIfNotDefaultCountry('countryPrimaryMother')),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              },
              'primaryAddress'
            ),
            getMaritalStatus(
              certificateHandlebars.motherMaritalStatus,
              [
                {
                  action: 'hide',
                  expression: '!values.detailsExist'
                }
              ],
              true
            ),
            getOccupation(detailsExist, certificateHandlebars.motherOccupation)
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
            getReasonNotExisting(
              'fatherReasonNotApplying',
              formMessageDescriptors.reasonFatherNotApplying
            ), // Strongly recommend is required if you want to register abandoned / orphaned children!
            getFatherIsDeceased(Event.Birth, detailsExist),
            getFatherHasFormallyRecognisedChild(detailsExist),
            getFamilyNameField(
              'fatherNameInEnglish',
              fatherFamilyNameConditionals,
              certificateHandlebars.fatherFamilyName
            ), // Required field.
            getFirstNameField(
              'fatherNameInEnglish',
              fatherFirstNameConditionals,
              certificateHandlebars.fatherFirstName
            ),
            getBirthDate(
              'fatherBirthDate',
              fathersBirthDateConditionals,
              parentsBirthDateValidators,
              certificateHandlebars.fatherBirthDate
            ), // Required field.
            getCustomizedExactDateOfBirthUnknown(
              Event.Birth,
              'father',
              detailsExistConditional
            ),
            getYearOfBirth(
              Event.Birth,
              'father',
              exactDateOfBirthUnknownConditional.concat(
                detailsExistConditional
              ),
              yearOfBirthValidtors
            ),
            getNationality(
              certificateHandlebars.fatherNationality,
              detailsExist
            ), // Required field.
            getNUI(
              hideIfNidIntegrationEnabled.concat(detailsExist),
              getNationalIDValidators('father'),
              false,
              certificateHandlebars.fatherNID
            ),
            getPlaceOfBirth('father', detailsExistConditional, true),
            // preceding field of address fields
            divider('father-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            getFokontanyCustomAddress(
              Event.Birth,
              'father',
              hideIfFatherPrimaryAddressConditionsDontMeet
                .concat(hideIfDistrictPrimaryAddressNotSelected('father'))
                .concat(hideIfNotDefaultCountry('countryPrimaryFather')),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              },
              'primaryAddress'
            ),
            divider('father-address-seperator', detailsExist),
            getMaritalStatus(
              certificateHandlebars.fatherMaritalStatus,
              [
                {
                  action: 'hide',
                  expression: '!values.detailsExist'
                }
              ],
              true
            ),
            getOccupation(detailsExist, certificateHandlebars.fatherOccupation)
          ],
          previewGroups: [fatherNameInEnglish]
        }
      ],
      mapping: getSectionMapping('father')
    },
    {
      id: 'mention',
      viewType: 'form',
      name: mentionMessageDescriptors.sectionName,
      groups: Array.from({ length: 10 }, (_, i) => ({
        id: 'mention-view-group-' + i,
        conditionals:
          i === 0
            ? [
                {
                  action: 'hide',
                  expression:
                    '!Boolean(draftData?.registration?.registrationNumber)'
                }
              ]
            : [
                {
                  action: 'hide',
                  expression:
                    '!Boolean(draftData?.registration?.registrationNumber)'
                },
                {
                  action: 'hide',
                  expression: `!values['detailsMentionExist__${
                    i - 1
                  }'] || values['detailsMentionExist__${i - 1}'] === "false"`
                }
              ],
        title: {
          id: 'mention-view-group-' + i,
          defaultMessage: 'Mention ' + (i + 1),
          description: 'Form section title for mention'
        },
        fields: [
          getDetailsMentionExist(i),
          typeOfMention(i),
          ...availableMentionTypes
            .filter((type) => type !== 'REJECTION')
            .flatMap((type) => {
              if (type === 'RECOGNITION') return getRecognitionMentionFields(i)
              else if (type === 'SIMPLE_ADOPTION')
                return getSimpleAdoptionMentionFields(i)
              else if (type === 'JUDICIAL_ADOPTION')
                return getJudicialAdoptionMentionFields(i)
              else if (type === 'MARRIAGE') return getMarriageMentionFields(i)
              else if (type === 'DIVORCE') return getDivorceMentionFields(i)
              else if (type === 'NAME_CHANGE')
                return getNameChangeMentionFields(i)
              else if (type === 'DEATH') return getDeathMentionFields(i)
              else return []
            }),
          getNotes(i)
        ],
        previewGroups: [
          {
            id: 'mention' + i,
            label: mentionMessageDescriptors.typeMention,
            labelParam: {
              i
            }
            // label: {
            //   description: 'Label for details preview group title',
            //   defaultMessage: 'Details of the mention ' + (i + 1),
            //   id: 'form.preview.group.label.typeMention' + i
            // }
          }
        ]
      }))
    },
    documentsSection, // REQUIRED SECTION FOR DOCUMENT ATTACHMENTS
    previewSection, // REQUIRED SECTION TO PREVIEW DECLARATION BEFORE SUBMIT
    reviewSection // REQUIRED SECTION TO REVIEW SUBMITTED DECLARATION
  ]
}
