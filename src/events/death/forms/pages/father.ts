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
import {
  emptyMessage,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  yesNoRadioOptions,
  YesNoTypes
} from '@countryconfig/events/utils'

const DeathFatherIdType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const deathFatherIdTypeOptions = [
  {
    value: DeathFatherIdType.BIRTH_CERTIFICATE,
    label: {
      defaultMessage: 'Birth certificate',
      description: 'Option for ID type: birth certificate',
      id: 'event.death.action.declare.form.section.father.field.idType.option.birthCertificate'
    }
  },
  {
    value: DeathFatherIdType.PASSPORT,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for ID type: passport',
      id: 'event.death.action.declare.form.section.father.field.idType.option.passport'
    }
  },
  {
    value: DeathFatherIdType.OTHER,
    label: {
      defaultMessage: 'Other',
      description: 'Option for ID type: other',
      id: 'event.death.action.declare.form.section.father.field.idType.option.other'
    }
  }
]

const FatherLivingStatus = {
  ALIVE: 'ALIVE',
  DECEASED: 'DECEASED'
} as const

const fatherLivingStatusOptions = [
  {
    value: FatherLivingStatus.ALIVE,
    label: {
      defaultMessage: 'Alive',
      description: 'Option for living status: alive',
      id: 'event.death.action.declare.form.section.father.field.livingStatus.option.alive'
    }
  },
  {
    value: FatherLivingStatus.DECEASED,
    label: {
      defaultMessage: 'Deceased',
      description: 'Option for living status: deceased',
      id: 'event.death.action.declare.form.section.father.field.livingStatus.option.deceased'
    }
  }
]

const notHospitalClerk = not(user.hasRole('HOSPITAL_CLERK'))
const fatherDetailsAvailable = not(
  field('father.detailsNotAvailable').isEqualTo(true)
)
const notDeceased = not(
  field('father.livingStatus').isEqualTo(FatherLivingStatus.DECEASED)
)

export const father = defineFormPage({
  id: 'father',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Father's details",
    description: "Form section title for father's details",
    id: 'form.death.father.title'
  },
  fields: [
    // ---- Father details not available ----
    {
      id: 'father.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Father's details are not available",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    // ---- Reason (shown if details not available) ----
    {
      id: 'father.reason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description:
          "Reason why the father's details are not available",
        id: 'event.death.action.declare.form.section.father.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('father.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    // ---- Divider (hides rest of page if details not available) ----
    {
      id: 'father.detailsDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: fatherDetailsAvailable
        }
      ]
    },
    // ---- Living status (hidden from hospital clerks) ----
    {
      id: 'father.livingStatus',
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Living status',
        description: "This is the label for the father's living status",
        id: 'event.death.action.declare.form.section.father.field.livingStatus.label'
      },
      options: fatherLivingStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(fatherDetailsAvailable, notHospitalClerk)
        }
      ]
    },
    // ---- Nationality (hidden from hospital clerks) ----
    {
      id: 'father.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.nationality.label'
      },
      defaultValue: 'TUV',
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(fatherDetailsAvailable, notHospitalClerk)
        }
      ]
    },
    // ---- ID type (hidden from hospital clerks, hidden if deceased) ----
    {
      id: 'father.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.idType.label'
      },
      options: deathFatherIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            fatherDetailsAvailable,
            notHospitalClerk,
            notDeceased
          )
        }
      ]
    },
    // ---- BRN / Birth certificate number ----
    ({
      id: 'father.brn',
      type: FieldType.SEARCH,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.brn.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry.',
        description: 'Helper text for birth registration number field',
        id: 'event.death.action.declare.form.section.father.field.brn.helperText'
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
            field('father.brn').matches('^[A-Za-z0-9-]+$'),
            field('father.brn').isFalsy()
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
            fatherDetailsAvailable,
            notHospitalClerk,
            notDeceased,
            field('father.idType').isEqualTo(
              DeathFatherIdType.BIRTH_CERTIFICATE
            )
          )
        }
      ]
    } as any),
    {
      id: 'father.brnText',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.brnText.label'
      },
      value: field('father.brn').getByPath([
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
            fatherDetailsAvailable,
            notHospitalClerk,
            notDeceased,
            field('father.idType').isEqualTo(
              DeathFatherIdType.BIRTH_CERTIFICATE
            )
          )
        }
      ]
    },
    // ---- Passport ----
    {
      id: 'father.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            fatherDetailsAvailable,
            notHospitalClerk,
            notDeceased,
            field('father.idType').isEqualTo(DeathFatherIdType.PASSPORT)
          )
        }
      ]
    },
    // ---- Other ID ----
    {
      id: 'father.otherId',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'ID number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.otherId.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            fatherDetailsAvailable,
            notHospitalClerk,
            notDeceased,
            field('father.idType').isEqualTo(DeathFatherIdType.OTHER)
          )
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'father.idDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: fatherDetailsAvailable
        }
      ]
    },
    // ---- Full name ----
    {
      id: 'father.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Father's full name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.name.label'
      },
      configuration: tuvaluNameConfig,
      value: field('father.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      validation: [invalidNameValidator('father.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: fatherDetailsAvailable
        }
      ]
    },
    // ---- Date of birth ----
    {
      id: 'father.dob',
      type: FieldType.DATE,
      required: false,
      secured: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.dob.label'
      },
      value: field('father.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date in the past',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.father.field.dob.error'
          },
          validator: field('father.dob').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            fatherDetailsAvailable,
            not(field('father.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },
    // ---- DOB unknown checkbox ----
    {
      id: 'father.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: fatherDetailsAvailable
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Age (shown if DOB unknown) ----
    {
      id: 'father.age',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Age',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.age.label'
      },
      value: field('father.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.age'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            fatherDetailsAvailable,
            field('father.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },
    // ---- Place of birth (hidden from hospital clerks) ----
    {
      id: 'father.placeOfBirth',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(fatherDetailsAvailable, notHospitalClerk)
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'father.occupationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(fatherDetailsAvailable, notDeceased)
        }
      ]
    },
    // ---- Occupation (hidden if deceased) ----
    {
      id: 'father.occupation',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.father.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(fatherDetailsAvailable, notDeceased)
        }
      ]
    }
  ]
})
