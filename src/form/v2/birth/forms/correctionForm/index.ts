import {
  and,
  defineActionForm,
  field,
  FieldType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { correctionFormRequesters } from './requester'

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
      // TODO FIX conditonals
      conditional: and(
        not(field('requester.type').isEqualTo('ANOTHER_AGENT')),
        not(field('requester.type').isEqualTo('ME'))
      ),
      fields: [],
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'v2.event.birth.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'v2.event.birth.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'v2.event.birth.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'v2.event.birth.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    }
  ]
})
