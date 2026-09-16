import {
  ConditionalType,
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  or
} from '@opencrvs/toolkit/events'

const PHONE_NUMBER_REGEX = '^[0-9]{5}$'

export const informant = defineFormPage({
  id: 'informantDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Informant details',
    description: 'Title for the informant details page',
    id: 'event.marriageNotice.action.declare.form.section.informantDetails.title'
  },
  fields: [
    {
      id: 'informantDetails.pointOfContactHeading',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'Heading for informant contact fields',
        id: 'event.marriageNotice.action.declare.form.section.informantDetails.field.pointOfContactHeading.label'
      },
      conditionals: [
        { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: field('informantDetails.pointOfContactHeading').isFalsy() }
      ]
    },
    {
      id: 'informantDetails.phoneNumber',
      type: FieldType.PHONE,
      analytics: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'Label for the informant phone number field',
        id: 'event.marriageNotice.action.declare.form.section.informantDetails.field.phoneNumber.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid 5 digit number',
            description: 'Error shown for invalid informant phone numbers',
            id: 'event.marriageNotice.action.declare.form.section.informantDetails.field.phoneNumber.error'
          },
          validator: or(field('informantDetails.phoneNumber').matches(PHONE_NUMBER_REGEX), field('informantDetails.phoneNumber').isFalsy())
        }
      ]
    },
    {
      id: 'informantDetails.email',
      type: FieldType.EMAIL,
      analytics: true,
      label: {
        defaultMessage: 'Email',
        description: 'Label for the informant email field',
        id: 'event.marriageNotice.action.declare.form.section.informantDetails.field.email.label'
      }
    }
  ]
})
