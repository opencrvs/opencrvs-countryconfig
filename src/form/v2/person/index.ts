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

import { FieldConfig, TranslationConfig } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'
import { getAddressFields } from './address'
import { appendConditionalsToFields, createSelectOptions } from '../utils'

export const PersonType = {
  father: 'father',
  mother: 'mother',
  informant: 'informant',
  applicant: 'applicant'
} as const

export type PersonType = keyof typeof PersonType

const IDTypes = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_REGISTRATION_NUMBER: 'BIRTH_REGISTRATION_NUMBER',
  NONE: 'NONE'
} as const

const MaritalStatus = {
  SINGLE: 'SINGLE',
  MARRIED: 'MARRIED',
  WIDOWED: 'WIDOWED',
  DIVORCED: 'DIVORCED',
  SEPARATED: 'SEPARATED',
  NOT_STATED: 'NOT_STATED'
} as const

const EducationalAttainment = {
  NO_SCHOOLING: 'NO_SCHOOLING',
  PRIMARY_ISCED_1: 'PRIMARY_ISCED_1',
  POST_SECONDARY_ISCED_4: 'POST_SECONDARY_ISCED_4',
  FIRST_STAGE_TERTIARY_ISCED_5: 'FIRST_STAGE_TERTIARY_ISCED_5'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_REGISTRATION_NUMBER: {
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBRN'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof IDTypes, TranslationConfig>

const maritalStatusMessageDescriptors = {
  SINGLE: {
    defaultMessage: 'Single',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusSingle'
  },
  MARRIED: {
    defaultMessage: 'Married',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusMarried'
  },
  WIDOWED: {
    defaultMessage: 'Widowed',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusWidowed'
  },
  DIVORCED: {
    defaultMessage: 'Divorced',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusDivorced'
  },
  SEPARATED: {
    defaultMessage: 'Separated',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusSeparated'
  },
  NOT_STATED: {
    defaultMessage: 'Not stated',
    description: 'Option for form field: Marital status',
    id: 'form.field.label.maritalStatusNotStated'
  }
} satisfies Record<keyof typeof MaritalStatus, TranslationConfig>

const educationalAttainmentMessageDescriptors = {
  NO_SCHOOLING: {
    defaultMessage: 'No schooling',
    description: 'Option for form field: no education',
    id: 'form.field.label.educationAttainmentNone'
  },
  PRIMARY_ISCED_1: {
    defaultMessage: 'Primary',
    description: 'Option for form field: ISCED1 education',
    id: 'form.field.label.educationAttainmentISCED1'
  },
  POST_SECONDARY_ISCED_4: {
    defaultMessage: 'Secondary',
    description: 'Option for form field: ISCED4 education',
    id: 'form.field.label.educationAttainmentISCED4'
  },
  FIRST_STAGE_TERTIARY_ISCED_5: {
    defaultMessage: 'Tertiary',
    description: 'Option for form field: ISCED5 education',
    id: 'form.field.label.educationAttainmentISCED5'
  }
} satisfies Record<keyof typeof EducationalAttainment, TranslationConfig>

const idTypeOptions = createSelectOptions(IDTypes, idTypeMessageDescriptors)

const maritalStatusOptions = createSelectOptions(
  MaritalStatus,
  maritalStatusMessageDescriptors
)
const educationalAttainmentOptions = createSelectOptions(
  EducationalAttainment,
  educationalAttainmentMessageDescriptors
)

const YesNoTypes = {
  YES: 'YES',
  NO: 'NO'
} as const

const yesNoMessageDescriptors = {
  YES: {
    defaultMessage: 'Yes',
    id: 'form.field.label.Yes',
    description: 'Label for form field radio option Yes'
  },
  NO: {
    defaultMessage: 'No',
    id: 'form.field.label.No',
    description: 'Label for form field radio option No'
  }
} satisfies Record<keyof typeof YesNoTypes, TranslationConfig>

const yesNoRadioOptions = createSelectOptions(
  YesNoTypes,
  yesNoMessageDescriptors
)

const getIdFields = (person: PersonType): FieldConfig[] => [
  {
    id: `${person}.idType`,
    type: 'SELECT',
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.idType.label`
    },
    options: idTypeOptions
  },
  {
    id: `${person}.nid`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.nid.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(`${person}.idType`)
          .or((field) => field.isUndefined().not.inArray(['NATIONAL_ID']))
          .apply()
      }
    ]
  },
  {
    id: `${person}.passport`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.passport.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(`${person}.idType`)
          .or((field) => field.isUndefined().not.inArray(['PASSPORT']))
          .apply()
      }
    ]
  },
  {
    id: `${person}.brn`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.brn.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(`${person}.idType`)
          .or((field) =>
            field.isUndefined().not.inArray(['BIRTH_REGISTRATION_NUMBER'])
          )
          .apply()
      }
    ]
  }
]

export const getPersonInputCommonFields = (
  person: PersonType
): FieldConfig[] => [
  {
    id: `${person}.firstname`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'First name(s)',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.firstname.label`
    }
  },
  {
    id: `${person}.surname`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'Last name',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.surname.label`
    }
  },
  {
    id: `${person}.dob`,
    type: 'DATE',
    required: true,
    validation: [
      {
        message: {
          defaultMessage: 'Please enter a valid date',
          description: 'This is the error message for invalid date',
          id: `event.birth.action.declare.form.section.${person}.field.dob.error`
        },
        validator: field(`${person}.dob`).isBeforeNow().apply()
      }
    ],
    label: {
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.dob.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(`${person}.dobUnknown`).isEqualTo('true').apply()
      }
    ]
  },
  {
    id: `${person}.dobUnknown`,
    type: 'CHECKBOX',
    required: true,
    label: {
      defaultMessage: 'Exact date of birth unknown',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.age.label`
    }
  },
  {
    id: `${person}.age`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: `Age of ${person}`,
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.age.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(`${person}.dobUnknown`)
          .or((field) => field.isUndefined().inArray(['false']))
          .apply()
      }
    ]
  },
  {
    id: `${person}.nationality`,
    type: 'COUNTRY',
    required: true,
    label: {
      defaultMessage: 'Nationality',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.nationality.label`
    }
  },
  ...getIdFields(person),
  {
    id: `${person}.addressHelper`,
    type: 'PARAGRAPH',
    label: {
      defaultMessage: 'Usual place of residence',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.addressHelper.label`
    },
    options: { fontVariant: 'h2' }
  }
]

