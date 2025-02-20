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
  and,
  ConditionalType,
  defineFormPage,
  FieldType
} from '@opencrvs/toolkit/events'
import { field, or, not } from '@opencrvs/toolkit/conditionals'
import { emptyMessage, MAX_NAME_LENGTH } from '../../../utils'
import { InformantType } from './informant'
import { IdType, idTypeOptions, PersonType } from '../../../person'
import {
  educationalAttainmentOptions,
  maritalStatusOptions
} from '../../../../common/select-options'

const requireMotherDetails = or(
  field(`${PersonType.mother}.detailsNotAvailable`).isFalsy(),
  field('informant.relation').isEqualTo(InformantType.MOTHER)
)

export const mother = defineFormPage({
  id: 'mother',
  title: {
    defaultMessage: "Mother's details",
    description: 'Form section title for mothers details',
    id: 'v2.form.section.mother.title'
  },
  fields: [
    {
      id: `${PersonType.mother}.detailsNotAvailable`,
      type: FieldType.CHECKBOX,
      required: true,
      label: {
        defaultMessage: "Mother's details are not available",
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.mother.field.detailsNotAvailable.label`
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
      id: `${PersonType.mother}.details.divider`,
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
      id: `${PersonType.mother}.reason`,
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
            field(`${PersonType.mother}.detailsNotAvailable`).isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.MOTHER))
          )
        }
      ]
    },
    {
      id: `${PersonType.mother}.firstname`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.surname`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.dob`,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Please enter a valid date',
            description: 'This is the error message for invalid date',
            id: `v2.event.birth.action.declare.form.section.person.field.dob.error`
          },
          validator: field(`${PersonType.mother}.dob`).isBefore().now()
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
            not(field(`${PersonType.mother}.dobUnknown`).isEqualTo(true)),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.mother}.dobUnknown`,
      type: FieldType.CHECKBOX,
      required: true,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.age.checkbox.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.age`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: `Age of ${PersonType.mother}`,
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
            field(`${PersonType.mother}.dobUnknown`).isEqualTo(true),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.mother}.nationality`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.idType`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.nid`,
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
            field(`${PersonType.mother}.idType`).isEqualTo(IdType.NATIONAL_ID),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.mother}.passport`,
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
            field(`${PersonType.mother}.idType`).isEqualTo(IdType.PASSPORT),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.mother}.brn`,
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
            field(`${PersonType.mother}.idType`).isEqualTo(
              IdType.BIRTH_REGISTRATION_NUMBER
            ),
            requireMotherDetails
          )
        }
      ]
    },
    {
      id: `${PersonType.mother}.addressDivider_1`,
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
      id: `${PersonType.mother}.addressHelper`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.address`,
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Child`s address',
        description: 'This is the label for the field',
        id: 'v2.event.tennis-club-membership.action.declare.form.section.who.field.address.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.maritalStatus`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.educationalAttainment`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.occupation`,
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
          conditional: requireMotherDetails
        }
      ]
    },
    {
      id: `${PersonType.mother}.previousBirths`,
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'No. of previous births',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.mother.field.previousBirths.label'
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
