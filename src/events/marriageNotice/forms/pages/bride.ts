import {
  AddressType,
  ConditionalType,
  defineFormPage,
  FieldType,
  PageTypes,
  TranslationConfig,
  field,
  user
} from '@opencrvs/toolkit/events'
import {
  createSelectOptions,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import { invalidNameValidator, MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

const ConjugalStatus = {
  SPINSTER: 'SPINSTER',
  DIVORCED: 'DIVORCED',
  WIDOW: 'WIDOW'
} as const

const conjugalStatusMessageDescriptors = {
  SPINSTER: {
    defaultMessage: 'Spinster',
    description: 'Label for spinster conjugal status',
    id: 'form.field.label.conjugalStatusSpinster'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Label for divorced conjugal status',
    id: 'form.field.label.conjugalStatusDivorcedBride'
  },
  WIDOW: {
    defaultMessage: 'Widow',
    description: 'Label for widow conjugal status',
    id: 'form.field.label.conjugalStatusWidow'
  }
} satisfies Record<keyof typeof ConjugalStatus, TranslationConfig>

const conjugalStatusOptions = createSelectOptions(
  ConjugalStatus,
  conjugalStatusMessageDescriptors
)

export const bride = defineFormPage({
  id: 'bride',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Bride details',
    description: 'Title for bride details page',
    id: 'event.marriageNotice.action.declare.form.section.bride.title'
  },
  fields: [
    {
      id: 'bride.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      analytics: true,
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given Name(s)',
              description: 'Label for given name field',
              id: 'event.marriageNotice.action.declare.form.section.bride.name.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for surname field',
              id: 'event.marriageNotice.action.declare.form.section.bride.name.surname.label'
            }
          }
        }
      },
      label: {
        defaultMessage: 'Bride name',
        description: 'Label for bride name field',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.name.label'
      },
      validation: [invalidNameValidator('bride.name')]
    },
    {
      id: 'bride.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Date of birth must be before today and indicate an age of at least 16 years',
            description: 'Validation message for bride age',
            id: 'event.marriageNotice.action.declare.form.section.bride.field.dob.error'
          },
          validator: field('bride.dob').isBefore().days(16 * 365).inPast()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for bride date of birth field',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.dob.label'
      }
    },
    {
      id: 'bride.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'Label for bride place of birth',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.placeOfBirth.label'
      }
    },
    {
      id: 'bride.occupation',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for bride occupation field',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.occupation.label'
      }
    },
    {
      id: 'bride.dateOfDecreeAbsolute',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of decree absolute',
        description: 'Label for bride decree absolute date',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.dateOfDecreeAbsolute.label'
      },
      validation: [{
        message: {
          defaultMessage: 'Date must be before today',
          description: 'Validation message for decree absolute date',
          id: 'event.marriageNotice.action.declare.form.section.bride.field.dateOfDecreeAbsolute.error'
        },
        validator: field('bride.dateOfDecreeAbsolute').isBefore().now()
      }],
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: field('bride.conjugalStatus').isEqualTo(ConjugalStatus.DIVORCED)
      }]
    },
    {
      id: 'bride.dateOfDeathOfFormerHusband',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of death of former husband',
        description: 'Label for bride former husband death date',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.dateOfDeathOfFormerHusband.label'
      },
      validation: [{
        message: {
          defaultMessage: 'Date must be before today',
          description: 'Validation message for former husband death date',
          id: 'event.marriageNotice.action.declare.form.section.bride.field.dateOfDeathOfFormerHusband.error'
        },
        validator: field('bride.dateOfDeathOfFormerHusband').isBefore().now()
      }],
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: field('bride.conjugalStatus').isEqualTo(ConjugalStatus.WIDOW)
      }]
    },
    {
      id: 'bride.address',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Label for bride address',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.address.label'
      },
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: { streetAddressForm: defaultStreetAddressConfiguration },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message for invalid bride address',
            id: 'error.invalidInput'
          },
          validator: field('bride.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators('bride.address', defaultStreetAddressConfiguration)
      ]
    },
    {
      id: 'bride.fatherName',
      type: FieldType.TEXT,
      label: {
        defaultMessage: "Father's name",
        description: 'Label for bride father name',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.fatherName.label'
      }
    },
    {
      id: 'bride.fatherOccupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: "Father's occupation",
        description: 'Label for bride father occupation',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.fatherOccupation.label'
      }
    },
    {
      id: 'bride.motherName',
      type: FieldType.TEXT,
      label: {
        defaultMessage: "Mother's name",
        description: 'Label for bride mother name',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.motherName.label'
      }
    },
    {
      id: 'bride.motherMaidenSurname',
      type: FieldType.TEXT,
      label: {
        defaultMessage: "Mother's maiden surname",
        description: 'Label for bride mother maiden surname',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.motherMaidenSurname.label'
      }
    },
    {
      id: 'bride.motherOccupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: "Mother's occupation",
        description: 'Label for bride mother occupation',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.motherOccupation.label'
      }
    },
    {
      id: 'bride.conjugalStatus',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      options: conjugalStatusOptions,
      label: {
        defaultMessage: 'Conjugal status',
        description: 'Label for bride conjugal status field',
        id: 'event.marriageNotice.action.declare.form.section.bride.field.conjugalStatus.label'
      }
    }
  ]
})
