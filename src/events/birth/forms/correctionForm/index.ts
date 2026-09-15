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

export const CORRECTION_FORM = defineActionForm({
  label: {
    id: 'event.birth.action.correction.form.label',
    defaultMessage: 'Correct record',
    description: 'This is the label for the birth correction form'
  },
  pages: [
    {
      id: 'correctionRequest',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.correction.form.section.correctionRequest.title',
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
        id: 'event.birth.action.correction.form.section.requesterDetails.title',
        defaultMessage: "Requester's details",
        description: 'This is the title of the section'
      },
      conditional: field('requester.type').isEqualTo('SOMEONE_ELSE'),
      fields: requesterDetailsFields
    },
    {
      id: 'verifyIdentity',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.correction.form.section.verifyIdentity.title',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('requester.type').isEqualTo('ANOTHER_AGENT')),
        not(field('requester.type').isEqualTo('COURT')),
        not(field('requester.type').isEqualTo('SOMEONE_ELSE'))
      ),
      fields: correctionRequesterIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.birth.action.correction.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.birth.action.correction.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Proceed without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.birth.action.correction.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for this correction without the necessary proof of ID from the requester',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.birth.action.correction.form.cancel.confirmation.body'
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
        id: 'event.birth.action.correction.form.section.supportingDocuments.title',
        defaultMessage: 'Supporting documents',
        description: 'This is the title of the section'
      },
      fields: supportingDocumentsFields
    }
  ]
})
