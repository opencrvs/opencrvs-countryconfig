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
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  not
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
      type: FieldType.PARAGRAPH,
      id: 'review.alphaPrint.step1.header',
      label: {
        defaultMessage:
          'Step 1: Print the declaration summary for the informant(s) to review and sign.',
        id: 'event.birth.action.declare.form.review.alphaPrint.step1.header.label',
        description: 'Label for the alpha print step 1 header in the review section'
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
      type: FieldType.PARAGRAPH,
      id: 'review.alphaPrint.header',
      label: {
        defaultMessage: 'Declaration summary',
        id: 'event.birth.action.declare.form.review.alphaPrint.header.label',
        description: 'Label for the declaration summary heading in the review section'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      id: 'review.alphaPrint',
      type: FieldType.ALPHA_PRINT_BUTTON,
      label: {
        defaultMessage: 'Declaration summary',
        id: 'event.birth.action.declare.form.review.alphaPrint.header.label',
        description: 'Label for the alpha print button in the review section'
      },
      configuration: {
        template: 'v2.birth-declaration-summary',
        buttonLabel: {
          defaultMessage: 'Print',
          id: 'event.birth.action.declare.form.review.alphaPrint.label',
          description: 'Label for the alpha print button in the review section'
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
      id: 'review.alphaPrint.step2.header.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    {
      type: FieldType.PARAGRAPH,
      id: 'review.alphaPrint.step2.header',
      label: {
        defaultMessage:
          'Step 2: Upload the signed declaration summary after it has been reviewed and signed by the informant(s).',
        id: 'event.birth.action.declare.form.review.alphaPrint.step2.header.label',
        description: 'Label for the alpha print step 2 header in the review section'
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
      type: FieldType.FILE,
      id: 'review.uploadedSignature',
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Signed declaration summary',
        id: 'event.birth.action.declare.form.review.uploadedSignature.header.label',
        description:
          'Label for the uploaded signature field in the review section'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: not(field('review.alphaPrint').isFalsy())
        },
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
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
