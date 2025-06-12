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
  FieldType,
  AddressType,
  or,
  PageTypes,
  field,
  never
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import { applicationConfig } from '@countryconfig/api/application/application-config'

import { createSelectOptions, emptyMessage } from '@countryconfig/form/v2/utils'
import {
  invalidNameValidator,
  MAX_NAME_LENGTH,
  nationalIdValidator
} from '@countryconfig/form/v2/death/validators'
import {
  maritalStatusOptions,
  PersonType,
  yesNoRadioOptions,
  YesNoTypes
} from '@countryconfig/form/v2/person'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
} as const

export const PlaceOfBirth = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  PRIVATE_HOME: 'PRIVATE_HOME',
  OTHER: 'OTHER'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'v2.form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'v2.form.field.label.sexFemale'
  },
  UNKNOWN: {
    defaultMessage: 'Unknown',
    description: 'Label for option unknown',
    id: 'v2.form.field.label.sexUnknown'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

export const requireDeceasedDetails = or(
  field('informant.relation').isEqualTo(PersonType.deceased)
)

export const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_REGISTRATION_NUMBER: 'BIRTH_REGISTRATION_NUMBER',
  NONE: 'NONE'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypePassport'
  },
  BIRTH_REGISTRATION_NUMBER: {
    defaultMessage: 'Birth Registration Number',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeBRN'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

export const idTypeOptions = createSelectOptions(
  IdType,
  idTypeMessageDescriptors
)

export const deceased = defineFormPage({
  id: 'deceased',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Deceased's details",
    description: 'Form section title for Deceased',
    id: 'v2.form.death.deceased.title'
  },
  fields: [
    {
      id: 'deceased.firstname',
      type: FieldType.TEXT,
      configuration: { maxLength: MAX_NAME_LENGTH },
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.firstname.label'
      },
      validation: [invalidNameValidator('deceased.firstname')]
    },
    {
      id: 'deceased.surname',
      type: FieldType.TEXT,
      configuration: { maxLength: MAX_NAME_LENGTH },
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.surname.label'
      },
      validation: [invalidNameValidator('deceased.surname')]
    },
    {
      id: 'deceased.gender',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.gender.label'
      },
      options: genderOptions
    },
    {
      id: `${PersonType.deceased}.dob`,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.death.action.declare.form.section.deceased.field.dob.error'
          },
          validator: field('deceased.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.dob.label'
      }
    },
    {
      id: `${PersonType.deceased}.dobUnknown`,
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.age.checkbox.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: `${PersonType.deceased}.nationality`,
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.nationality.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        }
      ],
      defaultValue: 'FAR'
    },
    {
      id: `${PersonType.deceased}.idType`,
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.idType.label`
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        }
      ]
    },
    {
      id: 'deceased.nid',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.nid.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('deceased.idType').isEqualTo(IdType.NATIONAL_ID),
            requireDeceasedDetails
          )
        }
      ],
      validation: [
        nationalIdValidator('deceased.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'v2.event.death.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('deceased.nid').isEqualTo(field('father.nid'))),
            not(field('deceased.nid').isEqualTo(field('informant.nid')))
          )
        }
      ]
    },
    {
      id: `${PersonType.deceased}.passport`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.passport.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field(`${PersonType.deceased}.idType`).isEqualTo(IdType.PASSPORT),
            requireDeceasedDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.deceased}.brn`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.brn.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field(`${PersonType.deceased}.idType`).isEqualTo(
              IdType.BIRTH_REGISTRATION_NUMBER
            ),
            requireDeceasedDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.deceased}.maritalStatus`,
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.maritalStatus.label`
      },
      options: maritalStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        }
      ]
    },
    {
      id: 'deceased.nodependants',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'No. of dependants',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.nodependants.label'
      }
    },

    {
      id: `${PersonType.deceased}.addressDivider`,
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        }
      ]
    },
    {
      id: `${PersonType.father}.addressHelper`,
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.person.field.addressHelper.label`
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        }
      ]
    },
    {
      id: 'deceased.address',
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        }
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    }
  ]
})