const fatherAddressFields = [
  ...appendConditionalsToFields({
    inputFields: [
      {
        id: `${PersonType.father}.addressSameAsHelper`,
        type: 'PARAGRAPH',
        label: {
          defaultMessage: "Same as mother's usual place of residence?",
          description: 'This is the label for the field',
          id: `event.birth.action.declare.form.section.${PersonType.father}.field.addressSameAsHelper.label`
        },
        options: { fontVariant: 'reg16' }
      },
      {
        id: `${PersonType.father}.addressSameAs`,
        type: 'RADIO_GROUP',
        options: yesNoRadioOptions,
        required: true,
        label: {
          defaultMessage: "Same as mother's usual place of residence?",
          description: 'This is the label for the field',
          id: `event.birth.action.declare.form.section.${PersonType.father}.field.address.addressSameAs.label`
        }
      }
    ],
    newConditionals: [
      {
        type: 'HIDE',
        conditional: field(`${PersonType.mother}.detailsNotAvailable`)
          .inArray(['true'])
          .apply()
      }
    ]
  }),
  ...appendConditionalsToFields({
    inputFields: getAddressFields(PersonType.father),
    newConditionals: [
      {
        type: 'HIDE',
        conditional: field(`${PersonType.father}.addressSameAs`)
          .inArray([YesNoTypes.YES])
          .apply()
      }
    ]
  })
]
export const getPersonInputFields = (person: PersonType): FieldConfig[] => {
  const isFather = person === PersonType.father
  return [
    ...getPersonInputCommonFields(person),
    ...(isFather ? fatherAddressFields : getAddressFields(person)),
    {
      id: `${person}.maritalStatus`,
      type: 'SELECT',
      required: false,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.maritalStatus.label`
      },
      options: maritalStatusOptions
    },
    {
      id: `${person}.educationalAttainment`,
      type: 'SELECT',
      required: false,
      label: {
        defaultMessage: 'Level of education',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.educationalAttainment.label`
      },
      options: educationalAttainmentOptions
    },
    {
      id: `${person}.occupation`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.occupation.label`
      }
    }
  ]
}
