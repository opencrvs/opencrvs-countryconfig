/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import {
  defineFormPage,
  TranslationConfig,
  ConditionalType,
  and,
  or,
  FieldType,
  AddressType,
  PageTypes,
  field,
  user
} from '@opencrvs/toolkit/events'
import { not, never } from '@opencrvs/toolkit/conditionals'

import {
  createSelectOptions,
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  yesNoRadioOptions,
  hasNonHealthNotifierRole
} from '@countryconfig/events/utils'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

// -----------------------------------------------------------------
// ID types for the death form (Birth certificate / Passport / Other)
// -----------------------------------------------------------------
const DeathIdType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const deathIdTypeMessageDescriptors = {
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth certificate',
    description: 'Option for form field: Type of ID',
    id: 'event.death.action.declare.form.section.deceased.field.idType.option.birthCertificate'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'event.death.action.declare.form.section.deceased.field.idType.option.passport'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'event.death.action.declare.form.section.deceased.field.idType.option.other'
  }
} satisfies Record<keyof typeof DeathIdType, TranslationConfig>

const deathIdTypeOptions = createSelectOptions(
  DeathIdType,
  deathIdTypeMessageDescriptors
)

// -----------------------------------------------------------------
// Marital status options (death-specific)
// -----------------------------------------------------------------
const deceasedMaritalStatusOptions = [
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Married',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusMarried'
    }
  },
  {
    value: 'SINGLE',
    label: {
      defaultMessage: 'Single (never married)',
      description: 'Option for form field: Marital status',
      id: 'event.death.action.declare.form.section.deceased.field.maritalStatus.option.single'
    }
  },
  {
    value: 'DIVORCED',
    label: {
      defaultMessage: 'Divorced',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusDivorced'
    }
  },
  {
    value: 'WIDOWED',
    label: {
      defaultMessage: 'Widowed',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusWidowed'
    }
  }
]

const isMarried = field('deceased.maritalStatus').isEqualTo('MARRIED')

// -----------------------------------------------------------------
// Gender options
// -----------------------------------------------------------------
const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'form.field.label.sexFemale'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

