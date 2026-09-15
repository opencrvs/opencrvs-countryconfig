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
  and,
  AddressType,
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  never,
  PageTypes,
  user
} from '@opencrvs/toolkit/events'
import { not, or, defineFormConditional } from '@opencrvs/toolkit/conditionals'

import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getNestedFieldValidators,
  informantMessageDescriptors
} from '@countryconfig/events/utils'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'
import {
  StillbirthIdType,
  stillbirthIdTypeOptions,
  idNumberValidator
} from '@countryconfig/events/stillbirth/validators'
import { stillbirthEligible } from './eventDetails'

export const InformantType = {
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  MOTHER_AND_FATHER: 'MOTHER_AND_FATHER',
  OTHER: 'OTHER'
} as const

const informantTypeOptions = [
  { value: InformantType.MOTHER, label: informantMessageDescriptors.MOTHER },
  { value: InformantType.FATHER, label: informantMessageDescriptors.FATHER },
  {
    value: InformantType.MOTHER_AND_FATHER,
    label: informantMessageDescriptors.MOTHER_AND_FATHER
  },
  { value: InformantType.OTHER, label: informantMessageDescriptors.OTHER }
]

/** True only when the informant is someone other than the mother/father — the person's own details must be collected. */
export const isOtherInformant = field('informant.relation').isEqualTo(
  InformantType.OTHER
)

export const informant = defineFormPage({
  id: 'informant',
  type: PageTypes.enum.FORM,
  conditional: stillbirthEligible,
  title: {
    defaultMessage: "Informant's details",
    description: "Form section title for informant's details",
    id: 'event.stillbirth.action.declare.form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Informant type',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.relation.label'
      },
      options: informantTypeOptions
    },
    {
      id: 'informant.other.relation',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Relationship to the family',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.other.relation.label'
      },
      helperText: {
        defaultMessage: 'Please specify relationship to the family',
        description:
          'Helper text for informant relation when "Other" is selected',
        id: 'event.stillbirth.action.declare.form.section.informant.field.other.relation.helperText'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      configuration: tuvaluNameConfig,
      label: {
        defaultMessage: "Informant's full name",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.name.label'
      },
      validation: [invalidNameValidator('informant.name')],
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.dob',
      type: FieldType.DATE,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isOtherInformant,
            not(field('informant.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },
    {
      id: 'informant.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.dobUnknown.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.age',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Age in years',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.age.label'
      },
      configuration: { min: 0 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isOtherInformant,
            field('informant.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'informant.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.nationality.label'
      },
      defaultValue: 'TUV',
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.idType.label'
      },
      options: stillbirthIdTypeOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.idNumber',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.idNumber.label'
      },
      validation: [idNumberValidator('informant.idNumber')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            isOtherInformant,
            not(field('informant.idType').isEqualTo(StillbirthIdType.NONE)),
            not(field('informant.idType').isFalsy())
          )
        }
      ]
    },
    {
      id: 'informant.residenceDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.residenceHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Residence',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.residenceHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() },
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.address',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: "Informant's residential address",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.address.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
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
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: { streetAddressForm: defaultStreetAddressConfiguration }
    },
    {
      id: 'informant.occupationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.occupation',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.occupation.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'informant.contactDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'informant.contactHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Point of contact',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.contactHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }
      ]
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid phone number',
            description: 'This is the error message for invalid phone number',
            id: 'event.stillbirth.error.invalidPhoneNumber'
          },
          validator: or(
            defineFormConditional({
              type: 'object',
              properties: {
                'informant.phoneNo': { type: 'string', pattern: '^[0-9]+$' }
              }
            }),
            field('informant.phoneNo').isFalsy()
          )
        }
      ]
    },
    {
      id: 'informant.email',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.informant.field.email.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid email address',
            description: 'This is the error message for invalid email',
            id: 'event.stillbirth.error.invalidEmail'
          },
          validator: or(
            defineFormConditional({
              type: 'object',
              properties: {
                'informant.email': { type: 'string', format: 'email' }
              }
            }),
            field('informant.email').isFalsy()
          )
        }
      ]
    }
  ]
})
