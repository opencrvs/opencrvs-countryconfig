import { DEFAULT_FILE_CONFIGURATION } from '@countryconfig/events/fileTypeConfig'
import {
  defineFormPage,
  FieldType,
  PageTypes,
  ImageMimeType
} from '@opencrvs/toolkit/events'

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for documents',
    id: 'event.adoption.form.documents.title'
  },
  fields: [
    {
      id: 'documents.childBirthCertificate',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      analytics: true,
      label: {
        defaultMessage: "Child's birth certificate (existing/original record)",
        description: 'Label for uploading child birth certificate',
        id: 'event.adoption.form.documents.childBirthCertificate.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'BIRTH_CERTIFICATE',
          label: {
            defaultMessage: 'Birth certificate',
            description: 'Option label for birth certificate',
            id: 'event.adoption.form.documents.childBirthCertificate.option.label'
          }
        },
        {
          value: 'OTHER',
          label: {
            defaultMessage: 'Other',
            description: 'Option label for Other certificate',
            id: 'event.adoption.form.documents.other.option.label'
          }
        }
      ]
    },
    {
      id: 'documents.consentForm',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      analytics: true,
      label: {
        defaultMessage: 'Consent form from birth parents / guardian',
        description: 'Label for uploading consent form',
        id: 'event.adoption.form.documents.consentForm.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'CONSENT_FORM',
          label: {
            defaultMessage: 'Consent form',
            description: 'Option label for consent form',
            id: 'event.adoption.form.documents.consentForm.option.label'
          }
        },
        {
          value: 'OTHER',
          label: {
            defaultMessage: 'Other',
            description: 'Option label for Other certificate',
            id: 'event.adoption.form.documents.other.option.label'
          }
        }
      ]
    },
    {
      id: 'documents.proofOfAdoptiveFather',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      analytics: true,
      label: {
        defaultMessage: "Proof of adoptive father's identity",
        description: 'Label for uploading adoptive father identity proof',
        id: 'event.adoption.form.documents.proofOfAdoptiveFather.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'BIRTH_CERTIFICATE',
          label: {
            defaultMessage: 'Birth Certificate',
            description: 'Option for birth certificate',
            id: 'event.adoption.form.documents.proofOfAdoptiveFather.option.birthCertificate'
          }
        },
        {
          value: 'PASSPORT',
          label: {
            defaultMessage: 'Passport',
            description: 'Option for passport',
            id: 'event.adoption.form.documents.proofOfAdoptiveFather.option.passport'
          }
        },
        {
          value: 'OTHER',
          label: {
            defaultMessage: 'Other',
            description: 'Option for other identity proof',
            id: 'event.adoption.form.documents.proofOfAdoptiveFather.option.other'
          }
        }
      ]
    },
    {
      id: 'documents.proofOfAdoptiveMother',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      analytics: true,
      label: {
        defaultMessage: "Proof of adoptive mother's identity",
        description: 'Label for uploading adoptive mother identity proof',
        id: 'event.adoption.form.documents.proofOfAdoptiveMother.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'BIRTH_CERTIFICATE',
          label: {
            defaultMessage: 'Birth Certificate',
            description: 'Option for birth certificate',
            id: 'event.adoption.form.documents.proofOfAdoptiveMother.option.birthCertificate'
          }
        },
        {
          value: 'PASSPORT',
          label: {
            defaultMessage: 'Passport',
            description: 'Option for passport',
            id: 'event.adoption.form.documents.proofOfAdoptiveMother.option.passport'
          }
        },
        {
          value: 'OTHER',
          label: {
            defaultMessage: 'Other',
            description: 'Option for other identity proof',
            id: 'event.adoption.form.documents.proofOfAdoptiveMother.option.other'
          }
        }
      ]
    },
    {
      id: 'documents.maritalStatusProof',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      analytics: true,
      label: {
        defaultMessage: 'Proof of marital status of adoptive parents',
        description: 'Label for uploading marital status proof',
        id: 'event.adoption.form.documents.maritalStatusProof.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'MARRIAGE_CERTIFICATE',
          label: {
            defaultMessage: 'Marriage certificate',
            description: 'Option for marriage certificate',
            id: 'event.adoption.form.documents.maritalStatusProof.option.marriageCertificate'
          }
        },
        {
          value: 'OTHER',
          label: {
            defaultMessage: 'Other',
            description: 'Option label for Other certificate',
            id: 'event.adoption.form.documents.other.option.label'
          }
        }
      ]
    },
    {
      id: 'documents.adoptionOrder',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      analytics: true,
      label: {
        defaultMessage: 'Adoption order',
        description: 'Label for uploading adoption order',
        id: 'event.adoption.form.documents.adoptionOrder.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'ADOPTION_ORDER',
          label: {
            defaultMessage: 'Adoption order',
            description: 'Option label for adoption order',
            id: 'event.adoption.form.documents.adoptionOrder.option.label'
          }
        }
      ]
    }
  ]
})
