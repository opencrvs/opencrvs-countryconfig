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
  AddressType,
  and,
  ConditionalType,
  defineFormPage,
  FieldType,
  PageTypes,
  field,
  user
} from '@opencrvs/toolkit/events'
import { or, not, never, defineConditional } from '@opencrvs/toolkit/conditionals'

import {
  tuvaluNameConfig,
  invalidNameValidator,
} from '@countryconfig/events/birth/validators'
import { InformantType } from './informant'
import {
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  BirthIdType,
  birthIdTypeOptions,
  hasNonHealthNotifierRole
} from '@countryconfig/events/utils'

export const requireFatherDetails = or(
  field('father.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.FATHER)
)

export const father = defineFormPage({
  id: 'father',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Father's details",
    description: 'Form section title for fathers details',
    id: 'form.section.father.title'
  },
  fields: [
    {
      id: 'father.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: "Father's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(field('informant.relation').isEqualTo(InformantType.FATHER),
            field('informant.relation').isEqualTo(InformantType.MOTHER_AND_FATHER))
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'father.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(field('informant.relation').isEqualTo(InformantType.FATHER),
            field('informant.relation').isEqualTo(InformantType.MOTHER_AND_FATHER))
          )
        }
      ]
    },
    {
      id: 'father.reason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.FATHER))
          )
        }
      ]
    },
    {
      id: 'father.nationality',
      type: FieldType.COUNTRY,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            hasNonHealthNotifierRole
          )
        }
      ],
      defaultValue: 'TUV'
    },
    {
      id: 'father.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.idType.label'
      },
      options: birthIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'father.brnSearch',
      type: FieldType.SEARCH,
      label: {
        defaultMessage: 'Search birth registration number',
        description: 'Label for the birth registration number search field',
        id: 'event.birth.action.declare.form.section.father.field.brnSearch.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry. manually.',
        description: 'Helper text for the birth registration number search field',
        id: 'event.birth.action.declare.form.section.father.field.brnSearch.helperText'
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
          validator: defineConditional({
            type: 'string',
            minLength: 1,
            description: 'Must be a non-empty value'
          }),
          message: {
            defaultMessage: 'Please enter a birth registration number to search',
            description: 'Validation message for the birth registration number search field',
            id: 'event.birth.action.declare.form.section.father.field.brnSearch.validation'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'Record found',
            description: 'Indicator shown when a birth record is found',
            id: 'event.birth.action.declare.form.section.father.field.brnSearch.indicators.ok'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear birth record?',
              description: 'Title for the clear search confirmation modal',
              id: 'event.birth.action.declare.form.section.father.field.brnSearch.indicators.clearModal.title'
            },
            description: {
              defaultMessage:
                'This will remove the auto-filled details for the father.',
              description: 'Description for the clear search confirmation modal',
              id: 'event.birth.action.declare.form.section.father.field.brnSearch.indicators.clearModal.description'
            }
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.idType').isEqualTo(BirthIdType.BIRTH_CERTIFICATE),
            requireFatherDetails,
            hasNonHealthNotifierRole
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'father.brn',
      type: FieldType.TEXT,
      required: false,
      parent: field('father.brnSearch'),
      value: field('father.brnSearch').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      label: {
        defaultMessage: 'Birth registration number',
        description: 'Label for the birth registration number text field',
        id: 'event.birth.action.declare.form.section.father.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.idType').isEqualTo(BirthIdType.BIRTH_CERTIFICATE),
            requireFatherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'father.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.idType').isEqualTo(BirthIdType.PASSPORT),
            requireFatherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'father.nid',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.idType').isEqualTo(BirthIdType.OTHER),
            requireFatherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'father.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(requireFatherDetails, hasNonHealthNotifierRole)
        }
      ]
    },
    {
      id: 'father.name',
      type: FieldType.NAME,
      required: true,
      configuration: tuvaluNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Father's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.name.label'
      },
      value: field('father.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ],
      validation: [invalidNameValidator('father.name')]
    },
    {
      id: 'father.dob',
      type: 'DATE',
      analytics: true,
      required: true,
      secured: true,
      value: field('father.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('father.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('father.dob').isBefore().date(field('child.dob'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('father.dobUnknown').isEqualTo(true)),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: 'father.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'father.age',
      type: FieldType.AGE,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Age of father (at the time of event)',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.age.label'
      },
      configuration: {
        asOfDate: field('child.dob'),
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: 'event.birth.action.declare.form.section.person.field.age.postfix'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.dobUnknown').isEqualTo(true),
            requireFatherDetails
          )
        }
      ],
      validation: [
        {
          validator: field('father.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.action.declare.form.section.person.field.age.error'
          }
        }
      ]
    },
    {
      id: 'father.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: "Label for father's place of birth",
        id: 'event.birth.action.declare.form.section.father.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.addressHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        },
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressSameAs',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: "Same as mother's residence?",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.address.addressSameAs.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.detailsNotAvailable').isFalsy(),
            field('father.detailsNotAvailable').isFalsy()
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.addressSameAs').isEqualTo(true)
        }
      ]
    },
    {
      id: 'father.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireFatherDetails,
            not(field('father.addressSameAs').isEqualTo(true))
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
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    {
      id: 'father.addressDivider3',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.occupation',
      type: FieldType.TEXT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    }
  ]
})
