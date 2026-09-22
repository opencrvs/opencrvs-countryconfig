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

import { defineConfig, ActionType, field } from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'
import {
  ADOPTION_DECLARATION_FORM,
  ADOPTION_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchAdoption } from './advancedSearch'
import { dedupConfig } from './dedupConfig'
import { CORRECTION_FORM } from './forms/correctionForm'

export const adoptionEvent = defineConfig({
  id: Event.Adoption,
  declaration: ADOPTION_DECLARATION_FORM,
  label: {
    defaultMessage: 'Adoption',
    description: 'This is what this event is referred as in the system',
    id: 'event.adoption.label'
  },
  title: {
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.adoption.title'
  },
  fallbackTitle: {
    id: 'event.adoption.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'child.dob',
        emptyValueMessage: {
          defaultMessage: 'Date of birth',
          description: 'This is shown when there is no child information',
          id: 'event.adoption.summary.child.dob.empty'
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
        id: 'event.adoption.action.read.label'
      },
      review: ADOPTION_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.declare.label'
      },
      review: ADOPTION_DECLARATION_REVIEW,
      deduplication: {
        id: 'adoption-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.adoption.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.register.label'
      },
      deduplication: {
        id: 'adoption-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.adoption.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Correct record',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.adoption.action.correction.label'
      },
      correctionForm: CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchAdoption
})
