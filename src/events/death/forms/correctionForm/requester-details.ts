import {
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType
} from '@opencrvs/toolkit/events'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

const requesterIdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER',
  NONE: 'NONE'
} as const

export const requesterDetailsFields: FieldConfig[] = [
  {
    id: 'requester.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'event.death.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Relationship to deceased',
      description: 'This is the label for the relationship to deceased field'
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
    configuration: tuvaluNameConfig,
    hideLabel: true,
    label: {
      id: 'event.death.action.correction.form.section.requester.name.label',
      defaultMessage: "Requester's name",
      description: 'This is the label for the name field of OTHER requester'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    validation: [invalidNameValidator('requester.name')]
  },
  {
    id: 'requester.dob',
    type: FieldType.DATE,
    required: true,
    validation: [
      {
        message: {
          defaultMessage: 'Date cannot be in the future',
          description: 'This is the error message for invalid date',
          id: 'validations.noFutureDate'
        },
        validator: field('requester.dob').isBefore().now()
      }
    ],
    label: {
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field',
      id: 'verifyCertificate.dateOfBirth'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.nationality',
    type: FieldType.COUNTRY,
    required: true,
    label: {
      defaultMessage: 'Nationality',
      description: 'This is the label for the field',
      id: 'form.field.label.nationality'
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
      id: 'event.death.action.correction.form.section.requester.idType.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    options: [
      {
        label: {
          id: 'event.death.action.form.section.idType.passport.label',
          defaultMessage: 'Passport',
          description: 'Option for selecting Passport as the ID type'
        },
        value: requesterIdType.PASSPORT
      },
      {
        label: {
          id: 'form.field.label.iDTypeBirthCertificate',
          defaultMessage: 'Birth certificate',
          description:
            'Option for selecting Birth Certificate as the ID type'
        },
        value: requesterIdType.BIRTH_CERTIFICATE
      },
      {
        label: {
          id: 'event.death.action.form.section.idType.other.label',
          defaultMessage: 'Other',
          description: 'Option for selecting Other as the ID type'
        },
        value: requesterIdType.OTHER
      },
      {
        label: {
          id: 'event.death.action.form.section.idType.None.label',
          defaultMessage: 'None',
          description: 'Option for selecting No ID as the ID type'
        },
        value: requesterIdType.NONE
      }
    ]
  },
  {
    id: 'requester.passport',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number',
      id: 'event.death.action.correction.form.section.requester.passport.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(requesterIdType.PASSPORT)
        )
      }
    ]
  },
  {
    id: 'requester.brn',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number',
      id: 'event.death.action.correction.form.section.requester.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(
            requesterIdType.BIRTH_CERTIFICATE
          )
        )
      }
    ]
  },
  {
    id: 'requester.idNumberOther',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'Field for entering ID Number',
      id: 'event.death.action.correction.form.section.requester.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(requesterIdType.OTHER)
        )
      }
    ]
  }
]
