import {
  DocumentMimeType,
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
    id: 'documents.supportingDocs',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    label: {
      defaultMessage: 'Supporting documents',
      description: 'Label for the supporting documents field',
      id: 'event.death.action.correction.documents.supportingDocs.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'STATUTORY_DECLARATION',
        label: {
          defaultMessage: 'Statutory Declaration',
          description: 'Label for the statutory declaration option',
          id: 'event.death.action.correction.documents.supportingDocs.statutoryDeclaration.label'
        }
      },
      {
        value: 'COURT_ORDER',
        label: {
          defaultMessage: 'Court Order',
          description: 'Label for the court order option',
          id: 'event.death.action.correction.documents.supportingDocs.courtOrder.label'
        }
      },
      {
        value: 'AUTHORITY_LETTER',
        label: {
          defaultMessage:
            'Registrar General / Registration Officer authorization',
          description: 'Label for the authority letter option',
          id: 'event.death.action.correction.documents.supportingDocs.authorityLetter.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.death.action.correction.documents.supportingDocs.other.label'
        }
      }
    ]
  }
]
