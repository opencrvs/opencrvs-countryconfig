import {
  defineFormPage,
  FieldType,
  PageTypes,
  AddressType,
  user,
  TranslationConfig,
  ConditionalType,
  field,
  and,
  not,
  or
} from '@opencrvs/toolkit/events'
import {
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import { IdType, idTypeOptions } from '@countryconfig/events/utils'
import {
  nationalIdValidator,
  otherIdValidator,
  passportIdValidator
} from '../../validators'
import { invalidNameValidator } from '@countryconfig/events/birth/validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

const PHONE_NUMBER_REGEX = '^[6-9][0-9]{4}$'

export const InformantType = {
  SELF: 'SELF',
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  MOTHER_AND_FATHER: 'MOTHER_AND_FATHER',
  LEGAL_GUARDIAN: 'LEGAL_GUARDIAN',
  OTHER: 'OTHER'
} as const
export type InformantTypeKey = keyof typeof InformantType

const informantMessageDescriptors = {
  SELF: {
    defaultMessage: 'Self (Person changing their own name)',
    description: 'Label for option self',
    id: 'form.field.label.informantRelation.self'
  },
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.informantRelation.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.informantRelation.father'
  },
  MOTHER_AND_FATHER: {
    defaultMessage: 'Mother and Father',
    description: 'Label for option mother and father',
    id: 'form.field.label.informantRelation.motherAndFather'
  },
  OTHER: {
    defaultMessage: 'Other (please specify)',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>
const nameChangeInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

// Options when subject is 21 years or older (only Self and Other)
const nameChangeInformantTypeOptionsOver21 = createSelectOptions(
  {
    SELF: InformantType.SELF,
    OTHER: InformantType.OTHER
  },
  {
    SELF: informantMessageDescriptors.SELF,
    OTHER: informantMessageDescriptors.OTHER
  }
)

export const informant = defineFormPage({
  id: 'informant',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informant',
    id: 'event.nameChange.action.declare.form.section.informant.title'
  },
  fields: [
    // C1: Informant Type (when subject is under 21 years old)
    {
      id: 'informant.informantType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'Label for informant type',
        id: 'event.nameChange.action.declare.form.section.informant.field.informantType.label'
      },
      options: nameChangeInformantTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('subjects.dob')
              .isBefore()
              .days(21 * 365)
              .inPast()
          )
        }
      ]
    },
    // C1: Informant Type (when subject is 21 years or older)
    {
      id: 'informant.informantType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'Label for informant type',
        id: 'event.nameChange.action.declare.form.section.informant.field.informantType.label'
      },
      options: nameChangeInformantTypeOptionsOver21,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.dob')
            .isBefore()
            .days(21 * 365)
            .inPast()
        }
      ]
    },
    // C2: Relationship to the person whose name is being changed
    {
      id: 'informant.relationship',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage:
          'Relationship to the person whose name is being changed',
        description: 'Label for relationship field',
        id: 'event.nameChange.action.declare.form.section.informant.field.relationship.label'
      },
      helperText: {
        defaultMessage:
          'Please describe relationship to the person whose name is being changed',
        description: 'Helper text for relationship field',
        id: 'event.nameChange.action.declare.form.section.informant.field.relationship.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.informantType').isEqualTo(
            InformantType.OTHER
          )
        }
      ]
    },
    // Divider
    {
      id: 'informant.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // C3: Given name(s)
    {
      id: 'informant.name',
      type: FieldType.NAME,
      required: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for informant given name(s)',
              id: 'event.nameChange.action.declare.form.section.informant.field.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for informant surname',
              id: 'event.nameChange.action.declare.form.section.informant.field.surname.label'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Informant name',
        description: 'Label for informant name field',
        id: 'event.nameChange.action.declare.form.section.informant.field.name.label'
      },
      validation: [invalidNameValidator('informant.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // C5: Date of birth
    {
      id: 'informant.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for informant date of birth',
        id: 'event.nameChange.action.declare.form.section.informant.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Date cannot be in the future',
            description: 'Error message for invalid date',
            id: 'event.nameChange.action.declare.form.section.informant.field.dob.error'
          },
          validator: field('informant.dob').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.informantType').isEqualTo(InformantType.SELF)),
            not(field('informant.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },
    // C6: Exact date unknown
    {
      id: 'informant.dobUnknown',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: true,
      label: {
        defaultMessage: '[ ] Exact date unknown',
        description: 'Label for informant exact date unknown checkbox',
        id: 'event.nameChange.action.declare.form.section.informant.field.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // C6.1: Age in years
    {
      id: 'informant.age',
      type: FieldType.NUMBER,
      required: true,
      analytics: true,
      configuration: {
        postfix: {
          defaultMessage: ' years',
          description: 'Postfix for age in years',
          id: 'event.nameChange.action.declare.form.section.informant.field.age.postfix'
        }
      },
      label: {
        defaultMessage: 'Age in years',
        description: 'Label for informant age in years',
        id: 'event.nameChange.action.declare.form.section.informant.field.age.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.informantType').isEqualTo(InformantType.SELF)),
            field('informant.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },
    // C7: Type of ID
    {
      id: 'informant.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'Label for informant type of ID',
        id: 'event.nameChange.action.declare.form.section.informant.field.idType.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // C7.1: ID number (Passport)
    {
      id: 'informant.passport',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID number',
        description: 'Label for informant ID number',
        id: 'event.nameChange.action.declare.form.section.informant.field.passport.label'
      },
      validation: [passportIdValidator('informant.passport')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.informantType').isEqualTo(InformantType.SELF)),
            field('informant.idType').isEqualTo(IdType.PASSPORT),
            not(field('informant.idType').isEqualTo(IdType.NONE))
          )
        }
      ]
    },
    // C7.1: ID number (Birth Certificate)
    {
      id: 'informant.bc',
      type: FieldType.TEXT,
      required: true,

      label: {
        defaultMessage: 'ID number',
        description: 'Label for informant ID number',
        id: 'event.nameChange.action.declare.form.section.informant.field.bc.label'
      },
      validation: [otherIdValidator('informant.bc')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.informantType').isEqualTo(InformantType.SELF)),
            field('informant.idType').isEqualTo(IdType.BIRTH_CERTIFICATE),
            not(field('informant.idType').isEqualTo(IdType.NONE))
          )
        }
      ]
    },
    // C7.1: ID number (Other)
    {
      id: 'informant.idOther',
      type: FieldType.TEXT,
      required: true,

      label: {
        defaultMessage: 'ID number',
        description: 'Label for informant other ID',
        id: 'event.nameChange.action.declare.form.section.informant.field.idOther.label'
      },
      validation: [otherIdValidator('informant.idOther')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('informant.informantType').isEqualTo(InformantType.SELF)),
            field('informant.idType').isEqualTo(IdType.OTHER),
            not(field('informant.idType').isEqualTo(IdType.NONE))
          )
        }
      ]
    },
    // Divider
    {
      id: 'informant.divider.address',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // Usual residence heading
    {
      id: 'informant.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Heading for usual residence section',
        id: 'event.nameChange.action.declare.form.section.informant.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h4' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // C13-C17: Address
    {
      id: 'informant.address',
      type: FieldType.ADDRESS,
      hideLabel: true,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Residence',
        description: 'Label for address field',
        id: 'event.nameChange.action.declare.form.section.informant.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('informant.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'informant.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    // divider
    {
      id: 'informant.divider.3',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // Point of contact heading
    {
      id: 'informant.pointOfcontactHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'Heading for point of contact section',
        id: 'event.nameChange.action.declare.form.section.informant.field.pointOfcontactHelper.label'
      },
      configuration: { styles: { fontVariant: 'h4' } }
    },
    // C10: Phone number
    {
      id: 'informant.phone',
      type: FieldType.NUMBER,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Phone number',
        description: 'Label for informant phone number',
        id: 'event.nameChange.action.declare.form.section.informant.field.phone.label'
      }
    },
    // C11: Email
    {
      id: 'informant.email',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Email',
        description: 'Label for informant email',
        id: 'event.nameChange.action.declare.form.section.informant.field.email.label'
      }
    }
  ]
})
