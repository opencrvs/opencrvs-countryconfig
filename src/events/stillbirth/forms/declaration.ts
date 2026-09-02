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
  ConditionalType,
  defineDeclarationForm,
  field,
  FieldType,
  not
} from '@opencrvs/toolkit/events'

import { introduction } from './pages/introduction'
import { eventDetails } from './pages/eventDetails'
import { mother } from './pages/mother'
import { father } from './pages/father'
import { informant } from './pages/informant'
import { documents } from './pages/documents'

/** Registration is happening 14 or more days after the date of delivery — the review step requires a signed physical declaration. */
const isLateRegistration = not(
  field('eventDetails.dateOfDelivery').isAfter().days(14).inPast()
)

export const STILLBIRTH_DECLARATION_REVIEW = {
  title: {
    id: 'event.stillbirth.action.declare.form.review.title',
    defaultMessage: 'Stillbirth declaration',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.step1.hint',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Step 1',
        description: 'Hint label for step 1 of the review',
        id: 'event.stillbirth.action.declare.form.review.step1.hint.label'
      },
      configuration: { styles: { hint: true } },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isLateRegistration }
      ]
    },
    {
      id: 'review.step1.description',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Print the declaration summary for the informant(s) to review and sign.',
        description: 'Description for step 1 of the review',
        id: 'event.stillbirth.action.declare.form.review.step1.description.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isLateRegistration }
      ]
    },
    {
      id: 'review.printButton',
      type: FieldType.ALPHA_PRINT_BUTTON,
      required: true,
      label: {
        defaultMessage: 'Print declaration summary',
        description: 'Label for the print declaration summary button',
        id: 'event.stillbirth.action.declare.form.review.printButton.label'
      },
      configuration: {
        template: 'v2.stillbirth-summary',
        buttonLabel: {
          defaultMessage: 'Print declaration summary',
          description: 'Button label for print declaration summary',
          id: 'event.stillbirth.action.declare.form.review.printButton.buttonLabel'
        }
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isLateRegistration }
      ]
    },
    {
      id: 'review.step2.hint',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Step 2',
        description: 'Hint label for step 2 of the review',
        id: 'event.stillbirth.action.declare.form.review.step2.hint.label'
      },
      configuration: { styles: { hint: true } },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isLateRegistration }
      ]
    },
    {
      id: 'review.step2.description',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Upload the signed declaration summary after it has been reviewed and signed by the informant(s).',
        description: 'Description for step 2 of the review',
        id: 'event.stillbirth.action.declare.form.review.step2.description.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isLateRegistration }
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
        id: 'event.stillbirth.action.declare.form.review.signedDeclaration.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isLateRegistration }
      ]
    }
  ]
}

export const STILLBIRTH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Stillbirth declaration form',
    id: 'event.stillbirth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },
  pages: [introduction, eventDetails, mother, father, informant, documents]
})
