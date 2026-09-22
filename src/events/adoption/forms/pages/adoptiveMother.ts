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
  FieldType,
  PageTypes,
  AddressType,
  field,
  ConditionalType,
  and,
  not,
  user,
  SelectOption,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { invalidNameValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const maritalStatusOptions: SelectOption[] = [
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Married',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusMarried'
    }
  },
  {
    value: 'SINGLE(never married)',
    label: {
      defaultMessage: 'Single (never married)',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusSingle'
    }
  },
  {
    value: 'Defacto',
    label: {
      defaultMessage: 'Defacto',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusDefacto'
    }
  },
  {
    value: 'DIVORCED',
    label: {
      defaultMessage: 'Divorced',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusDivorced'
    }
  },
  {
    value: 'WIDOWED',
    label: {
      defaultMessage: 'Widowed',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusWidowed'
    }
  }
]

const IdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER',
  NONE: 'NONE'
} as const

const idTypeMessageDescriptors = {
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBC'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeNone'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

export const adoptiveMother = defineFormPage({
  id: 'adoptiveMother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Adoptive mother's details",
    description: 'Form section title for adoptive mother details',
    id: 'event.adoption.action.declare.form.section.adoptiveMother.header'
  },
  fields: [
    // C1 — Adoptive mother's details are not available
    {
      id: 'adoptiveMother.detailsUnavailable',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: "Adoptive mother's details are not available",
        description:
          'Checkbox to indicate adoptive mother details are not available',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.detailsUnavailable.label'
      }
    },

    // C1.1 — Reason (only when unavailable)
    {
      id: 'adoptiveMother.unavailableReason',
      type: FieldType.TEXTAREA,
      analytics: true,
      label: {
        defaultMessage: 'Reason',
        description: 'Reason why adoptive mother details are not available',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.reason.label'
      },
      configuration: { maxLength: 240 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('adoptiveMother.detailsUnavailable').isEqualTo(
            true
          )
        }
      ]
    },

    // Divider
    {
      id: 'adoptiveMother.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C2 and C3 — Given name(s) and Surname
    {
      id: 'adoptiveMother.name',
      type: FieldType.NAME,
      required: true,
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
              defaultMessage: 'Surname',
              description: 'Label for family name text input',
              id: 'form.field.label.familyName'
            }
          }
        }
      },
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.name.label'
      },
      validation: [invalidNameValidator('adoptiveMother.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C4 — Date of birth (hidden when C5 Exact date unknown)
    {
      id: 'adoptiveMother.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'Date of birth of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date in the past',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.adoptiveMother.c4.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveMother.detailsUnavailable').isEqualTo(true)),
            not(field('adoptiveMother.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },

    // C5 — Exact date unknown
    {
      id: 'adoptiveMother.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date unknown',
        description: 'DOB exact date unknown for adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C5.1 — Age in years (only when C5 is checked)
    {
      id: 'adoptiveMother.age',
      type: FieldType.AGE,
      analytics: true,
      label: {
        defaultMessage: 'Age in years',
        description: 'Age in years of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.age.label'
      },
      configuration: {
        asOfDate: field('eventDetails.date'),
        postfix: {
          defaultMessage: ' years',
          description: 'This is the postfix for age field',
          id: `v2.event.death.action.declare.form.section.informant.field.age.postfix`
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveMother.detailsUnavailable').isEqualTo(true)),
            field('adoptiveMother.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },

    // C6 — Marital Status
    {
      id: 'adoptiveMother.maritalStatus',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Marital Status',
        description: 'Marital status of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.maritalStatus.label'
      },
      options: maritalStatusOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C7 — Maiden surname
    {
      id: 'adoptiveMother.maidenName',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Maiden surname',
        description: 'Maiden surname of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.maidenName.label'
      },
      configuration: { maxLength: MAX_NAME_LENGTH },
      // validation removed: invalidNameValidator expects an object, not a string
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C8 — Place of birth
    {
      id: 'adoptiveMother.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'Place of birth of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.placeOfBirth.label'
      },
      configuration: { maxLength: 160 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C9 — Nationality (SELECT)
    {
      id: 'adoptiveMother.nationality',
      type: FieldType.COUNTRY,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'Nationality of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.nationality.label'
      },
      defaultValue: 'COK',
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C10 — Type of ID
    {
      id: 'adoptiveMother.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'Type of ID for adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.idType.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C10.1 — Other (when idType == 'other')
    {
      id: 'adoptiveMother.idTypeOther',
      type: FieldType.TEXT,
      label: {
        defaultMessage: 'Other',
        description: 'Other ID type description for adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.idTypeOther.label'
      },
      configuration: { maxLength: 80 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveMother.detailsUnavailable').isEqualTo(true)),
            field('adoptiveMother.idType').isEqualTo('OTHER')
          )
        }
      ]
    },

    // C10.1 — ID number (Number)
    {
      id: 'adoptiveMother.idNumber',
      type: FieldType.TEXT, // keep TEXT to match your pattern; add numeric validator if you have one
      label: {
        defaultMessage: 'ID number',
        description: 'ID number for adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.idNumber.label'
      },
      configuration: { maxLength: 64 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveMother.detailsUnavailable').isEqualTo(true)),
            not(field('adoptiveMother.idType').isEqualTo('NONE'))
          )
        }
      ]
    },

    // Divider
    {
      id: 'adoptiveMother.divider.2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // Residence — H5 header
    {
      id: 'adoptiveMother.residence.header',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence heading for adoptive mother',
        id: 'event.adoption.adoptiveMother.residence.header'
      },
      configuration: { styles: { fontVariant: 'h4' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C11–C11.4 — Residence (ADDRESS) using your informant.address pattern
    {
      id: 'adoptiveMother.residence',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Address field invalid leaf level',
            id: 'error.invalidInput'
          },
          validator: field(
            'adoptiveMother.residence'
          ).isValidAdministrativeLeafLevel()
        }
      ],
      defaultValue: {
        country: 'COK', // TODO: change if different
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        // Render Country/Island/District/Village and provide City/Town text inside this config
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },

    // Divider
    {
      id: 'adoptiveMother.divider.3',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // C12 — Occupation
    {
      id: 'adoptiveMother.occupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Occupation of adoptive mother',
        id: 'event.adoption.action.declare.form.section.adoptiveMother.field.occupation.label'
      },
      configuration: { maxLength: 120 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveMother.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    }
  ]
})
