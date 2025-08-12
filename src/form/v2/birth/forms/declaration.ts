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
  never
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import { child } from './pages/child'
import { informant } from './pages/informant'
import { introduction } from './pages/introduction'
import { mother } from './pages/mother'
import { father } from './pages/father'
import { DEFAULT_FILE_CONFIGURATION, documents } from './pages/documents'
import { emptyMessage } from '../../utils'

export const BIRTH_DECLARATION_REVIEW = {
  title: {
    id: 'v2.event.birth.action.declare.form.review.title',
    defaultMessage:
      '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
    description: 'Title of the form to show in review page'
  },
  fields: [
    {
      id: 'review.comment',
      type: FieldType.TEXTAREA,
      label: {
        defaultMessage: 'Comment',
        id: 'v2.event.birth.action.declare.form.review.comment.label',
        description: 'Label for the comment field in the review section'
      },
      required: true
    },
    {
      type: FieldType.SIGNATURE,
      id: 'review.signature',
      required: true,
      label: {
        defaultMessage: 'Signature of informant',
        id: 'v2.event.birth.action.declare.form.review.signature.label',
        description: 'Label for the signature field in the review section'
      },
      signaturePromptLabel: {
        id: 'v2.signature.upload.modal.title',
        defaultMessage: 'Draw signature',
        description: 'Title for the modal to draw signature'
      }
    },
    {
      id: 'review.reviewDivider_1',
      type: FieldType.DIVIDER,
      label: emptyMessage
      // FIXME: fix conditionals
      // conditionals: [
      //   {
      //     type: ConditionalType.DISPLAY_ON_REVIEW,
      //     conditional: user.hasScope('SCOPES.RECORD_REGISTER')
      //   }
      // ]
    },
    {
      id: 'review.reviewHelper_1',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Offline flow',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.review.reviewHelper_1.label'
      },
      configuration: { styles: { fontVariant: 'h3' as const } }
    },
    {
      id: 'review.noAdvancePrintCertificate',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage:
          'I don’t want to print a certificate in advance of registration',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.review.field.noAdvancePrintCertificate.label'
      }
    },
    {
      id: 'review.reviewHelper_2',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Step 1',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.review.reviewHelper_2.label'
      },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'review.reviewHelper_3',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Complete the details below to print the certificate',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.review.reviewHelper_3.label'
      },
      configuration: { styles: { fontVariant: 'h3' as const } },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'review.registrationDate',
      type: FieldType.DATE,
      // required: true,
      label: {
        defaultMessage: 'Registration Date',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.review.field.registrationDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
      // FIXME: fix validation
      // secured: true,
      // validation: [
      //   {
      //     message: {
      //       defaultMessage: 'Must be a valid date',
      //       description: 'This is the error message for invalid date',
      //       id: 'v2.event.birth.action.declare.form.review.field.registrationDate.error'
      //     },
      //     validator: field('review.registrationDate').isBefore().now()
      //   }
      // ],
    },
    {
      id: 'registrar.name',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: "Registrar's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.review.registrar.field.name.label'
      },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      type: FieldType.PRINT_BUTTON,
      id: 'child.printButton',
      label: {
        defaultMessage: 'Print Certificate',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.review.field.printButton.label'
      },
      configuration: {
        template: '',
        buttonLabel: {
          id: 'v2.event.birth.action.declare.form.review.printButton.label',
          defaultMessage: 'Print',
          description: 'Print button for offline flow'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'review.reviewDivider_4',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    // Step 2 ====================>
    {
      id: 'review.reviewHelper_4',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Step 2',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.review.reviewHelper_2.label'
      },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'review.reviewHelper_5',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Upload the signed certificate',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.review.reviewHelper_3.label'
      },
      configuration: { styles: { fontVariant: 'h3' as const } },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'review.signedCertificate',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage:
          'I confirm that the certificate is printed, signed, and stamped',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.review.signedCertificate.label'
      },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'review.uploadCertificate',
      type: FieldType.FILE,
      required: false,
      configuration: {
        ...DEFAULT_FILE_CONFIGURATION,
        style: {
          width: 'auto' as const
        },
        fileName: {
          defaultMessage: 'Upload',
          description: 'This is the label for the file name',
          id: 'v2.form.field.label.uploadCertificate.fileName'
        }
      },
      label: {
        defaultMessage: 'Upload signed certificate',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.review.field.uploadCertificate.label'
      },
      // FIXME: fix conditionals
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('review.noAdvancePrintCertificate').isEqualTo(true)
          )
        }
      ]
    }
    // TODO: When uploaded, show the file name and the attach icon and condition the register button
  ]
}

export const BIRTH_DECLARATION_FORM = defineDeclarationForm({
  label: {
    defaultMessage: 'Birth declaration form',
    id: 'v2.event.birth.action.declare.form.label',
    description: 'This is what this form is referred as in the system'
  },

  pages: [introduction, child, informant, mother, father, documents]
})
