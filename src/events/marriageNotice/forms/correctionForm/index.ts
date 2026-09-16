import {
  and,
  ConditionalType,
  defineActionForm,
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'

const documentConfiguration = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

const correctionFields = [
  {
    id: 'requester.type',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'Person requesting the correction',
      id: 'event.marriageNotice.action.correction.requester.label'
    },
    options: [
      { value: 'BRIDE', label: { defaultMessage: 'Bride', description: 'Bride requester', id: 'event.marriageNotice.action.correction.requester.bride' } },
      { value: 'GROOM', label: { defaultMessage: 'Bridegroom', description: 'Bridegroom requester', id: 'event.marriageNotice.action.correction.requester.groom' } },
      { value: 'INFORMANT', label: { defaultMessage: 'Informant', description: 'Informant requester', id: 'event.marriageNotice.action.correction.requester.informant' } },
      { value: 'ANOTHER_AGENT', label: { defaultMessage: 'Registrar / registration office', description: 'Registration agent requester', id: 'event.marriageNotice.action.correction.requester.agent' } },
      { value: 'COURT', label: { defaultMessage: 'Court', description: 'Court requester', id: 'event.marriageNotice.action.correction.requester.court' } },
      { value: 'SOMEONE_ELSE', label: { defaultMessage: 'Someone else', description: 'Other requester', id: 'event.marriageNotice.action.correction.requester.other' } }
    ]
  },
  {
    id: 'reason.option',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Reason for correction',
      description: 'Reason for the correction request',
      id: 'event.marriageNotice.action.correction.reason.label'
    },
    options: [
      { value: 'CLERICAL_ERROR', label: { defaultMessage: 'Clerical error', description: 'Correction reason', id: 'event.marriageNotice.action.correction.reason.clerical' } },
      { value: 'MATERIAL_ERROR', label: { defaultMessage: 'Informant provided incorrect information', description: 'Correction reason', id: 'event.marriageNotice.action.correction.reason.material' } },
      { value: 'MATERIAL_OMISSION', label: { defaultMessage: 'Informant omitted information', description: 'Correction reason', id: 'event.marriageNotice.action.correction.reason.omission' } },
      { value: 'JUDICIAL_ORDER', label: { defaultMessage: 'Requested by the court', description: 'Correction reason', id: 'event.marriageNotice.action.correction.reason.court' } },
      { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Correction reason', id: 'event.marriageNotice.action.correction.reason.other' } }
    ]
  },
  {
    id: 'reason.other',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Other reason',
      description: 'Additional correction reason',
      id: 'event.marriageNotice.action.correction.reason.otherDetails'
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: field('reason.option').isEqualTo('OTHER') }]
  }
]

const requesterDetailsFields = [
  {
    id: 'requester.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    label: {
      defaultMessage: 'Requester name',
      description: 'Name of someone else requesting the correction',
      id: 'event.marriageNotice.action.correction.requester.name'
    },
    configuration: {
      name: {
        firstname: { required: true },
        surname: { required: true }
      }
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: field('requester.type').isEqualTo('SOMEONE_ELSE') }]
  },
  {
    id: 'requester.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Relationship to the couple',
      description: 'Relationship of the requester to the couple',
      id: 'event.marriageNotice.action.correction.requester.relationship'
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: field('requester.type').isEqualTo('SOMEONE_ELSE') }]
  }
]

const identityFields = [
  {
    id: 'requester.identity.verify.data',
    type: FieldType.DATA,
    label: {
      defaultMessage: 'Identity details',
      description: 'Identity details for the correction requester',
      id: 'event.marriageNotice.action.correction.identity.label'
    },
    configuration: {
      data: [
        { fieldId: 'bride.name' },
        { fieldId: 'bride.dob' },
        { fieldId: 'brideGroom.name' },
        { fieldId: 'brideGroom.dob' },
        { fieldId: 'informant.phoneNumber' },
        { fieldId: 'informant.email' }
      ]
    }
  }
]

const supportingDocumentFields = [
  {
    id: 'documents.proofOfIdentity',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    uncorrectable: true,
    label: {
      defaultMessage: 'Proof of identity',
      description: 'Identity document supporting the correction request',
      id: 'event.marriageNotice.action.correction.documents.identity'
    },
    configuration: documentConfiguration,
    options: [
      { value: 'PASSPORT', label: { defaultMessage: 'Passport', description: 'Identity document', id: 'event.marriageNotice.action.correction.documents.passport' } },
      { value: 'BIRTH_CERTIFICATE', label: { defaultMessage: 'Birth certificate', description: 'Identity document', id: 'event.marriageNotice.action.correction.documents.birthCertificate' } },
      { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Identity document', id: 'event.marriageNotice.action.correction.documents.otherIdentity' } }
    ]
  },
  {
    id: 'documents.supportingDocs',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    uncorrectable: true,
    label: {
      defaultMessage: 'Supporting documents',
      description: 'Documents supporting the correction request',
      id: 'event.marriageNotice.action.correction.documents.supporting'
    },
    configuration: documentConfiguration,
    options: [
      { value: 'AFFIDAVIT', label: { defaultMessage: 'Affidavit', description: 'Correction document', id: 'event.marriageNotice.action.correction.documents.affidavit' } },
      { value: 'COURT_ORDER', label: { defaultMessage: 'Court order', description: 'Correction document', id: 'event.marriageNotice.action.correction.documents.courtOrder' } },
      { value: 'OTHER', label: { defaultMessage: 'Other', description: 'Correction document', id: 'event.marriageNotice.action.correction.documents.otherSupporting' } }
    ]
  }
]

export const MARRIAGE_NOTICE_CORRECTION_FORM = defineActionForm({
  label: {
    id: 'event.marriageNotice.action.correction.form.label',
    defaultMessage: 'Request correction',
    description: 'Marriage Notice correction request form'
  },
  pages: [
    {
      id: 'correctionRequest',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.correction.form.request.title', defaultMessage: 'Correction request', description: 'Correction request section' },
      fields: correctionFields
    },
    {
      id: 'requesterDetails',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.correction.form.requester.title', defaultMessage: "Requester's details", description: 'Requester details section' },
      conditional: field('requester.type').isEqualTo('SOMEONE_ELSE'),
      fields: requesterDetailsFields
    },
    {
      id: 'verifyIdentity',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.correction.form.identity.title', defaultMessage: 'Verify their identity', description: 'Identity verification section' },
      conditional: and(
        not(field('requester.type').isEqualTo('ANOTHER_AGENT')),
        not(field('requester.type').isEqualTo('COURT')),
        not(field('requester.type').isEqualTo('SOMEONE_ELSE'))
      ),
      fields: identityFields,
      actions: {
        verify: { label: { id: 'event.marriageNotice.action.correction.form.verify', defaultMessage: 'Verified', description: 'Identity verified action' } },
        cancel: {
          label: { id: 'event.marriageNotice.action.correction.form.cancel', defaultMessage: 'Identity does not match', description: 'Identity verification cancellation action' },
          confirmation: {
            title: { id: 'event.marriageNotice.action.correction.form.cancel.title', defaultMessage: 'Proceed without proof of ID?', description: 'Identity cancellation confirmation title' },
            body: { id: 'event.marriageNotice.action.correction.form.cancel.body', defaultMessage: 'Please be aware that you will be responsible for this correction without proof of ID from the requester.', description: 'Identity cancellation confirmation body' }
          }
        }
      }
    },
    {
      id: 'supportingDocuments',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.correction.form.documents.title', defaultMessage: 'Supporting documents', description: 'Supporting documents section' },
      fields: supportingDocumentFields
    }
  ]
})
