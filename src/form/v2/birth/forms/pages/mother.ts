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
  field
} from '@opencrvs/toolkit/events'
import { or, not, never } from '@opencrvs/toolkit/conditionals'
import { emptyMessage } from '@countryconfig/form/v2/utils'
import {
  invalidNameValidator,
  MAX_NAME_LENGTH
} from '@countryconfig/form/v2/birth/validators'
import { InformantType } from './informant'
import { maritalStatusOptions } from '../../../../common/select-options'

export const requireMotherDetails = or(
  field('mother.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.MOTHER)
)

export const mother = defineFormPage({
  id: 'mother',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'v2.form.section.mother.title'
  },
  fields: [
    {
      id: 'mother.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
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
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        }
      ]
    },
    {
      id: 'mother.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('mother.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.MOTHER))
          )
        }
      ]
    },
    {
      id: 'mother.motherDeceased',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Mother is deceased',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.motherDeceased.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.surname',
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.surname.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [invalidNameValidator('mother.surname')]
    },
    {
      id: 'mother.firstname',
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.firstname.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [invalidNameValidator('mother.firstname')]
    },
    {
      id: 'mother.dob',
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid birth date',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('mother.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'v2.event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('mother.dob').isBefore().date(field('child.dob'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.dob.label'
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
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.age.checkbox.label'
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
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Age of mother',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.age.label'
      },
      configuration: {
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: 'v2.event.birth.action.declare.form.section.person.field.age.postfix'
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
      ]
    },
    {
      id: 'mother.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      defaultValue: 'Madagascar'
    },
    {
      id: 'mother.nui',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'NUI',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.nui.label'
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
      id: 'mother.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.addressDivider_1',
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
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.addressHelper.label'
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
      id: 'mother.address',
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      defaultValue: {
        country: 'Madagascar',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    },
    {
      id: 'mother.maritalStatus',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.maritalStatus.label'
      },
      options: maritalStatusOptions,
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
      required: true,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.occupation.label'
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
