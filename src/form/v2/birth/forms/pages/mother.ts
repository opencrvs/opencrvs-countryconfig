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
      id: 'mother.motherIsDeceased',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Mother is deceased',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.mother.field.motherIsDeceased.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: 'mother.name',
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Mother's name",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ],
      validation: [invalidNameValidator('mother.name')]
    },
    {
      id: 'mother.motherBirthDate',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid birth date',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.person.field.motherBirthDate.error'
          },
          validator: field('mother.motherBirthDate').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'v2.event.birth.action.declare.form.section.person.motherBirthDate.afterChild'
          },
          validator: field('mother.motherBirthDate')
            .isBefore()
            .date(field('child.childBirthDate'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.motherBirthDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('mother.customizedExactDateOfBirthUnknown').isEqualTo(true)
            ),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: 'mother.customizedExactDateOfBirthUnknown',
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
            field('mother.customizedExactDateOfBirthUnknown').isEqualTo(true),
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
      defaultValue: 'MDG'
    },
    {
      id: 'mother.iD',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'NUI',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.iD.label'
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
      id: 'mother.birthPlace',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.birthPlace.label'
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
      secured: true,
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
        country: 'MDG',
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
