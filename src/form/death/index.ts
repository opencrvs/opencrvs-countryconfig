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
  getMaritalStatus,
  registrationEmail,
  registrationPhone,
  divider,
  getNationalID
} from '../common/common-optional-fields'
import {
  getGender,
  getBirthDate,
  getFamilyNameField,
  getFirstNameField,
  getNationality,
  otherInformantType
} from '../common/common-required-fields'
import {
  deathInformantType,
  getCauseOfDeath,
  getCauseOfDeathMethod,
  getDeathDate,
  getDeathDescription,
  getMannerOfDeath,
  getPlaceOfDeathFields
} from './required-fields'
import { formMessageDescriptors } from '../common/messages'
import { Event, ISerializedForm } from '../types/types'
import {
  getNationalIDValidators,
  hideIfNidIntegrationEnabled,
  informantBirthDateConditionals,
  informantFamilyNameConditionals,
  informantFirstNameConditionals,
  exactDateOfBirthUnknownConditional,
  isValidBirthDate
} from '../common/default-validation-conditionals'
import { documentsSection, registrationSection } from './required-sections'
import {
  deceasedNameInEnglish,
  informantNameInEnglish
} from '../common/preview-groups'
import { certificateHandlebars } from './certficate-handlebars'

// ======================= FORM CONFIGURATION =======================

// A REGISTRATION FORM IS MADE UP OF PAGES OR "SECTIONS"

// A "SECTION" CAN BE SPLIT OVER MULTIPLE PAGES USING "GROUPS" ALTHOUGH THIS MAY BE DEPRECATED

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
              [],
              isValidBirthDate,
              certificateHandlebars.deceasedBirthDate
            ), // Required field.,
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional
            ),
            getNationality(certificateHandlebars.deceasedNationality, []),
            getNationalID(
              'deceasedID',
              [],
              getNationalIDValidators('deceased'),
              certificateHandlebars.deceasedNID
            ),
            getMaritalStatus(certificateHandlebars.deceasedMaritalStatus, [])
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
            getMannerOfDeath,
            getCauseOfDeath,
            getCauseOfDeathMethod,
            getDeathDescription,
            ...getPlaceOfDeathFields()
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
              informantFirstNameConditionals,
              certificateHandlebars.informantFirstName
            ), // Required field. In Farajaland, we have built the option to integrate with MOSIP. So we have different conditionals for each name to check MOSIP responses.  You could always refactor firstNamesEng for a basic setup
            getFamilyNameField(
              'informantNameInEnglish',
              informantFamilyNameConditionals,
              certificateHandlebars.informantFamilyName
            ), // Required field.
            getBirthDate(
              'informantBirthDate',
              informantBirthDateConditionals,
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
            exactDateOfBirthUnknown,
            getAgeOfIndividualInYears(
              formMessageDescriptors.ageOfInformant,
              exactDateOfBirthUnknownConditional
            ),
            getNationality(certificateHandlebars.informantNationality, []),
            getNationalID(
              'informantID',
              hideIfNidIntegrationEnabled,
              getNationalIDValidators('informant'),
              certificateHandlebars.informantNID
            ),
            divider('place-of-death'),
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
    documentsSection
  ]
} satisfies ISerializedForm
