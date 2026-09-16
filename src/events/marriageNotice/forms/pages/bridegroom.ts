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
import { not } from '@opencrvs/toolkit/conditionals'
import {
  createSelectOptions,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import { invalidNameValidator, MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

const ConjugalStatus = {
  BACHELOR: 'BACHELOR',
  DIVORCED: 'DIVORCED',
  WIDOWER: 'WIDOWER'
} as const

const conjugalStatusMessageDescriptors = {
  BACHELOR: {
    defaultMessage: 'Bachelor',
    description: 'Label for bachelor conjugal status',
    id: 'form.field.label.conjugalStatusBachelor'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Label for divorced conjugal status',
    id: 'form.field.label.conjugalStatusDivorced'
  },
  WIDOWER: {
    defaultMessage: 'Widower',
    description: 'Label for widower conjugal status',
    id: 'form.field.label.conjugalStatusWidower'
  }
} satisfies Record<keyof typeof ConjugalStatus, TranslationConfig>

const conjugalStatusOptions = createSelectOptions(
  ConjugalStatus,
  conjugalStatusMessageDescriptors
)

export const bridegroom = defineFormPage({
  id: 'brideGroom',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Bridegroom details',
    description: 'Title for bridegroom details page',
    id: 'event.marriageNotice.action.declare.form.section.bridegroom.title'
  },
  fields: [
    {
      id: 'brideGroom.name',
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
              id: 'event.marriageNotice.action.declare.form.section.brideGroom.name.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for surname field',
              id: 'event.marriageNotice.action.declare.form.section.brideGroom.name.surname.label'
            }
          }
        }
      },
      label: {
        defaultMessage: 'Bridegroom name',
        description: 'Label for bridegroom name field',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.name.label'
      },
      validation: [invalidNameValidator('brideGroom.name')]
    },
    {
      id: 'brideGroom.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Date of birth must be before today and indicate an age of at least 16 years',
            description: 'Validation message for bridegroom age',
            id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.dob.error'
          },
          validator: field('brideGroom.dob').isBefore().days(16 * 365).inPast()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for bridegroom date of birth field',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.dob.label'
      }
    },
    {
      id: 'brideGroom.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'Label for bridegroom place of birth',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.placeOfBirth.label'
      }
    },
    {
      id: 'brideGroom.occupation',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for bridegroom occupation field',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.occupation.label'
      }
    },
    {
      id: 'brideGroom.dateDecreeAbsolute',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of decree absolute',
        description: 'Label for bridegroom decree absolute date',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.dateDecreeAbsolute.label'
      },
      validation: [{
        message: {
          defaultMessage: 'Date must be before today',
          description: 'Validation message for decree absolute date',
          id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.dateDecreeAbsolute.error'
        },
        validator: field('brideGroom.dateDecreeAbsolute').isBefore().now()
      }],
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: field('brideGroom.conjugalStatus').isEqualTo(ConjugalStatus.DIVORCED)
      }]
    },
    {
      id: 'brideGroom.dateDeathFormerWife',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of death of former wife',
        description: 'Label for bridegroom former wife death date',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.dateDeathFormerWife.label'
      },
      validation: [{
        message: {
          defaultMessage: 'Date must be before today',
          description: 'Validation message for former wife death date',
          id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.dateDeathFormerWife.error'
        },
        validator: field('brideGroom.dateDeathFormerWife').isBefore().now()
      }],
      conditionals: [{
        type: ConditionalType.SHOW,
        conditional: field('brideGroom.conjugalStatus').isEqualTo(ConjugalStatus.WIDOWER)
      }]
    },
    {
      id: 'brideGroom.address',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Label for bridegroom address',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.address.label'
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
            description: 'Error message for invalid bridegroom address',
            id: 'error.invalidInput'
          },
          validator: field('brideGroom.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators('brideGroom.address', defaultStreetAddressConfiguration)
      ]
    },
    {
      id: 'brideGroom.fatherFullName',
      type: FieldType.TEXT,
      label: {
        defaultMessage: "Father's full name",
        description: 'Label for bridegroom father name',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.fatherFullName.label'
      }
    },
    {
      id: 'brideGroom.fatherOccupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: "Father's occupation",
        description: 'Label for bridegroom father occupation',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.fatherOccupation.label'
      }
    },
    {
      id: 'brideGroom.motherFullName',
      type: FieldType.TEXT,
      label: {
        defaultMessage: "Mother's full name",
        description: 'Label for bridegroom mother name',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.motherFullName.label'
      }
    },
    {
      id: 'brideGroom.motherMaidenSurname',
      type: FieldType.TEXT,
      label: {
        defaultMessage: "Mother's maiden surname",
        description: 'Label for bridegroom mother maiden surname',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.motherMaidenSurname.label'
      }
    },
    {
      id: 'brideGroom.motherOccupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: "Mother's occupation",
        description: 'Label for bridegroom mother occupation',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.motherOccupation.label'
      }
    },
    {
      id: 'brideGroom.conjugalStatus',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      options: conjugalStatusOptions,
      label: {
        defaultMessage: 'Conjugal status',
        description: 'Label for bridegroom conjugal status field',
        id: 'event.marriageNotice.action.declare.form.section.bridegroom.field.conjugalStatus.label'
      }
    }
  ]
})
