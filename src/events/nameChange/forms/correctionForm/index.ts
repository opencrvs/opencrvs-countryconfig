import {
  and,
  ConditionalType,
  defineActionForm,
  field,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { correctionRequestFields } from './correction-request'
import { requesterDetailsFields } from './requester-details'
import { verifyIdentityFields } from './verify-identity'
import { supportingDocumentsFields } from './supporting-documents'
import { collectPaymentFields } from './collect-payment'

export const CORRECTION_FORM = defineActionForm({
  label: {
    id: 'event.nameChange.action.correction.form.label',
    defaultMessage: 'Correct record',
    description: 'This is the label for the name change correction form'
  },
  pages: [
    // Page 1 - Correction Request
    {
      id: 'correctionRequest',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.nameChange.action.correction.form.section.correctionRequest.title',
        defaultMessage: 'Correction request',
        description: 'This is the title of the section'
      },
      fields: correctionRequestFields
    },
    // Page 2 - ID Validation (Requester's Details)
    {
      id: 'requesterDetails',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.nameChange.action.correction.form.section.requesterDetails.title',
        defaultMessage: "Requester's details",
        description: 'This is the title of the section'
      },
      conditional: field('requester.type').isEqualTo('SOMEONE_ELSE'),
      fields: requesterDetailsFields
    },
    // Page 3a - Verify Their Identity
    {
      id: 'verifyIdentity',
      type: PageTypes.enum.VERIFICATION,
      title: {
        id: 'event.nameChange.action.correction.form.section.verifyIdentity.title',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('requester.type').isEqualTo('REGISTRAR')),
        not(field('requester.type').isEqualTo('COURT')),
        not(field('requester.type').isEqualTo('SOMEONE_ELSE')),
        not(field('requester.type').isEqualTo('MOTHER')),
        not(field('requester.type').isEqualTo('FATHER'))
      ),
      fields: verifyIdentityFields,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.nameChange.action.correction.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.nameChange.action.correction.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Proceed without proof of ID',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.nameChange.action.correction.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for this correction without the necessary proof of ID from the requester',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.nameChange.action.correction.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    // Page 4 - Supporting Documents
    {
      id: 'supportingDocuments',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.nameChange.action.correction.form.section.supportingDocuments.title',
        defaultMessage: 'Supporting documents',
        description: 'This is the title of the section'
      },
      fields: supportingDocumentsFields
    },
    // Page 5 - Collect Payment
    {
      id: 'collectPayment',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.nameChange.action.correction.form.section.collectPayment.title',
        defaultMessage: 'Collect payment',
        description: 'This is the title of the section'
      },
      fields: collectPaymentFields
    }
  ]
})
