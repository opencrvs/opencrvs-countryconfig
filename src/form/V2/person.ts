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

import { FieldConfig, SelectOption } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'
import { countries } from './countries'
import { appendConditionalsToFields, concatFields } from './utils'

const idTypeOptions: SelectOption[] = [
  {
    value: 'NATIONAL_ID' as const,
    label: {
      defaultMessage: 'National ID',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeNationalID'
    }
  },
  {
    value: 'PASSPORT' as const,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypePassport'
    }
  },
  {
    value: 'BIRTH_REGISTRATION_NUMBER' as const,
    label: {
      defaultMessage: 'Birth Registration Number',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeBRN'
    }
  },
  {
    value: 'NONE' as const,
    label: {
      defaultMessage: 'None',
      description: 'Option for form field: Type of ID',
      id: 'form.field.label.iDTypeNone'
    }
  }
]

export const getInformantFields = (person: string): FieldConfig[] => [
  {
    id: `${person}.firstname`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'First name',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.firstname.label`
    },
    conditionals: []
  },
  {
    id: `${person}.surname`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'Surname',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.surname.label`
    },
    conditionals: []
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
        validator: field(concatFields([person, 'dob'])).isBeforeNow()
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
        conditional: field(concatFields([person, 'dobUnknown'])).isEqualTo(
          'true'
        )
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
    },
    conditionals: []
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
        conditional: field(
          concatFields([person, 'dobUnknown'])
        ).isUndefinedOrInArray(['false'])
      }
    ]
  },
  {
    id: `${person}.nationality`,
    type: 'SELECT',
    required: true,
    label: {
      defaultMessage: 'Nationality',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.nationality.label`
    },
    options: countries,
    conditionals: []
  },
  ...getIdFields(person),
  ...getAddressFields(person)
]

export const getPersonInputFields = (person: string): FieldConfig[] => [
  ...getInformantFields(person),
  {
    id: `${person}.maritalStatus`,
    type: 'SELECT',
    required: true,
    label: {
      defaultMessage: 'Marital Status',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.maritalStatus.label`
    },
    options: maritalStatusOptions,
    conditionals: []
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
    options: educationalAttainmentOptions,
    conditionals: []
  },
  {
    id: `${person}.occupation`,
    type: 'TEXT',
    required: false,
    label: {
      defaultMessage: 'Occupation',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.occupation.label`
    },
    conditionals: []
  }
]

const getIdFields = (person: string): FieldConfig[] => [
  {
    id: `${person}.idType`,
    type: 'SELECT',
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.idType.label`
    },
    options: idTypeOptions,
    conditionals: []
  },
  {
    id: `${person}.nid`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'NID Number',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.nid.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(
          concatFields([person, 'idType'])
        ).isUndefinedOrNotInArray(['NATIONAL_ID'])
      }
    ]
  },
  {
    id: `${person}.passport`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'Passport Number',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.passport.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(
          concatFields([person, 'idType'])
        ).isUndefinedOrNotInArray(['PASSPORT'])
      }
    ]
  },
  {
    id: `${person}.brn`,
    type: 'TEXT',
    required: true,
    label: {
      defaultMessage: 'Birth Registration Number',
      description: 'This is the label for the field',
      id: `event.birth.action.declare.form.section.${person}.field.brn.label`
    },
    conditionals: [
      {
        type: 'HIDE',
        conditional: field(
          concatFields([person, 'idType'])
        ).isUndefinedOrNotInArray(['BIRTH_REGISTRATION_NUMBER'])
      }
    ]
  }
]

const getAddressFields = (person: string): FieldConfig[] => {
  // @Todo: Same as mother or deseased
  const prefix = `${person}.address`

  const genericAddressFields: FieldConfig[] = [
    {
      id: `${prefix}.state`,
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'State',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.state.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.district`,
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'District',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.district.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.town`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'City / Town',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.town.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.addressLine1`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Address Line 1',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.addressLine1.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.addressLine2`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Address Line 2',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.addressLine2.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.addressLine3`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Address Line 3',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.addressLine3.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.zipCode`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.zipCode.label`
      },
      conditionals: []
    }
  ]

  const farajalandAddressFields: FieldConfig[] = [
    {
      id: `${prefix}.province`,
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'Province',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.province.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.district`,
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'District',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.district.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.town`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Town',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.town.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.residentialArea`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Residential Area',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.residentialArea.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.village`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Area / Ward / Mouja / Village',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.village.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.number`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Number',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.number.label`
      },
      conditionals: []
    },
    {
      id: `${prefix}.zipCode`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.zipCode.label`
      },
      conditionals: []
    }
  ]

  return [
    {
      id: `${prefix}.country`,
      type: 'SELECT',
      required: true,
      label: {
        defaultMessage: 'Country',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.${person}.field.address.country.label`
      },
      options: countries,
      conditionals: []
    },
    ...appendConditionalsToFields({
      inputFields: genericAddressFields,
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field(
            concatFields([person, 'address', 'country'])
          ).isUndefinedOrInArray(['FAR'])
        }
      ]
    }),
    ...appendConditionalsToFields({
      inputFields: farajalandAddressFields,
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field(
            concatFields([person, 'address', 'country'])
          ).isUndefinedOrNotInArray(['FAR'])
        }
      ]
    })
  ]
}

export const maritalStatusOptions: SelectOption[] = [
  {
    value: 'SINGLE',
    label: {
      defaultMessage: 'Single',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusSingle'
    }
  },
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Married',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusMarried'
    }
  },
  {
    value: 'WIDOWED',
    label: {
      defaultMessage: 'Widowed',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusWidowed'
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
    value: 'SEPARATED',
    label: {
      id: 'form.field.label.maritalStatusSeparated',
      defaultMessage: 'Separated',
      description: 'Option for form field: Marital status'
    }
  },
  {
    value: 'NOT_STATED',
    label: {
      defaultMessage: 'Not stated',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusNotStated'
    }
  }
]

export const educationalAttainmentOptions: SelectOption[] = [
  {
    value: 'NO_SCHOOLING',
    label: {
      defaultMessage: 'No schooling',
      description: 'Option for form field: no education',
      id: 'form.field.label.educationAttainmentNone'
    }
  },
  {
    value: 'PRIMARY_ISCED_1',
    label: {
      defaultMessage: 'Primary',
      description: 'Option for form field: ISCED1 education',
      id: 'form.field.label.educationAttainmentISCED1'
    }
  },
  {
    value: 'POST_SECONDARY_ISCED_4',
    label: {
      defaultMessage: 'Secondary',
      description: 'Option for form field: ISCED4 education',
      id: 'form.field.label.educationAttainmentISCED4'
    }
  },
  {
    value: 'FIRST_STAGE_TERTIARY_ISCED_5',
    label: {
      defaultMessage: 'Tertiary',
      description: 'Option for form field: ISCED5 education',
      id: 'form.field.label.educationAttainmentISCED5'
    }
  }
]
