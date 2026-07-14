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
  user,
  DocumentMimeType,
  field,
  ImageMimeType,
} from '@opencrvs/toolkit/events'
import { emptyMessage, hasNonHealthNotifierRole } from '@countryconfig/events/utils'
import { child } from './pages/child'
import { nameChanges } from './pages/nameChanges'
import { informant } from './pages/informant'
import { introduction } from './pages/introduction'
import { mother } from './pages/mother'
import { father } from './pages/father'
import { documents } from './pages/documents'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

export const BIRTH_DECLARATION_REVIEW = {
  title: {
    id: 'event.birth.action.declare.form.review.title',
    defaultMessage:
      '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.step1.hint',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Step 1',
        description: 'Hint label for step 1 of the review',
        id: 'event.birth.action.declare.form.review.step1.hint.label'
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
        id: 'event.birth.action.declare.form.review.step1.description.label'
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
        id: 'event.birth.action.declare.form.review.printButton.label'
      },
      configuration: {
        template: 'v2.birth-summary',
        buttonLabel: {
          defaultMessage: 'Print declaration summary',
          description: 'Button label for print declaration summary',
          id: 'event.birth.action.declare.form.review.printButton.buttonLabel'
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
        id: 'event.birth.action.declare.form.review.step2.hint.label'
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
        id: 'event.birth.action.declare.form.review.step2.description.label'
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
        id: 'event.birth.action.declare.form.review.signedDeclaration.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'summary.notificationReciept.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional:
            and(not(status('DECLARED')), not(status('REGISTERED')), status('NOTIFIED'), hasNonHealthNotifierRole)
        }
      ]
    },
    {
      id: 'review.alphaPrint.healthNotifier.description',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'Print the declaration Birth Notification Receipt.',
        description: 'Description for the health notifier print declaration',
        id: 'event.birth.action.declare.form.review.alphaPrint.healthNotifier.description.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(not(status('DECLARED')), not(status('REGISTERED')), status('NOTIFIED'), hasNonHealthNotifierRole)
        }
      ]
    },
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
          defaultMessage: 'Print Notification Receipt',
          id: 'event.birth.action.declare.form.review.alphaPrint.healthNotifier.button.label',
          description: 'Label for the health notifier print notification receipt button'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(not(status('DECLARED')), not(status('REGISTERED')), status('NOTIFIED'), hasNonHealthNotifierRole)
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