export const deceased = defineFormPage({
  id: 'deceased',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Deceased's details",
    description: 'Form section title for Deceased',
    id: 'form.death.deceased.title'
  },
  fields: [
    // ---- Nationality (hidden from hospital clerks) ----
    {
      id: 'deceased.nationality',
      type: FieldType.COUNTRY,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.nationality.label'
      },
      defaultValue: 'TUV',
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    // ---- Form of ID (hidden from hospital clerks) ----
    {
      id: 'deceased.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Form of ID',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.idType.label'
      },
      options: deathIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    // ---- Birth registration number (shown if Birth certificate, hidden from Health) ----
    {
      id: 'deceased.brn',
      type: FieldType.SEARCH,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.brn.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry.',
        description: 'Helper text for birth registration number field',
        id: 'event.death.action.declare.form.section.deceased.field.brn.helperText'
      },
      configuration: {
        query: {
          type: 'or',
          clauses: [
            {
              'legalStatuses.REGISTERED.registrationNumber': {
                term: '{term}',
                type: 'exact'
              }
            }
          ]
        },
        limit: 10,
        offset: 0,
        validation: {
          validator: or(
            field('deceased.brn').matches('^[A-Za-z0-9-]+$'),
            field('deceased.brn').isFalsy()
          ),
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('deceased.idType').isEqualTo(DeathIdType.BIRTH_CERTIFICATE)
          )
        }
      ]
    },
    {
      id: 'deceased.brnText',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.brnText.label'
      },
      value: field('deceased.brn').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('deceased.idType').isEqualTo(DeathIdType.BIRTH_CERTIFICATE)
          )
        }
      ]
    },
    // ---- Passport number (shown if Passport, hidden from Health) ----
    {
      id: 'deceased.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('deceased.idType').isEqualTo(DeathIdType.PASSPORT)
          )
        }
      ]
    },
    // ---- Other ID number (shown if Other, hidden from Health) ----
    {
      id: 'deceased.otherId',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.otherId.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            hasNonHealthNotifierRole,
            field('deceased.idType').isEqualTo(DeathIdType.OTHER)
          )
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'deceased.idDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    },
    // ---- Name ----
    {
      id: 'deceased.name',
      type: FieldType.NAME,
      configuration: tuvaluNameConfig,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Deceased's name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.name.label'
      },
      value: field('deceased.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      validation: [invalidNameValidator('deceased.name')]
    },
    // ---- Sex ----
    {
      id: 'deceased.gender',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.gender.label'
      },
      value: field('deceased.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.gender'
      ]),
      options: genderOptions
    },
    // ---- Date of birth ----
    {
      id: 'deceased.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Cannot be a future date',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.deceased.field.dob.error'
          },
          validator: field('deceased.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: 'Date of birth must be before the date of death',
            description:
              'This is the error message for date of birth later than date of death',
            id: 'event.death.action.declare.form.section.deceased.field.dob.error.laterThanDeath'
          },
          validator: field('deceased.dob')
            .isBefore()
            .date(field('eventDetails.date'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.dob.label'
      },
      value: field('deceased.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('deceased.dobUnknown').isEqualTo(true))
        }
      ]
    },
    // ---- Exact date of birth unknown ----
    {
      id: 'deceased.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Age of deceased ----
    {
      id: 'deceased.age',
      type: FieldType.AGE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Age of deceased',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.date'),
        postfix: {
          defaultMessage: ' years',
          description: 'This is the postfix for age field',
          id: 'event.death.action.declare.form.section.deceased.field.age.postfix'
        }
      },
      value: field('deceased.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.age'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('deceased.dobUnknown').isEqualTo(true)
        }
      ],
      validation: [
        {
          validator: field('deceased.age').asAge().isBetween(0, 120),
          message: {
            defaultMessage: 'Age must be between 0 and 120',
            description: 'Error message for invalid age',
            id: 'event.death.action.declare.form.section.deceased.field.age.error'
          }
        }
      ]
    },
    // ---- Place of birth ----
    {
      id: 'deceased.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.placeOfBirth.label'
      }
    },
    // ---- Divider ----
    {
      id: 'deceased.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // ---- Usual residence heading ----
    {
      id: 'deceased.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Usual residence ----
    {
      id: 'deceased.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      analytics: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('deceased.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'deceased.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    // ---- Lived in Tuvalu since birth ----
    {
      id: 'deceased.livedInTuvaluSinceBirth',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Lived in Tuvalu since birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.livedInTuvaluSinceBirth.label'
      }
    },
    // ---- How long lived in Tuvalu ----
    {
      id: 'deceased.howLongLivedInTuvalu',
      type: FieldType.NUMBER,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'How long lived in Tuvalu',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.howLongLivedInTuvalu.label'
      },
      configuration: {
        postfix: {
          defaultMessage: ' years',
          description: 'Postfix for years',
          id: 'event.death.action.declare.form.section.deceased.field.howLongLivedInTuvalu.postfix'
        }
      }
    },
    // ---- Divider ----
    {
      id: 'deceased.occupationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // ---- Occupation ----
    {
      id: 'deceased.occupation',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.occupation.label'
      }
    },
    // ---- Marital status at time of death ----
    {
      id: 'deceased.maritalStatus',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Marital status at time of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.maritalStatus.label'
      },
      options: deceasedMaritalStatusOptions
    },
    // ---- Date of marriage (shown if married) ----
    {
      id: 'deceased.dateOfMarriage',
      type: FieldType.DATE,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Date of marriage',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.dateOfMarriage.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Cannot be date in the future',
            description: 'Error message for future date of marriage',
            id: 'event.death.action.declare.form.section.deceased.field.dateOfMarriage.error'
          },
          validator: field('deceased.dateOfMarriage').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isMarried
        }
      ]
    },
    // ---- Place of marriage (shown if married) ----
    {
      id: 'deceased.placeOfMarriage',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.placeOfMarriage.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isMarried
        }
      ]
    },
    // ---- Did the deceased have any living children? ----
    {
      id: 'deceased.hasLivingChildren',
      type: FieldType.RADIO_GROUP,
      required: false,
      analytics: true,
      options: yesNoRadioOptions,
      label: {
        defaultMessage: 'Did the deceased have any living children?',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.hasLivingChildren.label'
      }
    }
  ]
})
