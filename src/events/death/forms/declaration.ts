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

import { ConditionalType, defineDeclarationForm, FieldType } from '@opencrvs/toolkit/events'
import { deceased } from './pages/deceased'
import { informant } from './pages/informant'
import { deathIntroduction } from './pages/introduction'
import { documents } from './pages/documents'
import { spouse } from './pages/spouse'
import { eventDetails } from './pages/eventDetails'
import { burial } from './pages/burial'
import { father } from './pages/father'
import { mother } from './pages/mother'
import { livingChildren } from './pages/livingChildren'
import { icd10 } from './pages/icd10'
import { hasNonHealthNotifierRole } from '@countryconfig/events/utils'

export const DEATH_DECLARATION_REVIEW = {
  title: {
    id: 'event.death.action.declare.form.review.title',
    defaultMessage:
      '{deceased.name.firstname, select, __EMPTY__ {Death declaration} other {{deceased.name.surname, select, __EMPTY__ {Death declaration for {deceased.name.firstname}} other {Death declaration for {deceased.name.firstname} {deceased.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
        {
          id: 'review.step1.hint',
          type: FieldType.PARAGRAPH,
          label: {
            defaultMessage: 'Step 1',
            description: 'Hint label for step 1 of the review',
            id: 'event.death.action.declare.form.review.step1.hint.label'
          },
          configuration: { styles: { hint: true } },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: hasNonHealthNotifierRole
            }
          ]
        },
        {
          id: 'review.step1.description',
          type: FieldType.PARAGRAPH,
          label: {
            defaultMessage:
              'Print the declaration summary for the informant(s) to review and sign.',
            description: 'Description for step 1 of the review',
            id: 'event.death.action.declare.form.review.step1.description.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: hasNonHealthNotifierRole
            }
          ]
        },
        {
          id: 'review.printButton',
          type: FieldType.ALPHA_PRINT_BUTTON,
          label: {
            defaultMessage: 'Print declaration summary',
            description: 'Label for the print declaration summary button',
            id: 'event.death.action.declare.form.review.printButton.label'
          },
          configuration: {
            template: 'v2.death-summary',
            buttonLabel: {
              defaultMessage: 'Print declaration summary',
              description: 'Button label for print declaration summary',
              id: 'event.death.action.declare.form.review.printButton.buttonLabel'
            }
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: hasNonHealthNotifierRole
            }
          ]
        },
        {
          id: 'review.step2.hint',
          type: FieldType.PARAGRAPH,
          label: {
            defaultMessage: 'Step 2',
            description: 'Hint label for step 2 of the review',
            id: 'event.death.action.declare.form.review.step2.hint.label'
          },
          configuration: { styles: { hint: true } },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: hasNonHealthNotifierRole
            }
          ]
        },
        {
          id: 'review.step2.description',
          type: FieldType.PARAGRAPH,
          label: {
            defaultMessage:
              'Upload the signed declaration summary after it has been reviewed and signed by the informant(s).',
            description: 'Description for step 2 of the review',
            id: 'event.death.action.declare.form.review.step2.description.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: hasNonHealthNotifierRole
            }
          ]
        },
        {
          id: 'review.signedDeclaration',
          type: FieldType.FILE,
          required: true,
          uncorrectable: true,
          label: {
            defaultMessage: 'Upload signed declaration',
            description: 'Label for the upload signed declaration field',
            id: 'event.death.action.declare.form.review.signedDeclaration.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: hasNonHealthNotifierRole
            }
          ]
        }
  ]
}

export const DEATH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Death declaration form',
    id: 'event.death.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [
    deathIntroduction,
    deceased,
    eventDetails,
    burial,
    father,
    mother,
    spouse,
    livingChildren,
    informant,
    documents,
  ]
})
