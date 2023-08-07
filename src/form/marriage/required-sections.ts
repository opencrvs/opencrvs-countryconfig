import { getInformantConditionalForMarriageDocUpload } from '../common/default-validation-conditionals'
import { formMessageDescriptors } from '../common/messages'
import { ISelectOption, ISerializedFormSection } from '../types/types'
import { certificateHandlebars } from './certificate-handlebars'
import { getDocUploaderForMarriage } from './required-fields'

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
      },
      {
        fieldName: certificateHandlebars.groomSignature,
        operation: 'groomSignatureTransformer'
      },
      {
        fieldName: certificateHandlebars.brideSignature,
        operation: 'brideSignatureTransformer'
      },
      {
        fieldName: certificateHandlebars.witnessOneSignature,
        operation: 'witnessOneSignatureTransformer'
      },
      {
        fieldName: certificateHandlebars.witnessTwoSignature,
        operation: 'witnessTwoSignatureTransformer'
      }
    ],
    mutation: {
      operation: 'setMarriageRegistrationSectionTransformer'
    },
    query: {
      operation: 'getMarriageRegistrationSectionTransformer'
    }
  }
} as ISerializedFormSection

export const marriageDocumentType = {
  MARRIAGE_NOTICE: 'MARRIAGE_NOTICE',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
}

export const getDocSelectOptions: ISelectOption[] = [
  {
    value: marriageDocumentType.NATIONAL_ID,
    label: formMessageDescriptors.docTypeNID
  },
  {
    value: marriageDocumentType.PASSPORT,
    label: formMessageDescriptors.docTypePassport
  },
  {
    value: marriageDocumentType.BIRTH_CERTIFICATE,
    label: formMessageDescriptors.docTypeBirthCert
  },
  {
    value: marriageDocumentType.OTHER,
    label: formMessageDescriptors.docTypeOther
  }
]

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
        getDocUploaderForMarriage(
          'uploadDocForMarriageProof',
          'proofOfMarriageNotice',
          'MARRIAGE_NOTICE_PROOF',
          [
            {
              value: marriageDocumentType.MARRIAGE_NOTICE,
              label: formMessageDescriptors.docTypeMarriageNotice
            }
          ],
          []
        ),
        getDocUploaderForMarriage(
          'uploadDocForGroom',
          'proofOfGroomsID',
          'GROOM',
          getDocSelectOptions,
          []
        ),
        getDocUploaderForMarriage(
          'uploadDocForBride',
          'proofOfBridesID',
          'BRIDE',
          getDocSelectOptions,
          []
        ),
        getDocUploaderForMarriage(
          'uploadDocForInformant',
          'proofOfInformantsID',
          'INFORMANT',
          getDocSelectOptions,
          getInformantConditionalForMarriageDocUpload
        )
      ]
    }
  ]
} as ISerializedFormSection
