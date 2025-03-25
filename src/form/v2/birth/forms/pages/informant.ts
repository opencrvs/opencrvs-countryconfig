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
  FieldType,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { field, not } from '@opencrvs/toolkit/conditionals'
import {
  createSelectOptions,
  emptyMessage,
  MAX_NAME_LENGTH
} from '../../../utils'
import { IdType, idTypeOptions, PersonType } from '../../../person'

export const InformantType = {
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  OTHER: 'OTHER',
  GRANDFATHER: 'GRANDFATHER',
  GRANDMOTHER: 'GRANDMOTHER',
  BROTHER: 'BROTHER',
  SISTER: 'SISTER',
  LEGAL_GUARDIAN: 'LEGAL_GUARDIAN'
} as const

const informantMessageDescriptors = {
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'v2.form.field.label.informantRelation.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'v2.form.field.label.informantRelation.father'
  },
  GRANDFATHER: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'v2.form.field.label.informantRelation.grandfather'
  },
  GRANDMOTHER: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'v2.form.field.label.informantRelation.grandmother'
  },
  BROTHER: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'v2.form.field.label.informantRelation.brother'
  },
  SISTER: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'v2.form.field.label.informantRelation.sister'
  },
  LEGAL_GUARDIAN: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'v2.form.field.label.informantRelation.legalGuardian'
  },
  OTHER: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'v2.form.field.label.informantRelation.others'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const birthInformantTypeOptions = createSelectOptions(
  InformantType,
  informantMessageDescriptors
)

export const informantOtherThanParent = and(
  not(
    field('informant.relation').inArray([
      InformantType.MOTHER,
      InformantType.FATHER
    ])
  ),
  not(field('informant.relation').isFalsy())
)

export const informant = defineFormPage({
  id: `${PersonType.informant}`,
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'v2.form.section.informant.title'
  },
  fields: [
    {
      id: `${PersonType.informant}.relation`,
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.relation.label'
      },
      options: birthInformantTypeOptions
    },
    {
      id: `${PersonType.informant}.other.relation`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.other.relation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informant.relation').isEqualTo(
            InformantType.OTHER
          )
        }
      ]
    },
    {
      id: `${PersonType.informant}.firstname`,
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
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: `${PersonType.informant}.surname`,
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
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: `${PersonType.informant}.dob`,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: `v2.event.birth.action.declare.form.section.person.field.dob.error`
          },
          validator: field(`${PersonType.informant}.dob`).isBefore().now()
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
            not(field(`${PersonType.informant}.dobUnknown`).isEqualTo(true)),
            informantOtherThanParent
          )
        }
      ]
    },
    {
      id: `${PersonType.informant}.dobUnknown`,
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of birth unknown',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.age.checkbox.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: `${PersonType.informant}.age`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: `Age of ${PersonType.informant}`,
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
            field(`${PersonType.informant}.dobUnknown`).isEqualTo(true),
            informantOtherThanParent
          )
        }
      ]
    },
    {
      id: `${PersonType.informant}.nationality`,
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
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: `${PersonType.informant}.idType`,
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
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: `${PersonType.informant}.nid`,
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
            field(`${PersonType.informant}.idType`).isEqualTo(
              IdType.NATIONAL_ID
            ),
            informantOtherThanParent
          )
        }
      ]
    },
    {
      id: `${PersonType.informant}.passport`,
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
            field(`${PersonType.informant}.idType`).isEqualTo(IdType.PASSPORT),
            informantOtherThanParent
          )
        }
      ]
    },
    {
      id: `${PersonType.informant}.brn`,
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
            field(`${PersonType.informant}.idType`).isEqualTo(
              IdType.BIRTH_REGISTRATION_NUMBER
            ),
            informantOtherThanParent
          )
        }
      ]
    },
    {
      id: `${PersonType.informant}.addressDivider_1`,
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: `${PersonType.informant}.addressHelper`,
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
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: 'informant.address',
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
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: 'v2.informant.address.divider.end',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: informantOtherThanParent
        }
      ]
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.phoneNo.label'
      }
    },
    {
      id: 'informant.email',
      type: FieldType.EMAIL,
      required: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      }
    }
  ]
})
