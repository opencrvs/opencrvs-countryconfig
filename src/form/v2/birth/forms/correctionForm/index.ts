import {
  and,
  defineActionForm,
  field,
  FieldType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { correctionFormRequesters } from './requester'
import { correctionRequesterIdentityVerify } from './requester-identity-verify'

export const CORRECTION_FORM = defineActionForm({
  label: {
    id: 'v2.event.birth.action.correction.form.label',
    defaultMessage: 'Correct record',
    description: 'This is the label for the birth correction form'
  },
  pages: [
    {
      id: 'requester',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.correction.form.section.requester.title',
        defaultMessage: 'Correction requester',
        description: 'This is the title of the section'
      },
      fields: [
        {
          type: FieldType.PARAGRAPH,
          id: 'requester.paragraph',
          label: {
            id: 'v2.event.birth.action.correction.form.section.requester.paragraph.label',
            defaultMessage: 'Correction requester',
            description:
              'This is the label for the correction requester paragraph'
          }
        },
        ...correctionFormRequesters
      ]
    },
    {
      id: 'requester.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      title: {
        id: 'v2.event.birth.action.correction.form.section.requester.identity.verify.title',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(field('requester.type').isEqualTo('ANOTHER_AGENT')),
        not(field('requester.type').isEqualTo('ME'))
      ),
      fields: correctionRequesterIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'v2.event.birth.action.correction.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'v2.event.birth.action.correction.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Correct without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'v2.event.birth.action.correction.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for making a change to this record without the necessary proof of identification',
              description:
                'This is the body for the verification cancellation modal',
              id: 'v2.event.birth.action.correction.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'payment',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.correction.',
        defaultMessage: 'Collect Payment',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'payment.data',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.correction.payment.data.label'
          },
          conditionals: [],
          configuration: {
            data: []
          }
        }
      ]
    }
  ]
})
