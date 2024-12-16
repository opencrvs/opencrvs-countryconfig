import { getSectionMapping } from '@countryconfig/utils/mapping/section/birth/mapping-utils'
import { formMessageDescriptors } from '../common/messages'
import { ISerializedFormSection } from '../types/types'
import { getFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'

export const registrationSection = {
  id: 'registration', // A hidden 'registration' section must be included to store identifiers in a form draft that are used in certificates
  viewType: 'hidden',
  name: {
    defaultMessage: 'Registration',
    description: 'Form section name for Registration',
    id: 'form.section.declaration.name'
  },
  groups: [],
  mapping: getSectionMapping('registration')
} as ISerializedFormSection

export const birthDocumentExtraValue = {
  CHILD: 'CHILD',
  FATHER: 'FATHER',
  MOTHER: 'MOTHER',
  PARENT: 'PARENT',
  OTHER: 'OTHER',
  INFORMANT_ID_PROOF: 'INFORMANT_ID_PROOF',
  LEGAL_GUARDIAN_PROOF: 'LEGAL_GUARDIAN_PROOF'
}

export const birthDocumentType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER',
  NOTIFICATION_OF_BIRTH: 'NOTIFICATION_OF_BIRTH',
  NOTIFICATION_OF_BIRTH_VERSO: 'NOTIFICATION_OF_BIRTH_VERSO',
  PROOF_OF_LEGAL_GUARDIANSHIP: 'PROOF_OF_LEGAL_GUARDIANSHIP',
  PROOF_OF_ASSIGNED_RESPONSIBILITY: 'PROOF_OF_ASSIGNED_RESPONSIBILITY',
  ADOPTION_LETTER: 'ADOPTION_LETTER',
  LIVRET_DE_FAMILLE: 'LIVRET_DE_FAMILLE',
  RECOGNITION_ACT: 'RECOGNITION_ACT'
}

