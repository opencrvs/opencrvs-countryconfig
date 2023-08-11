import { formMessageDescriptors } from '../common/messages'
import { ISerializedFormSection } from '../types/types'
import { certificateHandlebars } from './certficate-handlebars'

export const registrationSection = {
  id: 'registration',
  viewType: 'hidden',
  name: {
    defaultMessage: 'Registration',
    description: 'Form section name for Registration',
    id: 'form.section.declaration.name'
  },
  groups: [],
  mapping: {
    template: [
      {
        fieldName: certificateHandlebars.registrationNumber,
        operation: 'registrationNumberTransformer'
      },
      {
        fieldName: certificateHandlebars.qrCode,
        operation: 'QRCodeTransformerTransformer'
      },
      {
        fieldName: certificateHandlebars.certificateDate,
        operation: 'certificateDateTransformer',
        parameters: ['en', 'dd MMMM yyyy']
      },
      {
        fieldName: certificateHandlebars.registrar,
        operation: 'userTransformer',
        parameters: ['REGISTERED']
      },
      {
        fieldName: certificateHandlebars.registrationAgent,
        operation: 'userTransformer',
        parameters: ['VALIDATED']
      },
      {
        fieldName: certificateHandlebars.registrarName,
        operation: 'registrarNameUserTransformer'
      },
      {
        fieldName: certificateHandlebars.role,
        operation: 'roleUserTransformer'
      },
      {
        fieldName: certificateHandlebars.registrarSignature,
        operation: 'registrarSignatureUserTransformer'
      },
      {
        fieldName: certificateHandlebars.registrationDate,
        operation: 'registrationDateTransformer',
        parameters: ['en', 'dd MMMM yyyy']
      },
      {
        fieldName: certificateHandlebars.registrationLocation,
        operation: 'registrationLocationUserTransformer'
      }
    ],
    mutation: {
      operation: 'setDeathRegistrationSectionTransformer'
    },
    query: {
      operation: 'getDeathRegistrationSectionTransformer'
    }
  }
} as ISerializedFormSection

export const deathDocumentExtraValue = {
  DECEASED_ID_PROOF: 'DECEASED_ID_PROOF',
  DECEASED_DEATH_PROOF: 'DECEASED_DEATH_PROOF',
  DECEASED_DEATH_CAUSE_PROOF: 'DECEASED_DEATH_CAUSE_PROOF',
  INFORMANT_ID_PROOF: 'INFORMANT_ID_PROOF'
}

