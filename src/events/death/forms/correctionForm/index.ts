import {
  and,
  defineActionForm,
  field,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { correctionRequestFields } from './correction-request'
import { requesterDetailsFields } from './requester-details'
import { deathcorrectionRequesterIdentityVerify } from './requester-identity-verify'
import { supportingDocumentsFields } from './supporting-documents'

export const DEATH_CORRECTION_FORM = defineActionForm({
  label: {
    id: 'event.death.action.correction.form.label',
    defaultMessage: 'Correct record',
    description: 'This is the label for the death correction form'
  },
  pages: [
    {
      id: 'correctionRequest',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.death.action.correction.form.section.correctionRequest.title',
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
        id: 'event.death.action.correction.form.section.requesterDetails.title',
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
        id: 'event.death.action.correction.form.section.verifyIdentity.title',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('requester.type').isEqualTo('ANOTHER_AGENT')),
        not(field('requester.type').isEqualTo('COURT')),
        not(field('requester.type').isEqualTo('SOMEONE_ELSE'))
      ),
      fields: deathcorrectionRequesterIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.death.action.correction.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.death.action.correction.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Correct without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.death.action.correction.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.death.action.correction.form.cancel.confirmation.body'
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
        id: 'event.death.action.correction.form.section.supportingDocuments.title',
        defaultMessage: 'Supporting documents',
        description: 'This is the title of the section'
      },
      fields: supportingDocumentsFields
    },
  ]
})
