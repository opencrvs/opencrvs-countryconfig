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
  MAX_NAME_LENGTH
} from '@countryconfig/form/v2/birth/validators'
import { InformantType } from './informant'
import {
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
      id: 'father.fatherReasonNotApplying',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.fatherReasonNotApplying.label'
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
      id: 'father.fatherIsDeceased',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Father is deceased',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.fatherIsDeceased.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.fatherHasFormallyRecognisedChild',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Father has formally recognized child',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.father.field.fatherHasFormallyRecognisedChild.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'father.name',
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Father's name",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.name.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ],
      validation: [invalidNameValidator('father.name')]
    },
    {
      id: 'father.fatherBirthDate',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.person.field.fatherBirthDate.error'
          },
          validator: field('father.fatherBirthDate').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              "This is the error message for a birth date after child's birth date",
            id: 'v2.event.birth.action.declare.form.section.person.fatherBirthDate.afterChild'
          },
          validator: field('father.fatherBirthDate')
            .isBefore()
            .date(field('child.childBirthDate'))
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.fatherBirthDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('father.customizedExactDateOfBirthUnknown').isEqualTo(true)
            ),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: 'father.customizedExactDateOfBirthUnknown',
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
            field('father.customizedExactDateOfBirthUnknown').isEqualTo(true),
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
      id: 'father.iD',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'NUI',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.iD.label'
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
      id: 'father.birthPlace',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.father.field.birthPlace.label'
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
      secured: true,
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
