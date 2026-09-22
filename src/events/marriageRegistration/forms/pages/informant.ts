import {
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  PageTypes,
  or
} from '@opencrvs/toolkit/events'
import { invalidNameValidator } from '@countryconfig/events/birth/validators'
import { createSelectOptions } from '@countryconfig/events/utils'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

const PHONE_NUMBER_REGEX = '^[0-9][0-9]{4}$'

// Informant type options
const informantTypeOptions = createSelectOptions(
  {
    OFFICIANT: 'OFFICIANT',
    BRIDEGROOM: 'BRIDEGROOM',
    BRIDE: 'BRIDE',
    SOMEONE_ELSE: 'SOMEONE_ELSE'
  },
  {
    OFFICIANT: {
      defaultMessage: 'Officiant',
      description: 'Option for informant type officiant',
      id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.informantType.option.officiant'
    },
    BRIDEGROOM: {
      defaultMessage: 'Bridegroom',
      description: 'Option for informant type bridegroom',
      id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.informantType.option.bridegroom'
    },
    BRIDE: {
      defaultMessage: 'Bride',
      description: 'Option for informant type bride',
      id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.informantType.option.bride'
    },
    SOMEONE_ELSE: {
      defaultMessage: 'Someone else on behalf of the Officiant',
      description:
        'Option for informant type someone else on behalf of the officiant',
      id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.informantType.option.someoneElse'
    }
  }
)

export const informantDetails = defineFormPage({
  id: 'informantDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informant details',
    id: 'event.marriageRegistration.action.declare.form.section.informantDetails.title'
  },
  fields: [
    // Informant type
    {
      id: 'informantDetails.informantType',
      type: FieldType.SELECT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'Label for informant type select field',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.informantType.label'
      },
      options: informantTypeOptions
    },

    // Relationship to officiant or couple
    {
      id: 'informantDetails.relationshipToOfficiantOrCouple',
      type: FieldType.TEXT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Relationship to officiant or couple',
        description: 'Label for relationship to officiant or couple field',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.relationshipToOfficiantOrCouple.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informantDetails.informantType').isEqualTo(
            'SOMEONE_ELSE'
          )
        }
      ]
    },

    // Name field (includes given name(s) and surname)
    {
      id: 'informantDetails.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for informant given names',
              id: 'form.field.label.firstNames'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for informant surname',
              id: 'form.field.label.familyName'
            }
          }
        }
      },
      label: {
        defaultMessage: 'Full name',
        description: 'Label for informant full name field',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.name.label'
      },
      validation: [invalidNameValidator('informantDetails.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informantDetails.informantType').isEqualTo(
            'SOMEONE_ELSE'
          )
        }
      ]
    },

    // Divider
    {
      id: 'informantDetails.divider.2',
      type: FieldType.DIVIDER,
      label: {
        defaultMessage: '',
        description: '',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.divider.2.label'
      }
    },

    // Point of contact Header
    {
      id: 'informantDetails.pointOfContactHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'Header for point of contact section',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.pointOfContactHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    // Phone number
    {
      id: 'informantDetails.phoneNumber',
      type: FieldType.PHONE,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'Label for informant phone number field',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.phoneNumber.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid 5 digit number',
            description:
              'The error message that appears on phone numbers where length must be 5',
            id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.phoneNumber.error'
          },
          validator: or(
            field('informantDetails.phoneNumber').matches(PHONE_NUMBER_REGEX),
            field('informantDetails.phoneNumber').isFalsy()
          )
        }
      ],
      parent: field('marriageDetails.licenceNumber'),
      value: field('marriageDetails.licenceNumber').getByPath([
        'data',
        'firstResult',
        'declaration',
        'informantDetails.phoneNumber'
      ])
    },

    // Email
    {
      id: 'informantDetails.email',
      type: FieldType.EMAIL,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Email',
        description: 'Label for informant email field',
        id: 'event.marriageRegistration.action.declare.form.section.informantDetails.field.email.label'
      },
      parent: field('marriageDetails.licenceNumber'),
      value: field('marriageDetails.licenceNumber').getByPath([
        'data',
        'firstResult',
        'declaration',
        'informantDetails.email'
      ])
    }
  ]
})
