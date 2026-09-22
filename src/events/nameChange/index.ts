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
import { subjects } from './forms/pages/subjects'
import { defineConfig, ActionType, field } from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'
import {
  NAME_CHANGE_DECLARATION_FORM,
  NAME_CHANGE_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchNameChange } from './advancedSearch'
import { dedupConfig } from './dedupConfig'
import { NAME_CHANGE_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { CORRECTION_FORM } from './forms/correctionForm'

export const nameChangeEvent = defineConfig({
  id: Event.NameChange,
  declaration: NAME_CHANGE_DECLARATION_FORM,
  label: {
    defaultMessage: 'Name change',
    description: 'This is what this event is referred as in the system',
    id: 'event.nameChange.label'
  },
  title: {
    defaultMessage: '{subjects.name.firstname} {subjects.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.nameChange.title'
  },
  fallbackTitle: {
    id: 'event.nameChange.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'subjects.dob',
        emptyValueMessage: {
          defaultMessage: 'Date of birth',
          description: 'This is shown when there is no subject information',
          id: 'event.nameChange.summary.subjects.dob.empty'
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
        id: 'event.nameChange.action.read.label'
      },
      review: NAME_CHANGE_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.nameChange.action.declare.label'
      },
      review: NAME_CHANGE_DECLARATION_REVIEW,
      deduplication: {
        id: 'name-change-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.nameChange.action.detect-duplicate.label'
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
        id: 'event.nameChange.action.register.label'
      },
      deduplication: {
        id: 'name-change-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.nameChange.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.collect-certificate.label'
      },
      printForm: NAME_CHANGE_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        id: 'event.birth.action.declare.form.review.title',
        defaultMessage:
          '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
        description: 'Title of the form to show in review page'
      },
      correctionForm: CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchNameChange
})
