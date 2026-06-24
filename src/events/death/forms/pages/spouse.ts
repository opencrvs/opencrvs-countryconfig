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
  never,
  field,
  or,
  PageTypes,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

import { InformantType } from './informant'
import {
  yesNoRadioOptions,
  YesNoTypes,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  emptyMessage
} from '@countryconfig/events/utils'

const SpouseIdType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const spouseIdTypeOptions = [
  {
    value: SpouseIdType.BIRTH_CERTIFICATE,
    label: {
      defaultMessage: 'Birth certificate',
      description: 'Option for ID type: birth certificate',
      id: 'event.death.action.declare.form.section.spouse.field.idType.option.birthCertificate'
    }
  },
  {
    value: SpouseIdType.PASSPORT,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for ID type: passport',
      id: 'event.death.action.declare.form.section.spouse.field.idType.option.passport'
    }
  },
  {
    value: SpouseIdType.OTHER,
    label: {
      defaultMessage: 'Other',
      description: 'Option for ID type: other',
      id: 'event.death.action.declare.form.section.spouse.field.idType.option.other'
    }
  }
]

const requireSpouseDetails = or(
  field('spouse.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.SPOUSE)
)

const notHospitalClerk = not(user.hasRole('HOSPITAL_CLERK'))

export const spouse = defineFormPage({
  id: 'spouse',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Spouse details',
    description: 'Form section title for spouse details',
    id: 'form.section.spouse.title'
  },
  conditional: field('deceased.maritalStatus').isEqualTo('MARRIED'),
  fields: [
    {
      id: 'spouse.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Spouse's details are not available",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('spouse.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'spouse.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        }
      ]
    },
    {
      id: 'spouse.reason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.SPOUSE))
          )
        }
      ]
    },
    // ---- Nationality (hidden from hospital clerks) ----
    {
      id: 'spouse.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(requireSpouseDetails, notHospitalClerk)
        }
      ],
      defaultValue: 'TUV'
    },
    // ---- ID type (hidden from hospital clerks) ----
    {
      id: 'spouse.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.idType.label'
      },
      options: spouseIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(requireSpouseDetails, notHospitalClerk)
        }
      ]
    },
    // ---- Birth certificate number ----
    {
      id: 'spouse.brn',
      type: FieldType.SEARCH,
      required: false,
      label: {
        defaultMessage: 'Birth registration number lookup',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.brn.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry.',
        description: 'Helper text for birth registration number field',
        id: 'event.death.action.declare.form.section.spouse.field.brn.helperText'
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
            field('spouse.brn').matches('^[A-Za-z0-9-]+$'),
            field('spouse.brn').isFalsy()
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
            field('spouse.idType').isEqualTo(SpouseIdType.BIRTH_CERTIFICATE),
            requireSpouseDetails,
            notHospitalClerk
          )
        }
      ]
    },
    {
      id: 'spouse.brnText',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.brnText.label'
      },
      value: field('spouse.brn').getByPath([
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
            field('spouse.idType').isEqualTo(SpouseIdType.BIRTH_CERTIFICATE),
            requireSpouseDetails,
            notHospitalClerk
          )
        }
      ]
    },
    // ---- Passport number ----
    {
      id: 'spouse.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(SpouseIdType.PASSPORT),
            requireSpouseDetails,
            notHospitalClerk
          )
        }
      ]
    },
    // ---- Other ID number ----
    {
      id: 'spouse.otherId',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.otherId.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(SpouseIdType.OTHER),
            requireSpouseDetails,
            notHospitalClerk
          )
        }
      ]
    },
    {
      id: 'spouse.name',
      configuration: tuvaluNameConfig,
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Spouse's name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.name.label'
      },
      value: field('spouse.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      validation: [invalidNameValidator('spouse.name')]
    },
    {
      id: 'spouse.dob',
      type: FieldType.DATE,
      required: false,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.spouse.field.dob.error'
          },
          validator: field('spouse.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.dob.label'
      },
      value: field('spouse.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('spouse.dobUnknown').isEqualTo(true)),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'spouse.age',
      type: FieldType.AGE,
      required: false,
      label: {
        defaultMessage: 'Age of spouse',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.date'),
        postfix: {
          defaultMessage: ' years',
          description: 'This is the postfix for age field',
          id: 'event.death.action.declare.form.section.spouse.field.age.postfix'
        }
      },
      value: field('spouse.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.age'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.dobUnknown').isEqualTo(true),
            requireSpouseDetails
          )
        }
      ],
      validation: [
        {
          validator: field('spouse.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.action.declare.form.section.person.field.age.error'
          }
        }
      ]
    },
    {
      id: 'spouse.placeOfBirth',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(requireSpouseDetails, notHospitalClerk)
        }
      ]
    },
    {
      id: 'spouse.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    },
    {
      id: 'spouse.occupation',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    }
  ]
})
