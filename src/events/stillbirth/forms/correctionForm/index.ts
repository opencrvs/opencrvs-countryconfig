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
  defineActionForm,
  field,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { correctionRequestFields } from './correction-request'
import { requesterDetailsFields } from './requester-details'
import { correctionRequesterIdentityVerify } from './requester-identity-verify'
import { supportingDocumentsFields } from './supporting-documents'

const isSomeoneElse = field('requester.type').isEqualTo('SOMEONE_ELSE')

export const STILLBIRTH_CORRECTION_FORM = defineActionForm({
  label: {
    id: 'event.stillbirth.action.request-correction.label',
    defaultMessage: 'Request correction',
    description:
      'This is shown as the action name anywhere the user can trigger the action from'
  },
  pages: [
    {
      id: 'correctionRequest',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.stillbirth.action.correction.form.section.correctionRequest.title',
        defaultMessage: 'Correction request',
        description: 'This is the title of the section'
      },
      fields: correctionRequestFields
    },
    {
      id: 'requesterDetails',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.stillbirth.action.correction.form.section.requesterDetails.title',
        defaultMessage: "Requester's details",
        description: 'This is the title of the section'
      },
      conditional: isSomeoneElse,
      fields: requesterDetailsFields
    },
    {
      id: 'verifyIdentity',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: {
        id: 'event.stillbirth.action.correction.form.section.verifyIdentity.title',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('requester.type').isEqualTo('REGISTRAR')),
        not(field('requester.type').isEqualTo('COURT'))
      ),
      fields: correctionRequesterIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.stillbirth.action.correction.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.stillbirth.action.correction.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Proceed without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.stillbirth.action.correction.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for this correction without the necessary proof of ID from the requester',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.stillbirth.action.correction.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'supportingDocuments',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.stillbirth.action.correction.form.section.supportingDocuments.title',
        defaultMessage: 'Supporting documents',
        description: 'This is the title of the section'
      },
      fields: supportingDocumentsFields
    }
  ]
})
