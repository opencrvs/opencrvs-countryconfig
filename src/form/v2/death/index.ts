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
  ActionType,
  ConditionalType,
  defineConfig,
  field
} from '@opencrvs/toolkit/events'
import {
  DEATH_DECLARATION_FORM,
  DEATH_DECLARATION_REVIEW
} from './form/declaration'
import { PlaceOfBirth } from './form/pages/deceased'

export const deathEvent = defineConfig({
  id: 'Event.V2_DEATH',
  declaration: DEATH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Death',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.death.label'
  },
  dateOfEvent: field('deceased.dob'),
  title: {
    defaultMessage: '{deceased.firstname} {deceased.surname}',
    description: 'This is the title of the summary',
    id: 'v2.event.death.title'
  },
  fallbackTitle: {
    id: 'v2.event.tennis-club-membership.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'deceased.dob',
        emptyValueMessage: {
          defaultMessage: 'No date of death',
          description: 'This is shown when there is no deceased information',
          id: 'v2.event.death.summary.deceased.dob.empty'
        }
      },
      // Render the 'fallback value' when selection has not been made.
      // This hides the default values of the field when no selection has been made. (e.g. when address is prefilled with user's details, we don't want to show the address before selecting the option)
      {
        fieldId: 'deceased.placeOfBirth',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description: 'This is shown when there is no deceased information',
          id: 'v2.event.death.summary.deceased.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'v2.event.death.summary.deceased.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('deceased.placeOfBirth').isFalsy()
          }
        ]
      },
      {
        fieldId: 'deceased.deathLocation',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description: 'This is shown when there is no deceased information',
          id: 'v2.event.death.summary.deceased.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'v2.event.death.summary.deceased.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('deceased.placeOfBirth').isEqualTo(
              PlaceOfBirth.HEALTH_FACILITY
            )
          }
        ]
      },
      {
        fieldId: 'deceased.address.privateHome',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description: 'This is shown when there is no deceased information',
          id: 'v2.event.death.summary.deceased.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'v2.event.death.summary.deceased.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('deceased.placeOfBirth').isEqualTo(
              PlaceOfBirth.PRIVATE_HOME
            )
          }
        ]
      },
      {
        fieldId: 'deceased.address.other',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description: 'This is shown when there is no deceased information',
          id: 'v2.event.death.summary.deceased.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'v2.event.death.summary.deceased.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('deceased.placeOfBirth').isEqualTo(
              PlaceOfBirth.OTHER
            )
          }
        ]
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'v2.event.death.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'v2.event.death.summary.informant.contact.label'
        },
        value: {
          defaultMessage: '{informant.phoneNo} {informant.email}',
          description: 'This is the contact value of the informant',
          id: 'v2.event.death.summary.informant.contact.value'
        }
      }
    ]
  },
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.death.action.Read.label'
      },
      review: DEATH_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.death.action.declare.label'
      },
      review: DEATH_DECLARATION_REVIEW
    },
    {
      type: ActionType.VALIDATE,
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.death.action.validate.label'
      },
      review: DEATH_DECLARATION_REVIEW
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.death.action.register.label'
      },
      review: DEATH_DECLARATION_REVIEW
    }
    // {
    //   type: ActionType.PRINT_CERTIFICATE,
    //   label: {
    //     defaultMessage: 'Print certificate',
    //     description:
    //       'This is shown as the action name anywhere the user can trigger the action from',
    //     id: 'v2.event.death.action.collect-certificate.label'
    //   },
    //   printForm: DEATH_CERTIFICATE_COLLECTOR_FORM
    // }
  ],
  advancedSearch: []
})
