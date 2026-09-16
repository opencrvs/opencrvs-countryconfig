import {
  ConditionalType,
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  not
} from '@opencrvs/toolkit/events'

export const collect = defineFormPage({
  id: 'collector',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Collect Marriage Notice fee',
    description: 'Title for the Marriage Notice fee collection page',
    id: 'event.marriageNotice.action.declare.form.section.collect.title'
  },
  fields: [
    {
      id: 'collector.feeDetails',
      type: FieldType.DATA,
      label: {
        defaultMessage: 'Fee details',
        description: 'Heading for Marriage Notice fee details',
        id: 'event.marriageNotice.action.declare.form.section.collect.feeDetails.label'
      },
      configuration: {
        data: [
          {
            id: 'service',
            label: {
              defaultMessage: 'Service',
              description: 'Label for the fee service',
              id: 'event.marriageNotice.action.declare.form.section.collect.service.label'
            },
            value: {
              defaultMessage: 'Marriage Notice',
              description: 'Name of the service being paid for',
              id: 'event.marriageNotice.action.declare.form.section.collect.service.value'
            }
          },
          {
            id: 'fee',
            label: {
              defaultMessage: 'Fee',
              description: 'Label for the base fee',
              id: 'event.marriageNotice.action.declare.form.section.collect.fee.label'
            },
            value: '$100.00'
          }
        ]
      }
    },
    {
      id: 'collector.feeWaived',
      type: FieldType.CHECKBOX,
      defaultValue: false,
      analytics: true,
      label: {
        defaultMessage: 'Fee is waived / not collected',
        description: 'Label for fee waiver checkbox',
        id: 'event.marriageNotice.action.declare.form.section.collect.feeWaived.label'
      }
    },
    {
      id: 'collector.amountCollected',
      type: FieldType.NUMBER,
      analytics: true,
      configuration: {
        min: 0,
        prefix: {
          defaultMessage: '$',
          description: 'Currency prefix for amount collected',
          id: 'event.marriageNotice.action.declare.form.section.collect.amountCollected.prefix'
        }
      },
      label: {
        defaultMessage: 'Amount collected',
        description: 'Label for amount collected',
        id: 'event.marriageNotice.action.declare.form.section.collect.amountCollected.label'
      },
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: not(field('collector.feeWaived').isEqualTo(true))
      }]
    },
    {
      id: 'collector.receiptNumber',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Receipt number',
        description: 'Label for fee receipt number',
        id: 'event.marriageNotice.action.declare.form.section.collect.receiptNumber.label'
      },
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: not(field('collector.feeWaived').isEqualTo(true))
      }]
    },
    {
      id: 'collector.waiverReason',
      type: FieldType.TEXTAREA,
      analytics: true,
      label: {
        defaultMessage: 'Reason for fee waiver / non-collection',
        description: 'Label for fee waiver reason',
        id: 'event.marriageNotice.action.declare.form.section.collect.waiverReason.label'
      },
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: field('collector.feeWaived').isEqualTo(true)
      }],
      configuration: { maxLength: 500 }
    }
  ]
})
