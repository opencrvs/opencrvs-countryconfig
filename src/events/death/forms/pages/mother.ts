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
  ConditionalType,
  defineFormPage,
  FieldType,
  never,
  or,
  field,
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
  hasNonHealthNotifierRole,
} from '@countryconfig/events/utils'

const DeathMotherIdType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const deathMotherIdTypeOptions = [
  {
    value: DeathMotherIdType.BIRTH_CERTIFICATE,
    label: {
      defaultMessage: 'Birth certificate',
      description: 'Option for ID type: birth certificate',
      id: 'event.death.action.declare.form.section.mother.field.idType.option.birthCertificate'
    }
  },
  {
    value: DeathMotherIdType.PASSPORT,
    label: {
      defaultMessage: 'Passport',
      description: 'Option for ID type: passport',
      id: 'event.death.action.declare.form.section.mother.field.idType.option.passport'
    }
  },
  {
    value: DeathMotherIdType.OTHER,
    label: {
      defaultMessage: 'Other',
      description: 'Option for ID type: other',
      id: 'event.death.action.declare.form.section.mother.field.idType.option.other'
    }
  }
]

const MotherLivingStatus = {
  ALIVE: 'ALIVE',
  DECEASED: 'DECEASED'
} as const

const motherLivingStatusOptions = [
  {
    value: MotherLivingStatus.ALIVE,
    label: {
      defaultMessage: 'Alive',
      description: 'Option for living status: alive',
      id: 'event.death.action.declare.form.section.mother.field.livingStatus.option.alive'
    }
  },
  {
    value: MotherLivingStatus.DECEASED,
    label: {
      defaultMessage: 'Deceased',
      description: 'Option for living status: deceased',
      id: 'event.death.action.declare.form.section.mother.field.livingStatus.option.deceased'
    }
  }
]

const motherDetailsAvailable = not(
  field('mother.detailsNotAvailable').isEqualTo(true)
)
const notDeceased = not(
  field('mother.livingStatus').isEqualTo(MotherLivingStatus.DECEASED)
)

export const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: "Form section title for mother's details",
    id: 'form.death.mother.title'
  },
  fields: [
    // ---- Mother details not available ----
    {
      id: 'mother.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    // ---- Reason (shown if details not available) ----
    {
      id: 'mother.reason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description: "Reason why the mother's details are not available",
        id: 'event.death.action.declare.form.section.mother.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    // ---- Divider (hides rest of page if details not available) ----
    {
      id: 'mother.detailsDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: motherDetailsAvailable
        }
      ]
    },
    // ---- Living status (hidden from hospital clerks) ----
    {
      id: 'mother.livingStatus',
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Living status',
        description: "This is the label for the mother's living status",
        id: 'event.death.action.declare.form.section.mother.field.livingStatus.label'
      },
      options: motherLivingStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(motherDetailsAvailable, hasNonHealthNotifierRole)
        }
      ]
    },
    // ---- Nationality (hidden from hospital clerks) ----
    {
      id: 'mother.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.nationality.label'
      },
      defaultValue: 'TUV',
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(motherDetailsAvailable, hasNonHealthNotifierRole)
        }
      ]
    },
    // ---- ID type (hidden from hospital clerks, hidden if deceased) ----
    {
      id: 'mother.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.idType.label'
      },
      options: deathMotherIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            motherDetailsAvailable,
            hasNonHealthNotifierRole,
            notDeceased
          )
        }
      ]
    },
    // ---- BRN / Birth certificate number ----
    {
      id: 'mother.brn',
      type: FieldType.SEARCH,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.brn.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry.',
        description: 'Helper text for birth registration number field',
        id: 'event.death.action.declare.form.section.mother.field.brn.helperText'
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
            field('mother.brn').matches('^[A-Za-z0-9-]+$'),
            field('mother.brn').isFalsy()
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
            motherDetailsAvailable,
            hasNonHealthNotifierRole,
            notDeceased,
            field('mother.idType').isEqualTo(
              DeathMotherIdType.BIRTH_CERTIFICATE
            )
          )
        }
      ]
    },
    {
      id: 'mother.brnText',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.brnText.label'
      },
      value: field('mother.brn').getByPath([
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
            motherDetailsAvailable,
            hasNonHealthNotifierRole,
            notDeceased,
            field('mother.idType').isEqualTo(
              DeathMotherIdType.BIRTH_CERTIFICATE
            )
          )
        }
      ]
    },
    // ---- Passport ----
    {
      id: 'mother.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            motherDetailsAvailable,
            hasNonHealthNotifierRole,
            notDeceased,
            field('mother.idType').isEqualTo(DeathMotherIdType.PASSPORT)
          )
        }
      ]
    },
    // ---- Other ID ----
    {
      id: 'mother.otherId',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Other ID number',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.otherId.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            motherDetailsAvailable,
            hasNonHealthNotifierRole,
            notDeceased,
            field('mother.idType').isEqualTo(DeathMotherIdType.OTHER)
          )
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'mother.idDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: motherDetailsAvailable
        }
      ]
    },
    // ---- Full name ----
    {
      id: 'mother.name',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Mother's full name",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.name.label'
      },
      configuration: tuvaluNameConfig,
      value: field('mother.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      validation: [invalidNameValidator('mother.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: motherDetailsAvailable
        }
      ]
    },
    // ---- Date of birth ----
    {
      id: 'mother.dob',
      type: FieldType.DATE,
      required: false,
      secured: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.dob.label'
      },
      value: field('mother.brn').getByPath([
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
            id: 'event.death.action.declare.form.section.mother.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            motherDetailsAvailable,
            not(field('mother.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },
    // ---- DOB unknown checkbox ----
    {
      id: 'mother.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: motherDetailsAvailable
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Age (shown if DOB unknown) ----
    {
      id: 'mother.age',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Age',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.age.label'
      },
      value: field('mother.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.age'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            motherDetailsAvailable,
            field('mother.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },
    // ---- Place of birth (hidden from hospital clerks) ----
    {
      id: 'mother.placeOfBirth',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(motherDetailsAvailable, hasNonHealthNotifierRole)
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'mother.occupationDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(motherDetailsAvailable, notDeceased)
        }
      ]
    },
    // ---- Occupation (hidden if deceased) ----
    {
      id: 'mother.occupation',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.mother.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(motherDetailsAvailable, notDeceased)
        }
      ]
    }
  ]
})
