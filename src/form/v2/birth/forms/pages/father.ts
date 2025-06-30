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
  field
} from '@opencrvs/toolkit/events'
import { or, not } from '@opencrvs/toolkit/conditionals'
import { emptyMessage } from '@countryconfig/form/v2/utils'
import {
  invalidNameValidator,
  MAX_NAME_LENGTH,
  nationalIdValidator
} from '@countryconfig/form/v2/birth/validators'
import { InformantType } from './informant'
import {
  educationalAttainmentOptions,
  IdType,
  idTypeOptions,
  maritalStatusOptions,
  yesNoRadioOptions,
  YesNoTypes
} from '../../../person'

export const requireFatherDetails = or(
  field('father.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.FATHER)
)

export const father = defineFormPage({
  id: 'father',
  title: {
    defaultMessage: "Father's details",
    description: 'Form section title for fathers details',
    id: 'v2.form.section.father.title'
  },
  fields: [
    {
      id: 'father.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Father's details are not available",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.FATHER)
          )
        }
      ]
    },
    {
      id: 'father.details.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.FATHER)
          )
        }
      ]
    },
    {
      id: 'father.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('father.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.FATHER))
          )
        }
      ]
    },
    {
      id: 'father.fatherDeceased',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Father is deceased',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.fatherDeceased.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.fatherHasRecognizedChild',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Father has formally recognized child',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.fatherHasRecognizedChild.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.surname',
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
          conditional: requireFatherDetails
        }
      ],
      validation: [invalidNameValidator('father.surname')]
    },
    {
      id: 'father.firstname',
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
          conditional: requireFatherDetails
        }
      ],
      validation: [invalidNameValidator('father.firstname')]
    },
    {
      id: 'father.dob',
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.person.field.dob.error'
          },
          validator: field('father.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'v2.event.birth.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('father.dob').isBefore().date(field('child.dob'))
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
            not(field('father.dobUnknown').isEqualTo(true)),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: 'father.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'father.age',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Age of father',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.age.label'
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
            field('father.dobUnknown').isEqualTo(true),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: 'father.nationality',
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
          conditional: requireFatherDetails
        }
      ],
      defaultValue: 'Madagascar'
    },
    {
      id: 'father.nui',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'NUI',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.nui.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ],
      configuration: {
        min: 0
      }
    },
    {
      id: 'father.placeOfBirth',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.placeOfBirth.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressHelper',
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
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.addressSameAs',
      type: FieldType.RADIO_GROUP,
      options: yesNoRadioOptions,
      required: true,
      label: {
        defaultMessage: "Same as mother's usual place of residence?",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.address.addressSameAs.label'
      },
      defaultValue: YesNoTypes.YES,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('mother.detailsNotAvailable').isEqualTo(true)),
            requireFatherDetails
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field('father.addressSameAs').isEqualTo(YesNoTypes.YES)
        }
      ]
    },
    {
      id: 'father.address',
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
          conditional: and(
            requireFatherDetails,
            or(
              field('mother.detailsNotAvailable').isEqualTo(true),
              field('father.addressSameAs').isEqualTo(YesNoTypes.NO)
            )
          )
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
      id: 'father.addressDivider_2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.maritalStatus',
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
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.occupation',
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
          conditional: requireFatherDetails
        }
      ]
    }
  ]
})
