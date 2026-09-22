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
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions, emptyMessage } from '@countryconfig/events/utils'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { invalidNameValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

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

export const adoptiveFather = defineFormPage({
  id: 'adoptiveFather',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Adoptive father's details",
    description: 'Form section title for adoptive father details',
    id: 'event.adoption.action.declare.form.section.adoptiveFather.header'
  },
  fields: [
    // D1 — Adoptive father's details are not available
    {
      id: 'adoptiveFather.detailsUnavailable',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: "Adoptive father's details are not available",
        description:
          'Checkbox to indicate adoptive father details are not available',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.detailsUnavailable.label'
      }
    },

    // D1.1 — Reason (only when unavailable)
    {
      id: 'adoptiveFather.unavailableReason',
      type: FieldType.TEXTAREA,
      analytics: true,
      label: {
        defaultMessage: 'Reason',
        description: 'Reason why adoptive father details are not available',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.unavailableReason.label'
      },
      configuration: { maxLength: 240 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('adoptiveFather.detailsUnavailable').isEqualTo(
            true
          )
        }
      ]
    },

    // Divider
    {
      id: 'adoptiveFather.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D2 and D3 — Given name(s) and Surname
    {
      id: 'adoptiveFather.name',
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
        defaultMessage: 'Adoptive Father name',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.father.field.name.label'
      },
      validation: [invalidNameValidator('adoptiveFather.name')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D4 — Date of birth (hidden when D5 Exact date unknown)
    {
      id: 'adoptiveFather.dob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of birth',
        description: 'Date of birth of adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.dob.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date in the past',
            description: 'This is the error message for invalid date',
            id: 'event.adoption.action.declare.form.section.adoptiveFather.field.dob.error.label'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveFather.detailsUnavailable').isEqualTo(true)),
            not(field('adoptiveFather.dobUnknown').isEqualTo(true))
          )
        }
      ]
    },

    // D5 — Exact date unknown
    {
      id: 'adoptiveFather.dobUnknown',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Exact date unknown',
        description: 'DOB exact date unknown for adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.dobUnknown.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D5.1 — Age in years (only when D5 is checked)
    {
      id: 'adoptiveFather.age',
      type: FieldType.AGE,
      analytics: true,
      label: {
        defaultMessage: 'Age in years',
        description: 'Age in years of adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.age.label'
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
            not(field('adoptiveFather.detailsUnavailable').isEqualTo(true)),
            field('adoptiveFather.dobUnknown').isEqualTo(true)
          )
        }
      ]
    },

    // D6 — Place of birth
    {
      id: 'adoptiveFather.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'Place of birth of adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.placeOfBirth.label'
      },
      configuration: { maxLength: 160 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D7 — Nationality (SELECT)
    {
      id: 'adoptiveFather.nationality',
      type: FieldType.COUNTRY,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'Nationality of adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.nationality.label'
      },
      defaultValue: 'COK',
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D8 — Type of ID
    {
      id: 'adoptiveFather.idType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'Type of ID for adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.idType.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D8.1 — Other (when idType == 'other')
    {
      id: 'adoptiveFather.idTypeOther',
      type: FieldType.TEXT,
      label: {
        defaultMessage: 'Other',
        description: 'Other ID type description for adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.idTypeOther.label'
      },
      configuration: { maxLength: 80 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveFather.detailsUnavailable').isEqualTo(true)),
            field('adoptiveFather.idType').isEqualTo('OTHER')
          )
        }
      ]
    },

    // D8.2 — ID number (Number)
    {
      id: 'adoptiveFather.idNumber',
      type: FieldType.TEXT, // keep TEXT; add numeric validator if you have one
      label: {
        defaultMessage: 'ID number',
        description: 'ID number for adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.idTypeId.label'
      },
      configuration: { maxLength: 64 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('adoptiveFather.detailsUnavailable').isEqualTo(true)),
            not(field('adoptiveFather.idType').isEqualTo('NONE'))
          )
        }
      ]
    },

    // Divider
    {
      id: 'adoptiveFather.divider.2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // Residence — H5 header
    {
      id: 'adoptiveFather.residence.header',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence heading for adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.residenceHeader.label'
      },
      configuration: { styles: { fontVariant: 'h4' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D9–D9.4 — Residence (ADDRESS) using your informant.address pattern
    {
      id: 'adoptiveFather.residence',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Residence of adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.residence.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
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
            'adoptiveFather.residence'
          ).isValidAdministrativeLeafLevel()
        }
      ],
      defaultValue: {
        country: 'COK', // TODO: change if different
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },

    // Divider
    {
      id: 'adoptiveFather.divider.3',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    },

    // D10 — Occupation
    {
      id: 'adoptiveFather.occupation',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'Occupation of adoptive father',
        id: 'event.adoption.action.declare.form.section.adoptiveFather.field.occupation.label'
      },
      configuration: { maxLength: 120 },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('adoptiveFather.detailsUnavailable').isEqualTo(true)
          )
        }
      ]
    }
  ]
})
