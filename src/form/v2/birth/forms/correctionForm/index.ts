import {
  and,
  ConditionalType,
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
            defaultMessage:
              'Note: In the case that the child is now of legal age (18) then only they should be able to request a change to their birth record.',
            description:
              'This is the label for the correction requester paragraph'
          },
          configuration: {
            styles: {
              fontVariant: 'reg16',
              hint: true
            }
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
      id: 'documents',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.correction.form.section.supporting-documents.title',
        defaultMessage: 'Supporting documents',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'documents.supportingDocs',
          type: FieldType.FILE_WITH_OPTIONS,
          label: {
            defaultMessage: 'Supporting documents',
            description: 'Label for the supporting documents field',
            id: 'v2.event.birth.action.correction.documents.supportingDocs.label'
          },
          options: [
            {
              value: 'AFFIDAVIT',
              label: {
                defaultMessage: 'Affidavit',
                description: 'Label for the affidavit option',
                id: 'v2.event.birth.action.correction.documents.supportingDocs.affidavit.label'
              }
            },
            {
              value: 'COURT_DOCUMENT',
              label: {
                defaultMessage: 'Court Document',
                description: 'Label for the court document option',
                id: 'v2.event.birth.action.correction.documents.supportingDocs.courtDocument.label'
              }
            },
            {
              value: 'OTHER',
              label: {
                defaultMessage: 'Other',
                description: 'Label for the other option',
                id: 'v2.event.birth.action.correction.documents.supportingDocs.other.label'
              }
            }
          ]
        },
        {
          id: 'documents.confirmation',
          type: FieldType.RADIO_GROUP,
          required: true,
          defaultValue: 'ATTEST',
          label: {
            defaultMessage: '',
            description: 'Label for the confirmation field',
            id: 'v2.event.birth.action.correction.documents.confirmation.label'
          },
          options: [
            {
              value: 'ATTEST',
              label: {
                defaultMessage:
                  'I attest to seeing supporting documentation and have a copy filed at my office',
                description: 'Label for the attest option',
                id: 'v2.event.birth.action.correction.documents.confirmation.attest.label'
              }
            },
            {
              value: 'NOT_REQUIRED',
              label: {
                defaultMessage: 'No supporting documents required',
                description: 'Label for the not required option',
                id: 'v2.event.birth.action.correction.documents.confirmation.notRequired.label'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'reason',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.correction.form.section.reason.title',
        defaultMessage: 'Reason for correction',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'reason.option',
          type: FieldType.RADIO_GROUP,
          required: true,
          label: {
            defaultMessage: '',
            description: 'Label for the reason for correction field',
            id: 'v2.event.birth.action.correction.reason.option.label'
          },
          options: [
            {
              value: 'CLERICAL_ERROR',
              label: {
                defaultMessage:
                  'Myself or an agent made a mistake (Clerical error)',
                description: 'Label for the clerical error option',
                id: 'v2.event.birth.action.correction.reason.option.clericalError.label'
              }
            },
            {
              value: 'MATERIAL_ERROR',
              label: {
                defaultMessage:
                  'Informant provided incorrect information (Material error)',
                description: 'Label for the material error option',
                id: 'v2.event.birth.action.correction.reason.option.materialError.label'
              }
            },
            {
              value: 'MATERIAL_OMISSION',
              label: {
                defaultMessage:
                  'Informant did not provide this information (Material omission)',
                description: 'Label for the material omission option',
                id: 'v2.event.birth.action.correction.reason.option.materialOmission.label'
              }
            },
            {
              value: 'JUDICIAL_ORDER',
              label: {
                defaultMessage:
                  'Requested to do so by the court (Judicial order)',
                description: 'Label for the judicial order option',
                id: 'v2.event.birth.action.correction.reason.option.judicialOrder.label'
              }
            },
            {
              value: 'OTHER',
              label: {
                defaultMessage: 'Other',
                description: 'Label for the other option',
                id: 'v2.event.birth.action.correction.reason.option.other.label'
              }
            }
          ]
        },
        {
          id: 'reason.comment',
          type: FieldType.TEXTAREA,
          label: {
            defaultMessage: 'Comments',
            description: 'Label for the comments field',
            id: 'v2.event.birth.action.correction.reason.comment.label'
          }
        }
      ]
    },
    {
      id: 'fees',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.correction.form.section.fees.title',
        defaultMessage: 'Fees',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'fees.required',
          required: true,
          type: FieldType.RADIO_GROUP,
          label: {
            defaultMessage: 'Fees required',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.correction.fees.required.label'
          },
          options: [
            {
              value: 'YES',
              label: {
                defaultMessage: 'Yes',
                description: 'Label for the yes option',
                id: 'v2.event.birth.action.correction.fees.required.yes.label'
              }
            },
            {
              value: 'NO',
              label: {
                defaultMessage: 'No',
                description: 'Label for the no option',
                id: 'v2.event.birth.action.correction.fees.required.no.label'
              }
            }
          ]
        },
        {
          id: 'fees.amount',
          type: FieldType.NUMBER,
          required: true,
          label: {
            defaultMessage: 'Total $',
            description: 'Label for the amount field',
            id: 'v2.event.birth.action.correction.fees.amount.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('fees.required').isEqualTo('YES')
            }
          ]
        },
        {
          id: 'fees.proofOfPayment',
          type: FieldType.FILE,
          required: true,
          label: {
            defaultMessage: 'Proof of payment',
            description: 'Label for the proof of payment field',
            id: 'v2.event.birth.action.correction.fees.proofOfPayment.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('fees.required').isEqualTo('YES')
            }
          ]
        }
      ]
    }
  ]
})