export const deathDocumentType = {
  HOSPITAL_CERTIFICATE_OF_DEATH: 'HOSPITAL_CERTIFICATE_OF_DEATH',
  ATTESTED_LETTER_OF_DEATH: 'ATTESTED_LETTER_OF_DEATH',
  BURIAL_RECEIPT: 'BURIAL_RECEIPT',
  POLICE_CERTIFICATE_OF_DEATH: 'POLICE_CERTIFICATE_OF_DEATH',
  MEDICALLY_CERTIFIED_CAUSE_OF_DEATH: 'MEDICALLY_CERTIFIED_CAUSE_OF_DEATH',
  VERBAL_AUTOPSY_REPORT: 'VERBAL_AUTOPSY_REPORT',
  CORONERS_REPORT: 'CORONERS_REPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
}
export const documentsSection = {
  id: 'documents',
  viewType: 'form',
  name: formMessageDescriptors.documentsName,
  title: formMessageDescriptors.documentsTitle,
  groups: [
    {
      id: 'documents-view-group',
      fields: [
        {
          name: 'paragraph',
          type: 'PARAGRAPH',
          label: formMessageDescriptors.deceasedParagraph,
          initialValue: '',
          validator: []
        },
        {
          name: 'uploadDocForDeceased',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.deceasedIDProof,
          initialValue: '',
          extraValue: deathDocumentExtraValue.DECEASED_ID_PROOF,
          hideAsterisk: true,
          validator: [],
          options: [
            {
              value: deathDocumentType.NATIONAL_ID,
              label: formMessageDescriptors.docTypeNID
            },
            {
              value: deathDocumentType.PASSPORT,
              label: formMessageDescriptors.docTypePassport
            },
            {
              value: deathDocumentType.BIRTH_CERTIFICATE,
              label: formMessageDescriptors.docTypeBirthCert
            },
            {
              value: deathDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            }
          ],
          mapping: {
            mutation: {
              operation: 'eventFieldToAttachmentTransformer'
            },
            query: {
              operation: 'eventAttachmentToFieldTransformer'
            }
          }
        },
        {
          name: 'uploadDocForInformant',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.proofOfInformantsID,
          initialValue: '',
          extraValue: deathDocumentExtraValue.INFORMANT_ID_PROOF,
          hideAsterisk: true,
          validator: [],
          options: [
            {
              value: deathDocumentType.NATIONAL_ID,
              label: formMessageDescriptors.docTypeNID
            },
            {
              value: deathDocumentType.PASSPORT,
              label: formMessageDescriptors.docTypePassport
            },
            {
              value: deathDocumentType.BIRTH_CERTIFICATE,
              label: formMessageDescriptors.docTypeBirthCert
            },
            {
              value: deathDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            }
          ],
          mapping: {
            mutation: {
              operation: 'eventFieldToAttachmentTransformer'
            },
            query: {
              operation: 'eventAttachmentToFieldTransformer'
            }
          }
        },
        {
          name: 'uploadDocForDeceasedDeath',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.deceasedDeathProof,
          initialValue: '',
          extraValue: deathDocumentExtraValue.DECEASED_DEATH_PROOF,
          hideAsterisk: true,
          validator: [],
          options: [
            {
              value: deathDocumentType.ATTESTED_LETTER_OF_DEATH,
              label: formMessageDescriptors.docTypeLetterOfDeath
            },
            {
              value: deathDocumentType.POLICE_CERTIFICATE_OF_DEATH,
              label: formMessageDescriptors.docTypePoliceCertificate
            },
            {
              value: deathDocumentType.HOSPITAL_CERTIFICATE_OF_DEATH,
              label: formMessageDescriptors.docTypeHospitalDeathCertificate
            },
            {
              value: deathDocumentType.CORONERS_REPORT,
              label: formMessageDescriptors.docTypeCoronersReport
            },
            {
              value: deathDocumentType.BURIAL_RECEIPT,
              label: formMessageDescriptors.docTypeCopyOfBurialReceipt
            },
            {
              value: deathDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            }
          ],
          mapping: {
            mutation: {
              operation: 'eventFieldToAttachmentTransformer'
            },
            query: {
              operation: 'eventAttachmentToFieldTransformer'
            }
          }
        },
        {
          name: 'uploadDocForCauseOfDeath',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.causeOfDeathProof,
          initialValue: '',
          extraValue: deathDocumentExtraValue.DECEASED_DEATH_CAUSE_PROOF,
          hideAsterisk: true,
          validator: [],
          conditionals: [
            {
              action: 'hide',
              expression:
                'draftData?.deathEvent?.causeOfDeathEstablished !== "true"'
            }
          ],
          options: [
            {
              value: deathDocumentType.MEDICALLY_CERTIFIED_CAUSE_OF_DEATH,
              label: formMessageDescriptors.medicallyCertified
            },
            {
              value: deathDocumentType.VERBAL_AUTOPSY_REPORT,
              label: formMessageDescriptors.verbalAutopsyReport
            },
            {
              value: deathDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            }
          ],
          mapping: {
            mutation: {
              operation: 'eventFieldToAttachmentTransformer'
            },
            query: {
              operation: 'eventAttachmentToFieldTransformer'
            }
          }
        }
      ]
    }
  ]
} as ISerializedFormSection