export const documentsSection = {
  id: 'documents',
  viewType: 'form',
  name: formMessageDescriptors.documentsName,
  title: {
    defaultMessage: 'Attaching supporting documents',
    description: 'Form section title for Documents',
    id: 'form.section.documents.title'
  },
  groups: [
    {
      id: 'documents-view-group',
      fields: [
        {
          name: 'paragraph',
          type: 'PARAGRAPH',
          label: formMessageDescriptors.documentsParagraph,
          initialValue: '',
          validator: []
        },
        {
          name: 'uploadDocForChildDOB',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.proofOfBirth,
          initialValue: '',
          extraValue: birthDocumentExtraValue.CHILD,
          hideAsterisk: true,
          maxSizeMB: 10,
          validator: [],
          options: [
            {
              value: birthDocumentType.NOTIFICATION_OF_BIRTH,
              label: formMessageDescriptors.docTypeChildBirthProof
            },
            {
              value: birthDocumentType.NOTIFICATION_OF_BIRTH_VERSO,
              label: formMessageDescriptors.docTypeChildBirthProofVerso
            }
          ],
          mapping: getFieldMapping('documents')
        },
        {
          name: 'uploadDocForRecognition',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.proofOfRecognition,
          initialValue: '',
          maxSizeMB: 10,
          extraValue: birthDocumentExtraValue.OTHER,
          validator: [],
          required: true,
          options: [
            {
              value: birthDocumentType.RECOGNITION_ACT,
              label: formMessageDescriptors.docTypeRecognitionAct
            }
          ],
          conditionals: [
            {
              description: 'Hidden unless marginal mention is Recognition',
              action: 'hide',
              expression:
                '!draftData || !draftData.mention || !Array.from({ length: 10 }, (_,i) => "typeOfMention__" + i).some(key => draftData.mention[key] === "RECOGNITION")'
            }
          ],
          mapping: getFieldMapping('documents')
        },
        {
          name: 'uploadDocForMother',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.proofOfMothersID,
          initialValue: '',
          maxSizeMB: 10,
          extraValue: birthDocumentExtraValue.MOTHER,
          hideAsterisk: true,
          validator: [],
          options: [
            {
              value: birthDocumentType.NATIONAL_ID,
              label: formMessageDescriptors.docTypeNID
            },
            {
              value: birthDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            },
            {
              value: birthDocumentType.PASSPORT,
              label: formMessageDescriptors.docTypePassport
            },
            {
              value: birthDocumentType.BIRTH_CERTIFICATE,
              label: formMessageDescriptors.docTypeBirthCert
            }
          ],
          conditionals: [
            {
              description: 'Hidden for Parent Details none or Mother only',
              action: 'hide',
              expression:
                '(draftData && draftData.mother && !draftData.mother.detailsExist) || Array.from({ length: 10 }, (_,i) => "typeOfMention__" + i).some(key => draftData.mention[key] === "RECOGNITION")'
            }
          ],
          mapping: getFieldMapping('documents')
        },
        {
          name: 'uploadDocForFather',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.proofOfFathersID,
          initialValue: '',
          maxSizeMB: 10,
          extraValue: birthDocumentExtraValue.FATHER,
          validator: [
            {
              operation: 'isFatherRecognitionDocNeeded',
              parameters: []
            }
          ],
          options: [
            {
              value: birthDocumentType.NATIONAL_ID,
              label: formMessageDescriptors.docTypeNID
            },
            {
              value: birthDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            },
            {
              value: birthDocumentType.PASSPORT,
              label: formMessageDescriptors.docTypePassport
            },
            {
              value: birthDocumentType.BIRTH_CERTIFICATE,
              label: formMessageDescriptors.docTypeBirthCert
            },
            {
              value: birthDocumentType.RECOGNITION_ACT,
              label: formMessageDescriptors.docTypeRecognitionAct
            },
            {
              value: birthDocumentType.LIVRET_DE_FAMILLE,
              label: formMessageDescriptors.docTypeLivretDeFamille
            }
          ],
          conditionals: [
            {
              description: 'Hidden for Parent Details none or Father only',
              action: 'hide',
              expression:
                'draftData && draftData.father && !draftData.father.detailsExist'
            }
          ],
          mapping: getFieldMapping('documents')
        },
        {
          name: 'uploadDocForInformant',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.proofOfInformantsID,
          initialValue: '',
          maxSizeMB: 10,
          extraValue: birthDocumentExtraValue.INFORMANT_ID_PROOF,
          hideAsterisk: true,
          validator: [],
          options: [
            {
              value: birthDocumentType.NATIONAL_ID,
              label: formMessageDescriptors.docTypeNID
            },
            {
              value: birthDocumentType.OTHER,
              label: formMessageDescriptors.docTypeOther
            },
            {
              value: birthDocumentType.PASSPORT,
              label: formMessageDescriptors.docTypePassport
            },
            {
              value: birthDocumentType.BIRTH_CERTIFICATE,
              label: formMessageDescriptors.docTypeBirthCert
            }
          ],
          conditionals: [
            {
              action: 'hide',
              expression:
                "draftData?.informant?.informantType === 'MOTHER' || draftData?.informant?.informantType === 'FATHER'"
            }
          ],
          mapping: getFieldMapping('documents')
        },
        {
          name: 'uploadDocForProofOfLegalGuardian',
          type: 'DOCUMENT_UPLOADER_WITH_OPTION',
          label: formMessageDescriptors.otherBirthSupportingDocuments,
          initialValue: '',
          maxSizeMB: 10,
          extraValue: birthDocumentExtraValue.LEGAL_GUARDIAN_PROOF,
          hideAsterisk: true,
          validator: [],
          options: [
            {
              value: birthDocumentType.PROOF_OF_LEGAL_GUARDIANSHIP,
              label: formMessageDescriptors.legalGuardianProof
            },
            {
              value: birthDocumentType.PROOF_OF_ASSIGNED_RESPONSIBILITY,
              label: formMessageDescriptors.assignedResponsibilityProof
            }
          ],
          conditionals: [
            {
              action: 'hide',
              expression:
                "(draftData && draftData.registration && draftData.registration.informantType && selectedInformantAndContactType.selectedInformantType && (selectedInformantAndContactType.selectedInformantType === 'MOTHER' || selectedInformantAndContactType.selectedInformantType === 'FATHER'))"
            }
          ],
          mapping: getFieldMapping('documents')
        }
      ]
    }
  ]
} satisfies ISerializedFormSection

export const previewSection = {
  id: 'preview',
  viewType: 'preview',
  name: formMessageDescriptors.previewName,
  title: formMessageDescriptors.previewTitle,
  groups: [
    {
      id: 'preview-view-group',
      fields: []
    }
  ]
} satisfies ISerializedFormSection

export const reviewSection = {
  id: 'review',
  viewType: 'review',
  name: formMessageDescriptors.reviewName,
  title: formMessageDescriptors.reviewTitle,
  groups: [
    {
      id: 'review-view-group',
      fields: []
    }
  ]
} satisfies ISerializedFormSection
