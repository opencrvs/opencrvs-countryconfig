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
  BIRTH_DECLARATION_FORM,
  BIRTH_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchBirth } from './advancedSearch'
import { Event } from '@countryconfig/form/types/types'
import { BIRTH_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { PlaceOfBirth } from './forms/pages/child'

export const birthEvent = defineConfig({
  id: Event.V2_BIRTH,
  declaration: BIRTH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Birth',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.birth.label'
  },
  dateOfEvent: field('child.dob'),
  title: {
    defaultMessage: '{child.firstname} {child.surname}',
    description: 'This is the title of the summary',
    id: 'v2.event.birth.title'
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
        fieldId: 'child.dob',
        emptyValueMessage: {
          defaultMessage: 'No date of birth',
          description: 'This is shown when there is no child information',
          id: 'v2.event.birth.summary.child.dob.empty'
        }
      },
      // Render the 'fallback value' when selection has not been made.
      // This hides the default values of the field when no selection has been made. (e.g. when address is prefilled with user's details, we don't want to show the address before selecting the option)
      {
        fieldId: 'child.placeOfBirth',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'v2.event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'v2.event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isFalsy()
          }
        ]
      },
      {
        fieldId: 'child.birthLocation',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'v2.event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'v2.event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isEqualTo(
              PlaceOfBirth.HEALTH_FACILITY
            )
          }
        ]
      },
      {
        fieldId: 'child.address.privateHome',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'v2.event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'v2.event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isEqualTo(
              PlaceOfBirth.PRIVATE_HOME
            )
          }
        ]
      },
      {
        fieldId: 'child.address.other',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'v2.event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'v2.event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isEqualTo(
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
          id: 'v2.event.birth.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'v2.event.birth.summary.informant.contact.label'
        },
        value: {
          defaultMessage: '{informant.phoneNo} {informant.email}',
          description: 'This is the contact value of the informant',
          id: 'v2.event.birth.summary.informant.contact.value'
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
        id: 'v2.event.birth.action.Read.label'
      },
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.declare.label'
      },
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.VALIDATE,
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.validate.label'
      },
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.register.label'
      },
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.collect-certificate.label'
      },
      printForm: BIRTH_CERTIFICATE_COLLECTOR_FORM
    }
  ],
  advancedSearch: advancedSearchBirth
})
