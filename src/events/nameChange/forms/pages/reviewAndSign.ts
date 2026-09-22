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
  defineFormPage,
  FieldType,
  PageTypes,
  ImageMimeType,
  ConditionalType,
  field,
  not,
  user,
  and,
  or
} from '@opencrvs/toolkit/events'
import { emptyMessage, hasNonHealthNotifierRole } from '@countryconfig/events/utils'
import { DEFAULT_FILE_CONFIGURATION } from '@countryconfig/events/fileTypeConfig'

export const dontShowToHealthAdmin = hasNonHealthNotifierRole

export const reviewAndSign = defineFormPage({
  id: 'reviewAndSign',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Review',
    description: 'Form section title for review',
    id: 'event.nameChange.action.declare.form.section.reviewAndSign.title'
  },
  fields: [
    {
      id: 'review.alphaPrint.step1.header.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
        }
      ]
    },
    {
      type: FieldType.HEADING,
      id: 'review.alphaPrint.step1.header',
      label: {
        defaultMessage: 'Step 1',
        id: 'event.nameChange.action.declare.form.review.alphaPrint.step1.header.label',
        description: 'Label for step 1 header in the review section'
      },
      configuration: { styles: { fontVariant: 'reg16' as const } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
        }
      ]
    },
    {
      type: FieldType.HEADING,
      id: 'review.alphaPrint.header',
      label: {
        defaultMessage:
          'Print the deed poll declaration summary for the informant(s) to review and sign.',
        id: 'event.nameChange.action.declare.form.review.alphaPrint.header.label',
        description:
          'Label for the alpha print button header in the review section'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
        }
      ]
    },
    {
      id: 'review.alphaPrint',
      type: FieldType.ALPHA_PRINT_BUTTON,
      label: {
        defaultMessage: 'Deed poll declaration summary',
        id: 'event.nameChange.action.declare.form.review.alphaPrint.label',
        description: 'Label for the alpha print button in the review section'
      },
      hideLabel: false,
      configuration: {
        buttonLabel: {
          defaultMessage: 'Print declaration summary',
          id: 'event.nameChange.action.declare.form.review.alphaPrint.buttonLabel',
          description: 'Label for the print button'
        },
        template: 'name-change-certified-certificate'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
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
          conditional: dontShowToHealthAdmin
        }
      ]
    },
    {
      type: FieldType.HEADING,
      id: 'review.alphaPrint.step2.header',
      label: {
        defaultMessage: 'Step 2',
        id: 'event.nameChange.action.declare.form.review.alphaPrint.step2.header.label',
        description: 'Label for step 2 header in the review section'
      },
      configuration: { styles: { fontVariant: 'reg16' as const } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
        }
      ]
    },
    {
      type: FieldType.HEADING,
      id: 'review.uploadedSignature.description',
      label: {
        defaultMessage:
          'Upload the signed deed poll declaration summary after it has been reviewed and signed by the informant(s).',
        id: 'event.nameChange.action.declare.form.review.uploadedSignature.label',
        description:
          'Label for the uploaded signature field in the review section'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
        }
      ]
    },
    {
      type: FieldType.FILE,
      id: 'review.uploadedSignature',
      required: false,
      label: {
        defaultMessage: 'Upload signed declaration',
        id: 'event.nameChange.action.declare.form.review.uploadedSignature.buttonLabel',
        description: 'Button label for uploading signed declaration'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: not(field('review.alphaPrint').isFalsy())
        },
        {
          type: ConditionalType.SHOW,
          conditional: dontShowToHealthAdmin
        }
      ]
    }
  ]
})
