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
  invalidNameValidator,
  tuvaluNameConfig,

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

export const requireMotherDetails = or(
  field('mother.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.MOTHER),
  field('informant.relation').isEqualTo(InformantType.MOTHER_AND_FATHER)
)

const tuvaluMaritalStatusOptions = [
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Married',
      description: 'Option for marital status: married',
      id: 'form.field.label.maritalStatusMarried'
    }
  },
  {
    value: 'SINGLE',
    label: {
      defaultMessage: 'Single (never married)',
      description: 'Option for marital status: single',
      id: 'form.field.label.maritalStatusSingleNeverMarried'
    }
  },
  {
    value: 'DIVORCED',
    label: {
      defaultMessage: 'Divorced',
      description: 'Option for marital status: divorced',
      id: 'form.field.label.maritalStatusDivorced'
    }
  },
  {
    value: 'WIDOWED',
    label: {
      defaultMessage: 'Widowed',
      description: 'Option for marital status: widowed',
      id: 'form.field.label.maritalStatusWidowed'
    }
  },
  {
    value: 'NOT_STATED',
    label: {
      defaultMessage: 'Not Stated',
      description: 'Option for marital status: not stated',
      id: 'form.field.label.maritalStatusNotStated'
    }
  }
]

export const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'form.section.mother.title'
  },
  fields: [
    {
      id: 'mother.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              field('informant.relation').isEqualTo(InformantType.MOTHER),
              field('informant.relation').isEqualTo(
                InformantType.MOTHER_AND_FATHER
              )
            )
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('mother.detailsNotAvailable').isEqualTo(true)
        }
      ]
    },
    {
      id: 'mother.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              field('informant.relation').isEqualTo(InformantType.MOTHER),
              field('informant.relation').isEqualTo(
                InformantType.MOTHER_AND_FATHER
              )
            )
          )
        }
      ]
    },
    {
      id: 'mother.reason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.detailsNotAvailable').isEqualTo(true),
            not(
              or(
                field('informant.relation').isEqualTo(InformantType.MOTHER),
                field('informant.relation').isEqualTo(
                  InformantType.MOTHER_AND_FATHER
                )
              )
            )
          )
        }
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
        id: 'event.birth.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            hasNonHealthNotifierRole
          )
        }
      ],
      defaultValue: 'TUV'
    },
    {
      id: 'mother.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Form of ID',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.idType.label'
      },
      options: birthIdTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'mother.brnSearch',
      type: FieldType.SEARCH,
      label: {
        defaultMessage: 'Search birth registration number',
        description: 'Label for the birth registration number search field',
        id: 'event.birth.action.declare.form.section.mother.field.brnSearch.label'
      },
      helperText: {
        defaultMessage:
          'Search for a birth record. If found, details will auto-fill. Otherwise, continue with manual entry.',
        description: 'Helper text for the birth registration number search field',
        id: 'event.birth.action.declare.form.section.mother.field.brnSearch.helperText'
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
            id: 'event.birth.action.declare.form.section.mother.field.brnSearch.validation'
          }
        },
        indicators: {
          ok: {
            defaultMessage: 'Record found',
            description: 'Indicator shown when a birth record is found',
            id: 'event.birth.action.declare.form.section.mother.field.brnSearch.indicators.ok'
          },
          clearModal: {
            title: {
              defaultMessage: 'Clear birth record?',
              description: 'Title for the clear search confirmation modal',
              id: 'event.birth.action.declare.form.section.mother.field.brnSearch.indicators.clearModal.title'
            },
            description: {
              defaultMessage:
                'This will remove the auto-filled details for the mother.',
              description: 'Description for the clear search confirmation modal',
              id: 'event.birth.action.declare.form.section.mother.field.brnSearch.indicators.clearModal.description'
            }
          }
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.idType').isEqualTo(BirthIdType.BIRTH_CERTIFICATE),
            requireMotherDetails,
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
        id: 'event.birth.action.declare.form.section.mother.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.idType').isEqualTo(BirthIdType.BIRTH_CERTIFICATE),
            requireMotherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'mother.passport',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Passport Number',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.idType').isEqualTo(BirthIdType.PASSPORT),
            requireMotherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'mother.nid',
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
            field('mother.idType').isEqualTo(BirthIdType.OTHER),
            requireMotherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'mother.idDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            hasNonHealthNotifierRole
          )
        }
      ]
    },
    {
      id: 'mother.name',
      type: FieldType.NAME,
      required: true,
      configuration: tuvaluNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.name.label'
      },
      value: field('mother.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.name'
      ]),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [invalidNameValidator('mother.name')]
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      required: true,
      secured: true,
      analytics: true,
      value: field('mother.brnSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'child.dob'
      ]),
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid birth date',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('mother.dob').isBefore().date(field('child.dob'))
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
            not(field('mother.dobUnknown').isEqualTo(true)),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.dobUnknown',
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
          conditional: requireMotherDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
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
        id: 'event.birth.action.declare.form.section.mother.field.age.label'
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
            field('mother.dobUnknown').isEqualTo(true),
            requireMotherDetails
          )
        }
      ],
      validation: [
        {
          validator: field('mother.age').asAge().isBetween(12, 120),
          message: {
            defaultMessage: 'Age must be between 12 and 120',
            description: 'Error message for invalid age',
            id: 'event.action.declare.form.section.person.field.age.error'
          }
        }
      ]
    },
    {
      id: 'mother.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: "Label for mother's place of birth",
        id: 'event.birth.action.declare.form.section.mother.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.maritalStatus',
      type: FieldType.SELECT,
      analytics: true,
      required: true,
      label: {
        defaultMessage: 'Marital status',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.maritalStatus.label'
      },
      options: tuvaluMaritalStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.isMarriedToFather',
      type: FieldType.RADIO_GROUP,
      analytics: true,
      required: false,
      label: {
        defaultMessage: "Were the child's mother and father married to each other?",
        description: 'Label for whether mother is married to father',
        id: 'event.birth.action.declare.form.section.mother.field.isMarriedToFather.label'
      },
      options: [
        {
          value: 'Yes',
          label: {
            defaultMessage: 'Yes',
            description: 'Option for yes',
            id: 'option.yes'
          }
        },
        {
          value: 'No',
          label: {
            defaultMessage: 'No',
            description: 'Option for no',
            id: 'option.no'
          }
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.maritalStatus').isEqualTo('MARRIED'),
            requireMotherDetails
          )
        }
      ],
      parent: field('mother.maritalStatus')
    },
    {
      id: 'mother.dateOfMarriage',
      type: FieldType.DATE,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Date of marriage',
        description: 'Label for date of marriage field',
        id: 'event.birth.action.declare.form.section.mother.field.dateOfMarriage.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.maritalStatus').isEqualTo('MARRIED'),
            field('mother.isMarriedToFather').isEqualTo('Yes')
          )
        }
      ],
      parent: field('mother.isMarriedToFather')
    },
    {
      id: 'mother.placeOfMarriage',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'Label for place of marriage field',
        id: 'event.birth.action.declare.form.section.mother.field.placeOfMarriage.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.maritalStatus').isEqualTo('MARRIED'),
            field('mother.isMarriedToFather').isEqualTo('Yes')
          )
        }
      ],
      parent: field('mother.isMarriedToFather')
    },
    {
      id: 'mother.maritalDetailsDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            requireMotherDetails,
            field('mother.maritalStatus').isEqualTo('MARRIED'),
            field('mother.isMarriedToFather').isEqualTo('Yes')
          )
        }
      ]
    },
    {
      id: 'mother.childrenHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Number of children previously born to the mother',
        description: 'Header for children count section',
        id: 'event.birth.action.declare.form.section.mother.field.childrenHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
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
        id: 'event.birth.action.declare.form.section.mother.field.livingChildren.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      configuration: {
        min: 0
      }
    },
    {
      id: 'mother.deceasedChildren',
      type: FieldType.NUMBER,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Deceased',
        description: 'Label for number of deceased children',
        id: 'event.birth.action.declare.form.section.mother.field.deceasedChildren.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      configuration: {
        min: 0
      }
    },
    {
      id: 'mother.addressDivider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.addressHelper',
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
          conditional: requireMotherDetails
        }
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
        id: 'event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
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
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    {
      id: 'mother.addressDivider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.occupation',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.person.field.occupation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    }
  ]
})
