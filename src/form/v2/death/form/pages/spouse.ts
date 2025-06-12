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
  nationalIdValidator,
  MAX_NAME_LENGTH
} from '@countryconfig/form/v2/death/validators'

import {
  IdType,
  idTypeOptions,
  yesNoRadioOptions,
  YesNoTypes
} from '../../../person'
import { InformantType } from './infomantDetails'

export const requireSpouseDetails = or(
  field('spouse.detailsNotAvailable').isFalsy(),
  field('informant.relation').isEqualTo(InformantType.SPOUSE)
)

export const spouse = defineFormPage({
  id: 'spouse',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Spouse details',
    description: 'Form section title for spouse details',
    id: 'v2.form.section.spouse.title'
  },
  fields: [
    {
      id: 'spouse.detailsNotAvailable',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Spouse details are not available',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.spouse.field.detailsNotAvailable.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.relation').isEqualTo(InformantType.SPOUSE)
          )
        }
      ]
    },
    {
      id: 'spouse.details.divider',
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
      id: 'spouse.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.spouse.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.detailsNotAvailable').isEqualTo(true),
            not(field('informant.relation').isEqualTo(InformantType.SPOUSE))
          )
        }
      ]
    },
    {
      id: 'spouse.firstname',
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.firstname.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      validation: [invalidNameValidator('spouse.firstname')]
    },
    {
      id: 'spouse.surname',
      configuration: { maxLength: MAX_NAME_LENGTH },
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.surname.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      validation: [invalidNameValidator('spouse.surname')]
    },
    {
      id: 'spouse.dob',
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid death date',
            description: 'This is the error message for invalid date',
            id: 'v2.event.death.action.declare.form.section.person.field.dob.error'
          },
          validator: field('spouse.dob').isBefore().now()
        },
        {
          message: {
            defaultMessage: "Birth date must be before child's death date",
            description:
              "This is the error message for a death date after child's death date",
            id: 'v2.event.death.action.declare.form.section.person.dob.afterChild'
          },
          validator: field('spouse.dob').isBefore().date(field('child.dob'))
        }
      ],
      label: {
        defaultMessage: 'Date of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.dob.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('spouse.dobUnknown').isEqualTo(true)),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.dobUnknown',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Exact date of death unknown',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.age.checkbox.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'spouse.nationality',
      type: FieldType.COUNTRY,
      required: true,
      label: {
        defaultMessage: 'Nationality',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.nationality.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ],
      defaultValue: 'FAR'
    },
    {
      id: 'spouse.idType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Type of ID',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.idType.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    },
    {
      id: 'spouse.nid',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.nid.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.NATIONAL_ID),
            requireSpouseDetails
          )
        }
      ],
      validation: [
        nationalIdValidator('spouse.nid'),
        {
          message: {
            defaultMessage: 'National id must be unique',
            description: 'This is the error message for non-unique ID Number',
            id: 'v2.event.death.action.declare.form.nid.unique'
          },
          validator: and(
            not(field('spouse.nid').isEqualTo(field('father.nid'))),
            not(field('spouse.nid').isEqualTo(field('informant.nid')))
          )
        }
      ]
    },
    {
      id: 'spouse.passport',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.passport.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.PASSPORT),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.brn',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'ID Number',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.person.field.brn.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('spouse.idType').isEqualTo(IdType.BIRTH_REGISTRATION_NUMBER),
            requireSpouseDetails
          )
        }
      ]
    },
    {
      id: 'spouse.addressDivider_1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
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
          conditional: requireSpouseDetails
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
            requireSpouseDetails
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
            requireSpouseDetails,
            or(
              field('mother.detailsNotAvailable').isEqualTo(true),
              field('father.addressSameAs').isEqualTo(YesNoTypes.NO)
            )
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
      id: 'spouse.addressDivider_2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireSpouseDetails
        }
      ]
    }
  ]
})
