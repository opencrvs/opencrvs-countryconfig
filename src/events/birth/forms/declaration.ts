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
  and,
  not,
  ConditionalType,
  defineDeclarationForm,
  FieldType,
  status,
  user
} from '@opencrvs/toolkit/events'
import { child } from './pages/child'
import { nameChanges } from './pages/nameChanges'
import { informant } from './pages/informant'
import { introduction } from './pages/introduction'
import { mother } from './pages/mother'
import { father } from './pages/father'
import { documents } from './pages/documents'

export const BIRTH_DECLARATION_REVIEW = {
  title: {
    id: 'event.birth.action.declare.form.review.title',
    defaultMessage:
      '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.alphaPrint.healthNotifier',
      type: FieldType.ALPHA_PRINT_BUTTON,
      label: {
        defaultMessage: 'Print declaration',
        id: 'event.birth.action.declare.form.review.alphaPrint.healthNotifier.label',
        description:
          'Label for the health notifier print declaration button in the review section'
      },
      configuration: {
        template: 'v2.birth-notification',
        buttonLabel: {
          defaultMessage: 'Print declaration',
          id: 'event.birth.action.declare.form.review.alphaPrint.healthNotifier.button.label',
          description: 'Label for the health notifier print declaration button'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(not(status('DECLARED')), not(status('REGISTERED')), user.hasRole('HEALTH_NOTIFIER'))
        }
      ]
    }
  ]
}

export const BIRTH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth declaration form',
    id: 'event.birth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [introduction, child, nameChanges, mother, father, informant, documents]
})
