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
  user,
  never,
  defineConditional
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  nationalIdValidator,
  otherIdValidator,
  passportIdValidator
} from '../../validators'
import {
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import { invalidNameValidator } from '@countryconfig/events/birth/validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const subjects = defineFormPage({
  id: 'subjects',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Details as recorded in original birth entry',
    description: 'Form section title for Subject',
    id: 'form.nameChange.subjects.title'
  },
  fields: [
    // A1: Nationality
    {
      id: 'subjects.nationality',
      type: FieldType.COUNTRY,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'Label for nationality field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nationality.label'
      },
      defaultValue: 'COK'
    },
    // A2: Hint text for BRN search
    {
      id: 'subjects.brnHint',
      type: FieldType.HEADING,
      label: {
        defaultMessage:
          'Search for an existing birth record. If a match is found, the details below will auto-fill. If no record is found, continue by entering the details manually.',
        description: 'Hint text for BRN search field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.brnHint.label'
      },
      configuration: { styles: { fontVariant: 'reg14' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nationality').isEqualTo('COK')
        }
      ]
    },
    // A3: Birth registration number (BRN Lookup)
    {
      id: 'subjects.brn',
      type: FieldType.SEARCH,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Birth registration number',
        description: 'Label for birth registration number field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.brn.label'
      },
      placeholder: {
        defaultMessage: 'Enter birth registration number',
        description: 'Placeholder for BRN search field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.brn.placeholder'
      },
      configuration: {
        validation: {
          validator: defineConditional({
            type: 'string',
            minLength: 1
          }),
          message: {
            defaultMessage: 'Please enter a birth registration number',
            description: 'Validation error message for BRN field',
            id: 'event.nameChange.action.declare.form.section.subjects.field.brn.validation'
          }
        },
        indicators: {
          confirmButton: {
            defaultMessage: 'Search',
            description: 'Button text for search',
            id: 'event.nameChange.action.declare.form.section.subjects.field.brn.search'
          },
          loading: {
            defaultMessage: 'Searching for birth record...',
            description: 'Loading message while searching',
            id: 'event.nameChange.action.declare.form.section.subjects.field.brn.loading'
          },
          noResultsError: {
            defaultMessage:
              'No birth record found with this registration number',
            description: 'Error message when no results found',
            id: 'event.nameChange.action.declare.form.section.subjects.field.brn.noResults'
          }
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
        limit: 1,
        offset: 0
      },
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: field('subjects.nationality').isEqualTo('COK')
        },
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nationality').isEqualTo('COK')
        }
      ]
    },
    // A3.1: Birth registration number (display field)
    {
      id: 'subjects.brnText',
      type: FieldType.TEXT,
      required: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      label: {
        defaultMessage: 'Birth registration number',
        description: 'Label for BRN display field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.brnNumber.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nationality').isEqualTo('COK')
        }
      ]
    },
    // A4-A5: Subject's name
    {
      id: 'subjects.name',
      type: FieldType.NAME,
      required: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
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
              defaultMessage: 'Given name(s) at birth',
              description: 'Label for given names field',
              id: 'event.nameChange.action.declare.form.section.subjects.field.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname at birth',
              description: 'Label for surname field',
              id: 'event.nameChange.action.declare.form.section.subjects.field.surname.label'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: 'Subject name',
        description: 'Label for subject name field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.name.label'
      },
      validation: [invalidNameValidator('subjects.name')]
    },
    // A5: Date of birth
    {
      id: 'subjects.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for date of birth field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date of birth',
            description: 'Error message for invalid date',
            id: 'event.nameChange.action.declare.form.section.subjects.field.dob.error'
          },
          validator: field('subjects.dob').isBefore().now()
        }
      ]
    },
    // Divider
    {
      id: 'subjects.divider.address',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // Usual residence heading
    {
      id: 'subjects.addressHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Heading for usual residence section',
        id: 'event.nameChange.action.declare.form.section.subjects.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    // A6-A10: Address
    {
      id: 'subjects.address',
      type: FieldType.ADDRESS,
      hideLabel: true,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Residence',
        description: 'Label for address field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('subjects.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'subjects.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'COK',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    // Divider
    {
      id: 'subjects.divider.previousNames',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // Previous name changes heading
    {
      id: 'subjects.previousNamesHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Previous name changes',
        description: 'Heading for previous name changes section',
        id: 'event.nameChange.action.declare.form.section.subjects.field.previousNamesHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    // A11: Name changed since registration (via deed poll)
    {
      id: 'subjects.nameChangedViaDeadPoll',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.isRenamed'
      ]),
      label: {
        defaultMessage: 'Name changed since registration (via deed poll)',
        description: 'Label for name changed checkbox',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChangedViaDeadPoll.label'
      }
    },
    // Name change #1 heading
    {
      id: 'subjects.nameChange1Helper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Name change #1',
        description: 'Heading for name change #1 section',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange1Helper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChangedViaDeadPoll').isEqualTo(true)
        }
      ]
    },
    // A12: Deed poll number (Name change #1)
    {
      id: 'subjects.nameChange1.deedPollNumber',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.deedPollNumber1'
      ]),
      label: {
        defaultMessage: 'Deed poll number',
        description: 'Label for deed poll number field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange1.deedPollNumber.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChangedViaDeadPoll').isEqualTo(true)
        }
      ]
    },
    // A13: New given name(s) (Name change #1)
    {
      id: 'subjects.nameChange1.firstname',
      type: FieldType.TEXT,
      required: false,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.newGivenNames1'
      ]),
      label: {
        defaultMessage: 'New given name(s)',
        description: 'Label for new given names field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange1.firstname.label'
      },
      configuration: {
        maxLength: MAX_NAME_LENGTH
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChangedViaDeadPoll').isEqualTo(true)
        }
      ]
    },
    // A14: New surname (Name change #1)
    {
      id: 'subjects.nameChange1.surname',
      type: FieldType.TEXT,
      required: false,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.newSurname1'
      ]),
      label: {
        defaultMessage: 'New surname',
        description: 'Label for new surname field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange1.surname.label'
      },
      configuration: {
        maxLength: MAX_NAME_LENGTH
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChangedViaDeadPoll').isEqualTo(true)
        }
      ]
    },
    // A15: Add another name change (Name change #1)
    {
      id: 'subjects.nameChange1.addAnother',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.addAnother1'
      ]),
      label: {
        defaultMessage: 'Add another name change',
        description: 'Label for add another name change checkbox',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange1.addAnother.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChangedViaDeadPoll').isEqualTo(true)
        }
      ]
    },
    // Divider
    {
      id: 'subjects.divider.nameChange2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange1.addAnother').isEqualTo(true)
        }
      ]
    },
    // Name change #2 heading
    {
      id: 'subjects.nameChange2Helper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Name change #2',
        description: 'Heading for name change #2 section',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange2Helper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange1.addAnother').isEqualTo(true)
        }
      ]
    },
    // A16: Deed poll Number (Name change #2)
    {
      id: 'subjects.nameChange2.deedPollNumber',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.deedPollNumber2'
      ]),
      label: {
        defaultMessage: 'Deed poll Number',
        description: 'Label for deed poll number field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange2.deedPollNumber.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange1.addAnother').isEqualTo(true)
        }
      ]
    },
    // A17: New given name(s) (Name change #2)
    {
      id: 'subjects.nameChange2.firstname',
      type: FieldType.TEXT,
      required: false,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.newGivenNames2'
      ]),
      label: {
        defaultMessage: 'New given name(s)',
        description: 'Label for new given names field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange2.firstname.label'
      },
      configuration: {
        maxLength: MAX_NAME_LENGTH
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange1.addAnother').isEqualTo(true)
        }
      ]
    },
    // A18: New surname (Name change #2)
    {
      id: 'subjects.nameChange2.surname',
      type: FieldType.TEXT,
      required: false,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.newSurname2'
      ]),
      label: {
        defaultMessage: 'New surname',
        description: 'Label for new surname field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange2.surname.label'
      },
      configuration: {
        maxLength: MAX_NAME_LENGTH
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange1.addAnother').isEqualTo(true)
        }
      ]
    },
    // A19: Add another name change (Name change #2)
    {
      id: 'subjects.nameChange2.addAnother',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.addAnother2'
      ]),
      label: {
        defaultMessage: 'Add another name change',
        description: 'Label for add another name change checkbox',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange2.addAnother.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange1.addAnother').isEqualTo(true)
        }
      ]
    },
    // Divider
    {
      id: 'subjects.divider.nameChange3',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange2.addAnother').isEqualTo(true)
        }
      ]
    },
    // Name change #3 heading
    {
      id: 'subjects.nameChange3Helper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Name change #3',
        description: 'Heading for name change #3 section',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange3Helper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange2.addAnother').isEqualTo(true)
        }
      ]
    },
    // A20: Deed poll Number (Name change #3)
    {
      id: 'subjects.nameChange3.deedPollNumber',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.deedPollNumber3'
      ]),
      label: {
        defaultMessage: 'Deed poll Number',
        description: 'Label for deed poll number field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange3.deedPollNumber.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange2.addAnother').isEqualTo(true)
        }
      ]
    },
    // A21: New given name(s) (Name change #3)
    {
      id: 'subjects.nameChange3.firstname',
      type: FieldType.TEXT,
      required: false,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.newGivenNames3'
      ]),
      label: {
        defaultMessage: 'New given name(s)',
        description: 'Label for new given names field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange3.firstname.label'
      },
      configuration: {
        maxLength: MAX_NAME_LENGTH
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange2.addAnother').isEqualTo(true)
        }
      ]
    },
    // A22: New surname (Name change #3)
    {
      id: 'subjects.nameChange3.surname',
      type: FieldType.TEXT,
      required: false,
      parent: field('subjects.brn'),
      value: field('subjects.brn').getByPath([
        'data',
        'firstResult',
        'declaration',
        'nameChange.newSurname3'
      ]),
      label: {
        defaultMessage: 'New surname',
        description: 'Label for new surname field',
        id: 'event.nameChange.action.declare.form.section.subjects.field.nameChange3.surname.label'
      },
      configuration: {
        maxLength: MAX_NAME_LENGTH
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.nameChange2.addAnother').isEqualTo(true)
        }
      ]
    }
  ]
})
