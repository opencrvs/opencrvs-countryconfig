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
    id: 'event.birth.action.correction.form.label',
    defaultMessage: 'Correct record',
    description: 'This is the label for the birth correction form'
  },
  pages: [
    {
      id: 'details',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.correction.form.section.details.title',
        defaultMessage: 'Correction request',
        description: 'This is the title of the section'
      },
      fields: [
        ...correctionFormRequesters,
        {
          id: 'details.divider',
          type: FieldType.DIVIDER,
          label: {
            id: 'event.birth.action.correction.form.section.details.divider.label',
            defaultMessage: '',
            description: 'This is the title of the section'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
            }
          ]
        },
        {
          id: 'reason.option',
          type: FieldType.SELECT,
          required: true,
          label: {
            id: 'event.birth.action.correction.form.section.reason.title',
            defaultMessage: 'Reason for correction',
            description: 'This is the title of the section'
          },
          options: [
            {
              value: 'CLERICAL_ERROR',
              label: {
                defaultMessage:
                  'Myself or an agent made a mistake (Clerical error)',
                description: 'Label for the clerical error option',
                id: 'event.birth.action.correction.reason.option.clericalError.label'
              }
            },
            {
              value: 'MATERIAL_ERROR',
              label: {
                defaultMessage:
                  'Informant provided incorrect information (Material error)',
                description: 'Label for the material error option',
                id: 'event.birth.action.correction.reason.option.materialError.label'
              }
            },
            {
              value: 'MATERIAL_OMISSION',
              label: {
                defaultMessage:
                  'Informant did not provide this information (Material omission)',
                description: 'Label for the material omission option',
                id: 'event.birth.action.correction.reason.option.materialOmission.label'
              }
            },
            {
              value: 'JUDICIAL_ORDER',
              label: {
                defaultMessage:
                  'Requested to do so by the court (Judicial order)',
                description: 'Label for the judicial order option',
                id: 'event.birth.action.correction.reason.option.judicialOrder.label'
              }
            },
            {
              value: 'OTHER',
              label: {
                defaultMessage: 'Other (please specify)',
                description: 'Label for the other option',
                id: 'event.birth.action.correction.reason.option.other.label'
              }
            }
          ]
        },
        {
          id: 'reason.other',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Specify reason',
            description: 'Label for the reason',
            id: 'event.birth.action.correction.reason.other.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('reason.option').isEqualTo('OTHER')
            }
          ]
        }
      ]
    },
    {
      id: 'requester.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.correction.form.section.requester.identity.verify.title',
        defaultMessage: 'Verify ID',
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
              defaultMessage: 'Correct without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.birth.action.correction.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for this correction without the necessary proof of ID from the requester',
              description:
                'This is the body for the verification cancellation modal',
              id: 'correction.corrector.description'
            }
          }
        }
      }
    },
    {
      id: 'documents',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.correction.form.section.supporting-documents.title',
        defaultMessage: 'Upload supporting documents',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'documents.supportingDocs',
          type: FieldType.FILE_WITH_OPTIONS,
          label: {
            defaultMessage: 'Supporting documents',
            description: 'Label for the supporting documents field',
            id: 'event.birth.action.correction.documents.supportingDocs.label'
          },
          options: [
            {
              value: 'PROOF_OF_PARENTS_MARRIAGE',
              label: {
                defaultMessage: "Proof of parent's marriage",
                description:
                  "Label for the proof of parent's marriage option",
                id: 'event.birth.action.correction.documents.supportingDocs.proofOfParentsMarriage.label'
              }
            },
            {
              value: 'LETTER_OF_CONSENT',
              label: {
                defaultMessage: 'Letter of consent',
                description: 'Label for the letter of consent option',
                id: 'event.birth.action.correction.documents.supportingDocs.letterOfConsent.label'
              }
            },
            {
              value: 'STATUORY_DECLARATION',
              label: {
                defaultMessage: 'Statuory declaration',
                description: 'Label for the statuory declaration option',
                id: 'event.birth.action.correction.documents.supportingDocs.statuoryDeclaration.label'
              }
            },
            {
              value: 'PROOF_OF_PARRIANTAGE_OR_GUARDIANSHIP',
              label: {
                defaultMessage: 'Proof of parriantage or guardianship',
                description:
                  'Label for the proof of parriantage or guardianship option',
                id: 'event.birth.action.correction.documents.supportingDocs.proofOfParriantageOrGuardianship.label'
              }
            },
            {
              value: 'COURT_ORDER',
              label: {
                defaultMessage: 'Court Order',
                description: 'Label for the court order option',
                id: 'event.birth.action.correction.documents.supportingDocs.courtOrder.label'
              }
            },
            {
              value: 'REGISTRAR_GENERAL_OR_REGISTRATION_OFFICE',
              label: {
                defaultMessage: 'Registrar General / Registration Office',
                description:
                  'Label for the registrar general / registration office option',
                id: 'event.birth.action.correction.documents.supportingDocs.registrarGeneralOrRegistrationOffice.label'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'fees',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.correction.form.section.fees.title',
        defaultMessage: 'Collect fees',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'fees.amount',
          type: FieldType.NUMBER,
          required: true,
          label: {
            defaultMessage: 'Fee total',
            description: 'Label for the amount field',
            id: 'event.birth.action.correction.fees.amount.label'
          },
          configuration: {
            min: 0,
            prefix: {
              defaultMessage: '$',
              description: 'Prefix for the amount field',
              id: 'event.birth.action.correction.fees.amount.prefix'
            }
          }
        }
      ]
    }
  ]
})
