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
  registrationPhone,
  divider,
  getOccupation
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
import { AddressCases, Event, ISerializedForm } from '../types/types'
import {
  informantBirthDateConditionals,
  informantFamilyNameConditionals,
  ageOfDeceasedConditionals,
  informantFirstNameConditionals,
  exactDateOfBirthUnknownConditional,
  isValidBirthDate,
  spouseDetailsExistConditionals,
  detailsExist,
  spouseBirthDateConditionals,
  spouseFamilyNameConditionals,
  spouseFirstNameConditionals,
  hideIfInformantSpouseOrMotherOrFather,
  hideIfDistrictPlaceOfBirthAddressNotSelected,
  hideIfDistrictPlaceOfDeathNotSelected,
  yearOfBirthValidtors,
  hideIfDistrictPrimaryAddressNotSelected,
  fatherFamilyNameConditionals,
  fatherFirstNameConditionals,
  fathersBirthDateConditionals,
  fathersDetailsExistConditionals,
  motherFamilyNameConditionals,
  motherFirstNameConditionals,
  mothersBirthDateConditionals,
  mothersDetailsExistConditionals,
  parentsBirthDateValidators
} from '../common/default-validation-conditionals'
import { documentsSection, registrationSection } from './required-sections'
import {
  deceasedNameInEnglish,
  fatherNameInEnglish,
  informantNameInEnglish,
  motherNameInEnglish,
  spouseNameInEnglish
} from '../common/preview-groups'
import { certificateHandlebars } from './certficate-handlebars'
import { getCommonSectionMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { getSectionMapping } from '@countryconfig/utils/mapping/section/death/mapping-utils'
import { getReasonForLateRegistration } from '../custom-fields'
import {
  getCustomizedExactDateOfBirthUnknown,
  getFatherIsDeceased,
  getFokontanyCustomAdress,
  getNUI,
  getYearOfBirth
} from '../common/common-custom-fields'
import { getAddressFields } from '../addresses/address-fields'
import {
  getInformantPresenceAtDeath,
  getOtherMannerOfDeath,
  getTimeOfDeath
} from './custom-fields'

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
                    'Once the declaration is processed you will receive an SMS to tell you when to visit the office to collect the certificate - Take your ID with you.',
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
            getFamilyNameField(
              'deceasedNameInEnglish',
              [],
              certificateHandlebars.deceasedFamilyName
            ), // Required field.  Names in Latin characters must be provided for international passport
            getFirstNameField(
              'deceasedNameInEnglish',
              [],
              certificateHandlebars.deceasedFirstName
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
            getNUI([], [], false, certificateHandlebars.deceasedNationalId),
            getMaritalStatus(certificateHandlebars.deceasedMaritalStatus, []),
            {
              name: 'addressPlaceOfBirthAddress',
              type: 'HEADING3',
              label: {
                id: 'form.field.label.birthPlace',
                description:
                  'A form field that asks for the persons birthPlace',
                defaultMessage: 'Place of birth'
              },
              previewGroup: 'addressPlaceOfBirthAddress',
              initialValue: '',
              validator: []
            },
            ...getAddressFields(
              'deceased',
              AddressCases.PLACE_OF_BIRTH_ADDRESS
            ).map((field) => {
              const fieldId = `deceased.deceased.view-group.${field.name}`
              return {
                ...field,
                custom: true,
                customQuestionMappingId: fieldId
              }
            }),
            getFokontanyCustomAdress(
              'death',
              'deceased',
              hideIfDistrictPlaceOfBirthAddressNotSelected('deceased'),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              },
              'placeOfBirth'
            ),
            // Primary address fields,
            getFokontanyCustomAdress(
              'death',
              'deceased',
              hideIfDistrictPrimaryAddressNotSelected('deceased'),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              }
            ),
            getOccupation([], certificateHandlebars.deceasedOccupation)
          ],
          previewGroups: [
            deceasedNameInEnglish,
            {
              id: 'addressPlaceOfBirthAddress',
              label: {
                defaultMessage: 'Place of delivery',
                description: 'Title for place of birth sub section',
                id: 'form.field.label.placeOfBirthPreview'
              },
              fieldToRedirect: 'countryAddressplaceofbirthDeceased'
            }
          ]
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
          id: 'death-event-view-group',
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
            getTimeOfDeath(),
            getReasonForLateRegistration('death'),
            getMannerOfDeath,
            getOtherMannerOfDeath(),
            getCauseOfDeath,
            getCauseOfDeathMethod,
            getDeathDescription,
            // PLACE OF DEATH FIELDS WILL RENDER HERE,
            getFokontanyCustomAdress(
              'death',
              'deathEvent',
              hideIfDistrictPlaceOfDeathNotSelected,
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              }
            )
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
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals.concat(
                hideIfInformantSpouseOrMotherOrFather
              ),
              certificateHandlebars.informantFamilyName
            ), // Required field.
            getFirstNameField(
              'informantNameInEnglish',
              informantFirstNameConditionals.concat(
                hideIfInformantSpouseOrMotherOrFather
              ),
              certificateHandlebars.informantFirstName
            ),
            getBirthDate(
              'informantBirthDate',
              informantBirthDateConditionals.concat(
                hideIfInformantSpouseOrMotherOrFather
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
            getCustomizedExactDateOfBirthUnknown(
              'informant',
              hideIfInformantSpouseOrMotherOrFather
            ),
            getYearOfBirth(
              'informant',
              exactDateOfBirthUnknownConditional.concat(
                hideIfInformantSpouseOrMotherOrFather
              ),
              yearOfBirthValidtors
            ),
            getNUI(
              hideIfInformantSpouseOrMotherOrFather,
              [],
              false,
              certificateHandlebars.informantNationalId
            ),
            getInformantPresenceAtDeath(hideIfInformantSpouseOrMotherOrFather),
            // ADDRESS FIELDS WILL RENDER HERE,
            getFokontanyCustomAdress(
              'death',
              'informant',
              hideIfInformantSpouseOrMotherOrFather.concat(
                hideIfDistrictPrimaryAddressNotSelected('informant')
              ),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              }
            ),
            divider(
              'informant-address-separator',
              hideIfInformantSpouseOrMotherOrFather
            ),
            getOccupation(
              hideIfInformantSpouseOrMotherOrFather,
              certificateHandlebars.informantOccupation
            ),
            registrationPhone
          ],
          previewGroups: [informantNameInEnglish]
        }
      ],
      mapping: getCommonSectionMapping('informant')
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
            getFatherIsDeceased('death', detailsExist),
            getFamilyNameField(
              'fatherNameInEnglish',
              fatherFamilyNameConditionals,
              certificateHandlebars.fatherFamilyName
            ), // Required field.
            getFirstNameField(
              'fatherNameInEnglish',
              fatherFirstNameConditionals,
              certificateHandlebars.fatherFirstName
            ), // Required field.
            getBirthDate(
              'fatherBirthDate',
              fathersBirthDateConditionals,
              parentsBirthDateValidators,
              certificateHandlebars.fatherBirthDate
            ), // Required field.
            getCustomizedExactDateOfBirthUnknown('father', detailsExist),
            getYearOfBirth(
              'father',
              exactDateOfBirthUnknownConditional.concat(detailsExist),
              yearOfBirthValidtors
            ),
            getNationality(
              certificateHandlebars.fatherNationality,
              detailsExist
            ), // Required field.
            getNUI(
              detailsExist,
              [],
              false,
              certificateHandlebars.fatherNationalId
            ),
            getOccupation(
              [
                {
                  action: 'hide',
                  expression: '!values.detailsExist'
                }
              ],
              certificateHandlebars.fatherOccupation
            ),
            // preceding field of address fields
            divider('father-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            getFokontanyCustomAdress(
              'death',
              'father',
              detailsExist.concat(
                hideIfDistrictPrimaryAddressNotSelected('father')
              ),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              }
            )
          ],
          previewGroups: [fatherNameInEnglish]
        }
      ],
      mapping: getSectionMapping('father')
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
            ),
            divider(
              'mother-details-seperator',
              mothersDetailsExistConditionals
            ),
            getReasonNotExisting(certificateHandlebars.motherReasonNotApplying),
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
            getCustomizedExactDateOfBirthUnknown('mother', detailsExist),
            getYearOfBirth(
              'mother',
              exactDateOfBirthUnknownConditional.concat(detailsExist),
              yearOfBirthValidtors
            ),
            getNationality(
              certificateHandlebars.motherNationality,
              detailsExist
            ), // Required field.
            getNUI(
              detailsExist,
              [],
              false,
              certificateHandlebars.motherNationalId
            ),
            getOccupation(
              [
                {
                  action: 'hide',
                  expression: '!values.detailsExist'
                }
              ],
              certificateHandlebars.motherOccupation
            ),
            // preceding field of address fields
            divider('mother-nid-seperator', detailsExist),
            // ADDRESS FIELDS WILL RENDER HERE
            getFokontanyCustomAdress(
              'death',
              'mother',
              detailsExist.concat(
                hideIfDistrictPrimaryAddressNotSelected('mother')
              ),
              true,
              {
                id: 'form.field.label.fokontanyCustomAddress',
                description: 'A form field that asks for name of fokontany',
                defaultMessage: 'Fokontany'
              }
            )
          ],
          previewGroups: [motherNameInEnglish]
        }
      ],
      mapping: getSectionMapping('mother')
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
            getFamilyNameField(
              'spouseNameInEnglish',
              spouseFamilyNameConditionals,
              certificateHandlebars.spouseFamilyName
            ), // Required field.
            getFirstNameField(
              'spouseNameInEnglish',
              spouseFirstNameConditionals,
              certificateHandlebars.spouseFirstName
            ),
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
            getCustomizedExactDateOfBirthUnknown('spouse', detailsExist),
            getYearOfBirth(
              'spouse',
              exactDateOfBirthUnknownConditional.concat(detailsExist),
              yearOfBirthValidtors
            ),
            getNationality(
              certificateHandlebars.spouseNationality,
              detailsExist
            ),
            getNUI(
              detailsExist,
              [],
              false,
              certificateHandlebars.spouseNationalId
            )
          ],
          previewGroups: [spouseNameInEnglish]
        }
      ],
      mapping: getSectionMapping('spouse')
    },
    documentsSection
  ]
} satisfies ISerializedForm
