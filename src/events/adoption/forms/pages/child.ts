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
  FieldType,
  PageTypes,
  field,
  defineConditional
} from '@opencrvs/toolkit/events'
import { invalidNameValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'form.field.label.sexFemale'
  },
  UNKNOWN: {
    defaultMessage: 'Unknown',
    description: 'Label for option unknown',
    id: 'form.field.label.sexUnknown'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const genderOptions = [
  {
    value: GenderTypes.MALE,
    label: genderMessageDescriptors.MALE
  },
  {
    value: GenderTypes.FEMALE,
    label: genderMessageDescriptors.FEMALE
  }
]

export const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's Birth Details",
    description: 'Form section title for Child Birth Details',
    id: 'form.adoption.child.title'
  },
  fields: [
    // BRN Search
    {
      id: 'child.brnSearch',
      type: FieldType.SEARCH,
      label: {
        defaultMessage: 'Search for a birth record',
        description: 'Label for birth record search',
        id: 'event.adoption.action.declare.form.section.child.field.brnSearch.label'
      },
      helperText: {
        defaultMessage:
          'Hint: Search for an existing birth record. If a match is found, the details below will auto-fill. If no record is found, continue by entering the details manually.',
        description: 'Label for birth helperText',
        id: 'event.adoption.action.declare.form.section.child.field.brnSearch.helperText'
      },
      placeholder: {
        defaultMessage:
          'Search for an existing birth record. If a match is found, the details below will auto-fill. If no record is found, continue by entering the details manually.',
        description: 'Placeholder for birth record search',
        id: 'event.adoption.action.declare.form.section.child.field.brnSearch.placeholder'
      },
      configuration: {
        validation: {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message for invalid BRN search',
            id: 'event.adoption.child.brnSearch.validation.error'
          },
          validator: defineConditional({
            type: 'string'
          })
        },
        query: {
          type: 'and',
          clauses: [
            {
              eventType: 'birth',
              status: {
                type: 'anyOf',
                terms: ['REGISTERED']
              }
            },
            {
              'legalStatuses.REGISTERED.registrationNumber': {
                term: '{term}',
                type: 'exact'
              }
            }
          ]
        },
        limit: 10,
        offset: 0
      }
    },
    // brn
    {
      id: 'child.brn',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('child.brnSearch'),
      value: field('child.brnSearch').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      label: {
        defaultMessage: 'Birth Registration Number',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.brn.label'
      }
    },
    // name
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      parent: field('child.brnSearch'),
      value: field('child.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for form field: First names',
              id: 'form.field.label.firstNames'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Last name',
              description: 'Label for family name text input',
              id: 'form.field.label.familyName'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Given name(s)',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.name.label'
      },
      validation: [invalidNameValidator('child.name')]
    },
    // DOb
    {
      id: 'child.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('child.brnSearch'),
      value: field('child.brnSearch').getByPath([
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
            id: 'event.adoption.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.dob.label'
      }
    },
    // gender
    {
      id: 'child.gender',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      parent: field('child.brnSearch'),
      value: field('child.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.gender'
      ]),
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.gender.label'
      },
      options: genderOptions
    },
    // place of birth
    {
      id: 'child.birthLocation',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      parent: field('child.brnSearch'),
      value: field('child.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.placeOfBirth'
      ]),
      label: {
        defaultMessage: 'Place Of Birth',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.child.field.birthLocation.label'
      },
      options: [
        {
          value: 'HEALTH_FACILITY',
          label: {
            defaultMessage: 'Health Institution',
            description: 'Option for health institution',
            id: 'event.adoption.child.birthLocation.healthInstitution'
          }
        },
        {
          value: 'PRIVATE_HOME',
          label: {
            defaultMessage: 'Residential address',
            description: 'Option for residential address',
            id: 'event.adoption.child.birthLocation.residentialAddress'
          }
        },
        {
          value: 'OTHER',
          label: {
            defaultMessage: 'Other address',
            description: 'Option for other address',
            id: 'event.adoption.child.birthLocation.otherAddress'
          }
        }
      ]
    }
  ]
})
