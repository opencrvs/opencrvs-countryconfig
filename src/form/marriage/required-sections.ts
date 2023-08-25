import { getSectionMapping } from '@countryconfig/utils/mapping/section/marriage/mapping-utils'
import { getInformantConditionalForMarriageDocUpload } from '../common/default-validation-conditionals'
import { formMessageDescriptors } from '../common/messages'
import { ISelectOption, ISerializedFormSection } from '../types/types'
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
  mapping: getSectionMapping('registration')
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
