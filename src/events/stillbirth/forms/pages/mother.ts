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
import { not, defineFormConditional } from '@opencrvs/toolkit/conditionals'

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
  stillbirthMaritalStatusOptions,
  idNumberValidator
} from '@countryconfig/events/stillbirth/validators'
import { stillbirthEligible } from './eventDetails'

/** True unless the mother's details have been marked as unavailable. */
export const requireMotherDetails = not(
  field('mother.detailsNotAvailable').isEqualTo(true)
)

export const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  conditional: stillbirthEligible,
  title: {
    defaultMessage: "Mother's details",
    description: "Form section title for mother's details",
    id: 'event.stillbirth.action.declare.form.section.mother.title'
  },
  fields: [
    {
      id: 'mother.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'mother.reason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description: "Reason why the mother's details are not available",
        id: 'event.stillbirth.action.declare.form.section.mother.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'mother.detailsDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      analytics: true,
      configuration: tuvaluNameConfig,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.name.label'
      },
      validation: [invalidNameValidator('mother.name')],
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.dob',
      type: FieldType.DATE,
      required: true,
      secured: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must not be a future date',
            description: 'This is the error message for invalid date',
            id: 'event.stillbirth.action.declare.form.section.mother.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before delivery date",
            description:
              "This is the error message for a birth date after the date of delivery",
            id: 'event.stillbirth.action.declare.form.section.mother.field.dob.afterDelivery'
          },
          validator: field('mother.dob')
            .isBefore()
            .date(field('eventDetails.dateOfDelivery'))
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            not(field('mother.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },
    {
      id: 'mother.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.dobUnknown.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails },
        { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }
      ]
    },
    {
      id: 'mother.age',
      type: FieldType.AGE,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Age of mother',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.dateOfDelivery'),
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: 'event.stillbirth.action.declare.form.section.mother.field.age.postfix'
        }
      },
      validation: [
        {
          validator: field('mother.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.stillbirth.action.declare.form.section.mother.field.age.error'
          }
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'mother.nameDobDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.nationality',
      type: FieldType.COUNTRY,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.nationality.label'
      },
      defaultValue: 'TUV',
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.idType.label'
      },
      options: stillbirthIdTypeOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.brnSearch',
      type: FieldType.SEARCH,
      label: {
        defaultMessage: 'Birth registration number lookup',
        description: 'Label for the birth registration number search field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.brnSearch.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry',
        description: 'Helper text for birth registration number field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.brnSearch.helperText'
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
          validator: defineFormConditional({
            type: 'string',
            minLength: 1,
            description: 'Must be a non-empty value'
          }),
          message: {
            defaultMessage:
              'Please enter a birth registration number to search',
            description:
              'Validation message for the birth registration number search field',
            id: 'event.stillbirth.action.declare.form.section.mother.field.brnSearch.validation'
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.idType').isEqualTo(StillbirthIdType.BIRTH_CERTIFICATE)
          )
        },
        { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }
      ]
    },
    {
      id: 'mother.brn',
      type: FieldType.TEXT,
      required: false,
      parent: field('mother.brnSearch'),
      value: field('mother.brnSearch').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      label: {
        defaultMessage: 'Birth registration number',
        description: 'Label for the birth registration number text field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.idType').isEqualTo(StillbirthIdType.BIRTH_CERTIFICATE)
          )
        }
      ]
    },
    {
      id: 'mother.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.idType').isEqualTo(StillbirthIdType.PASSPORT)
          )
        }
      ]
    },
    {
      id: 'mother.idNumber',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.idNumber.label'
      },
      validation: [idNumberValidator('mother.idNumber')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.idType').isEqualTo(StillbirthIdType.OTHER)
          )
        }
      ]
    },
    {
      id: 'mother.maritalStatus',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Marital status',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.maritalStatus.label'
      },
      options: stillbirthMaritalStatusOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.placeOfBirth.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.childrenHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Number of children previously born to the mother',
        description: 'Header for children count section',
        id: 'event.stillbirth.action.declare.form.section.mother.field.childrenHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.livingChildren',
      type: FieldType.NUMBER,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Living',
        description: 'Label for number of living children',
        id: 'event.stillbirth.action.declare.form.section.mother.field.livingChildren.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ],
      configuration: { min: 0 }
    },
    {
      id: 'mother.deceasedChildren',
      type: FieldType.NUMBER,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Deceased',
        description: 'Label for number of deceased children',
        id: 'event.stillbirth.action.declare.form.section.mother.field.deceasedChildren.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ],
      configuration: { min: 0 }
    },
    {
      id: 'mother.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() },
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.address',
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.address.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('mother.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'mother.address',
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
      id: 'mother.occupationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'mother.occupation',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.mother.field.occupation.label'
      },
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    }
  ]
})
