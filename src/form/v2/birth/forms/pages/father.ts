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
  FieldType
} from '@opencrvs/toolkit/events'
import { field, or, not } from '@opencrvs/toolkit/conditionals'
import { emptyMessage, MAX_NAME_LENGTH } from '../../../utils'
import { InformantType } from './informant'
import {
  educationalAttainmentOptions,
  IdType,
  idTypeOptions,
  maritalStatusOptions,
  PersonType,
  yesNoRadioOptions,
  YesNoTypes
} from '../../../person'

export const requireFatherDetails = or(
  field('father.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.FATHER)
)

export const father = defineFormPage({
  id: PersonType.father,
  title: {
    defaultMessage: "Father's details",
    description: 'Form section title for fathers details',
    id: 'v2.form.section.father.title'
  },
  fields: [
    {
      id: `${PersonType.father}.detailsNotAvailable`,
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: "Father's details are not available",
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.father.field.detailsNotAvailable.label`
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
      id: `${PersonType.father}.details.divider`,
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
      id: `${PersonType.father}.reason`,
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
      id: `${PersonType.father}.firstname`,
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.firstname.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: `${PersonType.father}.surname`,
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.surname.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: `${PersonType.father}.dob`,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: `v2.event.birth.action.declare.form.section.person.field.dob.error`
          },
          validator: field(`${PersonType.father}.dob`).isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.dob.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field(`${PersonType.father}.dobUnknown`).isEqualTo(true)),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.father}.dobUnknown`,
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.age.checkbox.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: `${PersonType.father}.age`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: `Age of ${PersonType.father}`,
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.age.text.label`
      },
      configuration: {
        postfix: {
          defaultMessage: 'years',
          description: 'This is the postfix for age field',
          id: `v2.event.birth.action.declare.form.section.person.field.age.postfix`
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field(`${PersonType.father}.dobUnknown`).isEqualTo(true),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.father}.nationality`,
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.nationality.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ],
      defaultValue: 'FAR'
    },
    {
      id: `${PersonType.father}.idType`,
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.idType.label`
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: `${PersonType.father}.nid`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.nid.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field(`${PersonType.father}.idType`).isEqualTo(IdType.NATIONAL_ID),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.father}.passport`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.passport.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field(`${PersonType.father}.idType`).isEqualTo(IdType.PASSPORT),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.father}.brn`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.brn.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field(`${PersonType.father}.idType`).isEqualTo(
              IdType.BIRTH_REGISTRATION_NUMBER
            ),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.father}.addressDivider`,
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
      id: `${PersonType.father}.addressHelper`,
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Usual place of residence',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.addressHelper.label`
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
      id: `${PersonType.father}.addressSameAs`,
      type: FieldType.RADIO_GROUP,
      options: yesNoRadioOptions,
      required: true,
      label: {
        defaultMessage: "Same as mother's usual place of residence?",
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.father.field.address.addressSameAs.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field(`${PersonType.mother}.detailsNotAvailable`).isEqualTo(true)
            ),
            requireFatherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.father}.address`,
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Father`s address',
        description: 'This is the label for the field',
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: or(
            field(`${PersonType.father}.addressSameAs`).isEqualTo(
              YesNoTypes.NO
            ),
            field(`${PersonType.mother}.detailsNotAvailable`).isEqualTo(true)
          )
        }
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    },
    {
      id: `${PersonType.father}.addressDivider_2`,
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
      id: `${PersonType.father}.maritalStatus`,
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Marital Status',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.maritalStatus.label`
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
      id: `${PersonType.father}.educationalAttainment`,
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Level of education',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.educationalAttainment.label`
      },
      options: educationalAttainmentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: `${PersonType.father}.occupation`,
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Occupation',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.occupation.label`
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
