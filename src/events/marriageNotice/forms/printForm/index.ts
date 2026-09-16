import {
  and,
  ConditionalType,
  defineActionForm,
  field,
  FieldType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'

const collectorOptions = [
  { value: 'BRIDE', label: { defaultMessage: 'Bride', description: 'Certificate recipient', id: 'event.marriageNotice.action.print.collector.bride' } },
  { value: 'GROOM', label: { defaultMessage: 'Bridegroom', description: 'Certificate recipient', id: 'event.marriageNotice.action.print.collector.groom' } },
  { value: 'INFORMANT', label: { defaultMessage: 'Informant', description: 'Certificate recipient', id: 'event.marriageNotice.action.print.collector.informant' } },
  { value: 'SOMEONE_ELSE', label: { defaultMessage: 'Someone else', description: 'Certificate recipient', id: 'event.marriageNotice.action.print.collector.other' } }
]

const collectorFields = [
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Certificate recipient',
      description: 'Person receiving the Marriage Notice certificate',
      id: 'event.marriageNotice.action.print.collector.label'
    },
    options: collectorOptions
  }
]

const otherCollectorFields = [
  {
    id: 'collector.OTHER.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    label: {
      defaultMessage: "Collector's name",
      description: 'Name of the certificate recipient',
      id: 'event.marriageNotice.action.print.collector.name'
    },
    configuration: {
      name: {
        firstname: { required: true },
        surname: { required: true }
      }
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE') }]
  },
  {
    id: 'collector.OTHER.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Relationship to the couple',
      description: 'Relationship of the certificate recipient to the couple',
      id: 'event.marriageNotice.action.print.collector.relationship'
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE') }]
  },
  {
    id: 'collector.OTHER.idNumber',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID number',
      description: 'Identification number of the certificate recipient',
      id: 'event.marriageNotice.action.print.collector.idNumber'
    },
    conditionals: [{ type: ConditionalType.SHOW, conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE') }]
  }
]

const identityFields = [
  {
    id: 'collector.identity.verify.data',
    type: FieldType.DATA,
    label: {
      defaultMessage: 'Identity details',
      description: 'Identity details for the certificate recipient',
      id: 'event.marriageNotice.action.print.identity.label'
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

const paymentFields = [
  {
    id: 'collector.payment.amountCollected',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Amount collected',
      description: 'Certificate printing fee collected',
      id: 'event.marriageNotice.action.print.payment.amount'
    }
  },
  {
    id: 'collector.payment.receiptNumber',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Receipt number',
      description: 'Receipt number for the certificate fee',
      id: 'event.marriageNotice.action.print.payment.receipt'
    }
  }
]

export const MARRIAGE_NOTICE_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.marriageNotice.action.print.form.label',
    defaultMessage: 'Marriage Notice certificate collector',
    description: 'Marriage Notice certificate collection form'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.print.collector.title', defaultMessage: 'Certify record', description: 'Certificate recipient section' },
      fields: collectorFields
    },
    {
      id: 'collectorDetails',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.print.collectorDetails.title', defaultMessage: 'Collector details', description: 'Other collector details section' },
      conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
      fields: otherCollectorFields
    },
    {
      id: 'collectorIdentity',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.print.identity.title', defaultMessage: 'Verify their identity', description: 'Identity verification section' },
      conditional: and(
        not(field('collector.requesterId').isEqualTo('SOMEONE_ELSE')),
        not(field('collector.requesterId').isEqualTo('INFORMANT'))
      ),
      fields: identityFields,
      actions: {
        verify: { label: { id: 'event.marriageNotice.action.print.verify', defaultMessage: 'Verified', description: 'Identity verified action' } },
        cancel: {
          label: { id: 'event.marriageNotice.action.print.cancel', defaultMessage: 'Identity does not match', description: 'Identity verification cancellation action' },
          confirmation: {
            title: { id: 'event.marriageNotice.action.print.cancel.title', defaultMessage: 'Print without proof of ID?', description: 'Identity cancellation confirmation title' },
            body: { id: 'event.marriageNotice.action.print.cancel.body', defaultMessage: 'Please be aware that you will be responsible for issuing a certificate without proof of ID from the recipient.', description: 'Identity cancellation confirmation body' }
          }
        }
      }
    },
    {
      id: 'collectorPayment',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: { id: 'event.marriageNotice.action.print.payment.title', defaultMessage: 'Collect payment', description: 'Certificate payment section' },
      fields: paymentFields
    }
  ]
})
