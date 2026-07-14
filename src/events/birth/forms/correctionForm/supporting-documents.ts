import {
  ConditionalType,
  DocumentMimeType,
  field,
  FieldConfig,
  FieldType,
  ImageMimeType
} from '@opencrvs/toolkit/events'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

export const supportingDocumentsFields: FieldConfig[] = [
  {
    id: 'documents.proofOfIdentity',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    label: {
      defaultMessage: 'Proof of identity',
      description: 'Label for the proof of identity field',
      id: 'event.birth.action.correction.documents.proofOfIdentity.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'PASSPORT',
        label: {
          defaultMessage: 'Passport',
          description: 'Label for the passport option',
          id: 'event.birth.action.correction.documents.proofOfIdentity.passport.label'
        }
      },
      {
        value: 'BIRTH_CERTIFICATE',
        label: {
          defaultMessage: 'Birth certificate',
          description: 'Label for the birth certificate option',
          id: 'event.birth.action.correction.documents.proofOfIdentity.birthCertificate.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.birth.action.correction.documents.proofOfIdentity.other.label'
        }
      }
    ],
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'documents.supportingDocs',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    label: {
      defaultMessage: 'Supporting documents',
      description: 'Label for the supporting documents field',
      id: 'event.birth.action.correction.documents.supportingDocs.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'PROOF_OF_PARENTS_MARRIAGE',
        label: {
          defaultMessage: "Proof of parent's marriage",
          description: 'Label for the proof of parents marriage option',
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
        value: 'STATUTORY_DECLARATION',
        label: {
          defaultMessage: 'Statutory declaration',
          description: 'Label for the statutory declaration option',
          id: 'event.birth.action.correction.documents.supportingDocs.statutoryDeclaration.label'
        }
      },
      {
        value: 'PROOF_OF_PARENTAGE_OR_GUARDIANSHIP',
        label: {
          defaultMessage: 'Proof of parentage or guardianship',
          description:
            'Label for the proof of parentage or guardianship option',
          id: 'event.birth.action.correction.documents.supportingDocs.proofOfParentageOrGuardianship.label'
        }
      },
      {
        value: 'COURT_ORDER',
        label: {
          defaultMessage: 'Court order',
          description: 'Label for the court order option',
          id: 'event.birth.action.correction.documents.supportingDocs.courtOrder.label'
        }
      },
      {
        value: 'REGISTRAR_GENERAL_AUTHORISATION',
        label: {
          defaultMessage: 'Registrar general / registrar authorisation',
          description: 'Label for the registrar general authorisation option',
          id: 'event.birth.action.correction.documents.supportingDocs.registrarGeneralAuthorisation.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.birth.action.correction.documents.supportingDocs.other.label'
        }
      }
    ]
  }
]
