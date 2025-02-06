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

import { defineFormPage, TranslationConfig } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'
import {
  appendConditionalsToFields,
  createSelectOptions,
  emptyMessage
} from '../../utils'
import { getPersonInputCommonFields, PersonType } from '../../person'
import { getAddressFields } from '../../person/address'

export const InformantTypes = {
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
} satisfies Record<keyof typeof InformantTypes, TranslationConfig>

const birthInformantTypeOptions = createSelectOptions(
  InformantTypes,
  informantMessageDescriptors
)

export const informantPage = defineFormPage({
  id: 'informant',
  title: {
    defaultMessage: "Informant's details",
    description: 'Form section title for informants details',
    id: 'v2.form.section.informant.title'
  },
  fields: [
    {
      id: 'informant.relation',
      type: 'SELECT',
      required: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.relation.label'
      },
      options: birthInformantTypeOptions
    },
    {
      id: 'informant.other.relation',
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'Relationship to child',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.other.relation.label'
      },
      conditionals: [
        {
          type: 'HIDE',
          conditional: field('informant.relation')
            .or((field) =>
              field.isUndefined().not.inArray([InformantTypes.OTHER])
            )
            .apply()
        }
      ]
    },
    ...appendConditionalsToFields({
      inputFields: [
        ...getPersonInputCommonFields(PersonType.informant),
        ...getAddressFields(PersonType.informant),

        {
          id: 'v2.informant.address.divider.end',
          type: 'DIVIDER',
          label: emptyMessage
        }
      ],
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field('informant.relation')
            .or((field) =>
              field
                .isUndefined()
                .inArray([InformantTypes.MOTHER, InformantTypes.FATHER])
            )
            .apply()
        }
      ]
    }),
    {
      id: 'informant.phoneNo',
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.phoneNo.label'
      }
    },
    {
      id: 'informant.email',
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.informant.field.email.label'
      },
      options: {
        type: 'email'
      }
    }
  ]
})
