import { FieldConfig, FieldType } from '@opencrvs/toolkit/events'

export const collectPaymentFields: FieldConfig[] = [
  {
    id: 'fees.amount',
    type: FieldType.NUMBER,
    required: false,
    label: {
      defaultMessage: 'Fee collected',
      description: 'Label for the amount field',
      id: 'event.birth.action.correction.fees.amount.label'
    },
    configuration: {
      min: 0,
      prefix: {
        defaultMessage: '$',
        description: 'Prefix for the amount field',
        id: 'event.birth.action.correction.fees.amount.prefix'
      }
    }
  },
  {
    id: 'fees.receiptNumber',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'Receipt number',
      description: 'Label for the receipt number field',
      id: 'event.birth.action.correction.fees.receiptNumber.label'
    }
  }
]
