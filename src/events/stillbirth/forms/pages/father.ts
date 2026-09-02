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
  PageTypes,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getNestedFieldValidators
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

/** True unless the father's details have been marked as unavailable. */
export const requireFatherDetails = not(
  field('father.detailsNotAvailable').isEqualTo(true)
)

export const father = defineFormPage({
  id: 'father',
  type: PageTypes.enum.FORM,
  conditional: stillbirthEligible,
  title: {
    defaultMessage: "Father's details",
    description: "Form section title for father's details",
    id: 'event.stillbirth.action.declare.form.section.father.title'
  },
  fields: [
    {
      id: 'father.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Father's details are not available",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'father.reason',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description: "Reason why the father's details are not available",
        id: 'event.stillbirth.action.declare.form.section.father.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('father.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'father.detailsDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      configuration: tuvaluNameConfig,
      label: {
        defaultMessage: "Father's full name",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.name.label'
      },
      validation: [invalidNameValidator('father.name')],
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.dob',
      type: FieldType.DATE,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must not be a future date',
            description: 'This is the error message for invalid date',
            id: 'event.stillbirth.action.declare.form.section.father.field.dob.error'
          },
          validator: field('father.dob').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            not(field('father.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },
    {
      id: 'father.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date unknown',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.dobUnknown.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.dobUnknown').isEqualTo(true)
        }
      ]
    },
    {
      id: 'father.age',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Age in years',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.age.label'
      },
      configuration: { min: 0 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            field('father.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'father.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.placeOfBirth.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.nationality.label'
      },
      defaultValue: 'TUV',
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.idType.label'
      },
      options: stillbirthIdTypeOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.idNumber',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.idNumber.label'
      },
      validation: [idNumberValidator('father.idNumber')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            not(field('father.idType').isEqualTo(StillbirthIdType.NONE)),
            not(field('father.idType').isFalsy())
          )
        }
      ]
    },
    {
      id: 'father.residenceDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.residenceHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Residence',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.residenceHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.sameAsMotherResidence').isFalsy()
        },
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.sameAsMotherResidence',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Same as mother's residence",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.sameAsMotherResidence.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.address',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: "Father's residential address",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            not(field('father.sameAsMotherResidence').isEqualTo(true))
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
          validator: field('father.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'father.address',
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
      id: 'father.occupationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'father.occupation',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.father.field.occupation.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    }
  ]
})
