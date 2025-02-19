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
  and,
  defineConfig,
  or,
  user
} from '@opencrvs/toolkit/events'
import { not, event } from '@opencrvs/toolkit/conditionals'

import { BIRTH_DECLARE_FORM } from './forms/declare'
import { advancedSearchBirth } from './advancedSearch'
import { Event } from '@countryconfig/form/types/types'
import { SCOPES } from '@opencrvs/toolkit/scopes'

export const birthEvent = defineConfig({
  id: Event.Birth,
  label: {
    defaultMessage: 'Birth declaration',
    description: 'This is what this event is referred as in the system',
    id: 'v2.event.birth.label'
  },
  summary: {
    title: {
      id: 'event.birth.summary.title',
      label: {
        defaultMessage: '{child.firstname} {child.surname}',
        description: 'This is the title of the summary',
        id: 'v2.event.birth.summary.title'
      }
    },
    fields: []
  },
  workqueues: [
    {
      id: 'all',
      fields: [
        {
          column: 'title',
          label: {
            defaultMessage: '{child.surname} {child.firstname}',
            description: 'Label for name in all workqueue',
            id: 'v2.event.birth.workqueue.all.name.label'
          }
        }
      ],
      filters: []
    }
  ],
  actions: [
    {
      type: ActionType.CREATE,
      label: {
        defaultMessage: 'Create',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.create.label'
      },
      forms: [],
      conditionals: [
        {
          type: 'SHOW',
          conditional: user.hasScope(SCOPES.RECORD_DECLARE)
        }
      ]
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.declare.label'
      },
      forms: [BIRTH_DECLARE_FORM],
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            not(event.hasAction(ActionType.DECLARE)),
            user.hasScope(SCOPES.RECORD_DECLARE)
          )
        }
      ]
    },
    {
      type: 'VALIDATE',
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.validate.label'
      },
      forms: [BIRTH_DECLARE_FORM],
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            event.hasAction(ActionType.DECLARE),
            not(event.hasAction(ActionType.VALIDATE)),
            user.hasScope(SCOPES.RECORD_SUBMIT_FOR_APPROVAL)
          )
        }
      ]
    },
    {
      type: 'REGISTER',
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'v2.event.birth.action.register.label'
      },
      forms: [BIRTH_DECLARE_FORM],
      conditionals: [
        {
          type: 'SHOW',
          conditional: and(
            or(
              event.hasAction(ActionType.VALIDATE),
              and(event.hasAction('DECLARE'), user.hasScope('register'))
            ),
            not(event.hasAction(ActionType.REGISTER)),
            user.hasScope(SCOPES.RECORD_REGISTER)
          )
        }
      ]
    }
  ],
  advancedSearch: advancedSearchBirth
})
