import {
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'
import { MAX_NAME_LENGTH } from '../../validators'

const RequesterIdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER',  NONE: 'NONE',

} as const

const requesterIdTypeMessageDescriptors = {
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBirthCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  },
    NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNone'
  },
} satisfies Record<keyof typeof RequesterIdType, TranslationConfig>

const requesterIdTypeOptions = createSelectOptions(
  RequesterIdType,
  requesterIdTypeMessageDescriptors
)

export const requesterDetailsFields: FieldConfig[] = [
  {
    id: 'requester.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'event.birth.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.name',
    type: FieldType.NAME,
    required: true,
    hideLabel: true,
    label: {
      id: 'event.birth.action.correction.form.section.requester.name.label',
      defaultMessage: 'Name',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    configuration: {
      maxLength: MAX_NAME_LENGTH,
      name: {
        firstname: {
          required: true,
          label: {
            defaultMessage: 'Given name(s)',
            description: 'Label for form field: First names',
            id: 'form.field.label.givenNames'
          }
        },
        surname: {
          required: true,
          label: {
            defaultMessage: 'Surname',
            description: 'Label for family name text input',
            id: 'form.field.label.surname'
          }
        }
      }
    }
  },
  {
    id: 'requester.dob',
    type: FieldType.DATE,
    required: true,
    label: {
      id: 'event.birth.action.correction.form.section.requester.dob.label',
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    validation: [
      {
        message: {
          defaultMessage: 'Date cannot be in the future',
          description: 'This is the error message for invalid date',
          id: 'event.birth.action.correction.form.section.requester.dob.error'
        },
        validator: field('requester.dob').isBefore().now()
      }
    ]
  },
  {
    id: 'requester.nationality',
    type: FieldType.COUNTRY,
    required: true,
    label: {
      id: 'event.birth.action.correction.form.section.requester.nationality.label',
      defaultMessage: 'Nationality',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    defaultValue: 'COK'
  },
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: 'event.birth.action.correction.form.section.requester.idType.label'
    },
    options: requesterIdTypeOptions,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.passport',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.birth.action.correction.form.section.requester.passport.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(RequesterIdType.PASSPORT)
        )
      }
    ]
  },
  {
    id: 'requester.brn',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.birth.action.correction.form.section.requester.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(RequesterIdType.BIRTH_CERTIFICATE)
        )
      }
    ]
  },
  {
    id: 'requester.other',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.birth.action.correction.form.section.requester.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(RequesterIdType.OTHER)
        )
      }
    ]
  }
]
