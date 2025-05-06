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
  or,
  field,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import { createSelectOptions, emptyMessage } from '../../../utils'
import {
  MAX_NAME_LENGTH,
  nationalIdValidator
} from '@countryconfig/form/v2/birth/validators'
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
export type InformantTypeKey = keyof typeof InformantType

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'
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
  id: PersonType.informant,
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
      ],
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.dob',
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: `v2.event.birth.action.declare.form.section.person.field.dob.error`
          },
          validator: field('informant.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's birth date",
            description:
              'This is the error message for a birth date after child`s birth date',
            id: `v2.event.birth.action.declare.form.section.person.dob.afterChild`
          },
          validator: field('informant.dob').isBefore().date(field('child.dob'))
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
      ],
      parent: field('informant.relation')
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
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ],
      parent: field('informant.relation')
    },
    {
      id: `${PersonType.informant}.age`,
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Age of informant',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.age.label'
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
      ],
      parent: field('informant.relation')
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
      ],
      defaultValue: 'FAR',
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.nid',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.person.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('informant.idType').isEqualTo(IdType.NATIONAL_ID),
            informantOtherThanParent
          )
        }
      ],
      validation: [
        nationalIdValidator('informant.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'v2.event.birth.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('informant.nid').isEqualTo(field('mother.nid'))),
            not(field('informant.nid').isEqualTo(field('father.nid')))
          )
        }
      ],
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.address',
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
          conditional: informantOtherThanParent
        }
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      },
      parent: field('informant.relation')
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
      ],
      parent: field('informant.relation')
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'v2.event.birth.action.declare.form.section.informant.field.phoneNo.error'
          },
          validator: or(
            field('informant.phoneNo').matches(PHONE_NUMBER_REGEX),
            field('informant.phoneNo').isFalsy()
          )
        }
      ],
      parent: field('informant.relation')
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
      },
      parent: field('informant.relation')
    }
  ]
})
