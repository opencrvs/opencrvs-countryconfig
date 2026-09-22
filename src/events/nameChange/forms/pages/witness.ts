import {
  defineFormPage,
  FieldType,
  PageTypes,
  AddressType,
  user,
  field,
  ConditionalType,
  and,
  not
} from '@opencrvs/toolkit/events'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const witness = defineFormPage({
  id: 'witness',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Witness details',
    description: 'Form section title for witness',
    id: 'event.nameChange.action.declare.form.section.witness.title'
  },
  fields: [
    // E1-E2: Witness name
    {
      id: 'witness.name',
      type: FieldType.NAME,
      required: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for witness given name(s)',
              id: 'event.nameChange.action.declare.form.section.witness.field.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for witness surname',
              id: 'event.nameChange.action.declare.form.section.witness.field.surname.label'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Witness name',
        description: 'Label for witness name field',
        id: 'event.nameChange.action.declare.form.section.witness.field.name.label'
      }
    },
    // E3: Occupation
    {
      id: 'witness.occupation',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for witness occupation',
        id: 'event.nameChange.action.declare.form.section.witness.field.occupation.label'
      }
    },
    // Divider
    {
      id: 'witness.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // Usual residence heading
    {
      id: 'witness.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Heading for usual residence section',
        id: 'event.nameChange.action.declare.form.section.witness.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h4' } }
    },
    // E4-E8: Address
    {
      id: 'witness.address',
      type: FieldType.ADDRESS,
      hideLabel: true,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Residence',
        description: 'Label for address field',
        id: 'event.nameChange.action.declare.form.section.witness.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('witness.address').isValidAdministrativeLeafLevel()
        }
      ],
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    }
  ]
})
