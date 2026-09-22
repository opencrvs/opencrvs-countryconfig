import { createSelectOptions } from '@countryconfig/events/utils'
import { defineFormPage, FieldType, PageTypes } from '@opencrvs/toolkit/events'

const issuingAuthorityMessageDescriptors = {
  HIGH_COURT_COOK_ISLANDS: {
    defaultMessage: 'High Court of the Cook Islands, Rarotonga',
    description: 'Default issuing authority for divorce',
    id: 'form.field.label.issuingAuthority.highCourtCookIslands'
  }
}
export const IssuingAuthority = {
  HIGH_COURT_COOK_ISLANDS: 'HIGH_COURT_COOK_ISLANDS'
}
const issuingAuthorityOptions = createSelectOptions(
  IssuingAuthority,
  issuingAuthorityMessageDescriptors
)
export const divorceOrderDetails = defineFormPage({
  id: 'divorceOrderDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Divorce order details',
    description: 'Form section title for divorce order details',
    id: 'event.divorce.action.declare.form.section.divorceOrderDetails.title'
  },
  fields: [
    {
      id: 'divorceOrderDetails.orderNumber',
      type: FieldType.TEXT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Divorce order number',
        description: 'Label for divorce order number',
        id: 'event.divorce.action.declare.form.section.divorceOrderDetails.field.orderNumber.label'
      }
    },
    {
      id: 'divorceOrderDetails.issuingAuthority',
      type: FieldType.SELECT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Issuing court / authority',
        description: 'Label for issuing court or authority',
        id: 'event.divorce.action.declare.form.section.divorceOrderDetails.field.issuingAuthority.label'
      },
      options: issuingAuthorityOptions // You can define this in your config
    },
    {
      id: 'divorceOrderDetails.orderDate',
      type: FieldType.DATE,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Date of divorce order',
        description: 'Label for date of divorce order',
        id: 'event.divorce.action.declare.form.section.divorceOrderDetails.field.orderDate.label'
      }
    }
  ]
})
