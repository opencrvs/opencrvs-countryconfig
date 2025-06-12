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
  defineFormPage,
  TranslationConfig,
  FieldType,
  or,
  PageTypes,
  field
} from '@opencrvs/toolkit/events'

import { createSelectOptions } from '@countryconfig/form/v2/utils'
import { PersonType } from '@countryconfig/form/v2/person'

export const InformantType = {
  SPOUSE: 'Spouse',
  SON: 'Son',
  DAUGHTER: 'Daughter',
  SON_IN_LAW: 'Son in law',
  DAUGHTER_IN_LAW: 'Daughter in law',
  MOTHER: 'Mother',
  FATHER: 'Father',
  GRAND_SON: 'Grand son',
  GRAND_DAUGHTER: 'Grand Daughter',
  SOMEONE_ELSE: 'Someone else'
} as const

const PHONE_NUMBER_REGEX = '^0(7|9)[0-9]{8}$'
const informantTypeMessageDescriptors = {
  SPOUSE: {
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse',
    id: 'v2.form.field.label.spouse'
  },
  SON: {
    defaultMessage: 'Son',
    description: 'Label for option Son',
    id: 'v2.form.field.label.son'
  },
  DAUGHTER: {
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter',
    id: 'v2.form.field.label.daughter'
  },
  SON_IN_LAW: {
    defaultMessage: 'Son in law',
    description: 'Label for option Son in law',
    id: 'v2.form.field.label.sonInLaw'
  },
  DAUGHTER_IN_LAW: {
    defaultMessage: 'Daughter in law',
    description: 'Label for option Daughter in law',
    id: 'v2.form.field.label.daughterInLaw'
  },
  MOTHER: {
    defaultMessage: 'Mother',
    description: 'Label for option Mother',
    id: 'v2.form.field.label.mother'
  },
  FATHER: {
    defaultMessage: 'Father',
    description: 'Label for option Father',
    id: 'v2.form.field.label.father'
  },
  GRAND_SON: {
    defaultMessage: 'Grand son',
    description: 'Label for option Grand son',
    id: 'v2.form.field.label.grandSon'
  },
  GRAND_DAUGHTER: {
    defaultMessage: 'Grand Daughter',
    description: 'Label for option Grand Daughter',
    id: 'v2.form.field.label.grandDaughter'
  },
  SOMEONE_ELSE: {
    defaultMessage: 'Someone else',
    description: 'Label for option Someone else',
    id: 'v2.form.field.label.someoneElse'
  }
} satisfies Record<keyof typeof InformantType, TranslationConfig>

const informantTypeOptions = createSelectOptions(
  InformantType,
  informantTypeMessageDescriptors
)

export const requireDeceasedDetails = or(
  field('informant.relation').isEqualTo(PersonType.deceased)
)

export const informant = defineFormPage({
  id: 'informant',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: `Informant's details`,
    description: 'Form section title for the informant details',
    id: 'v2.form.death.informant.title'
  },
  fields: [
    {
      id: 'informant.informantType',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Informant Type',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.informant.field.informantType.label'
      },
      options: informantTypeOptions
    },
    {
      id: 'informant.phoneNo',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Phone number',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.informant.field.phoneNo.label'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Must be a valid 10 digit number that starts with 0(7|9)',
            description:
              'The error message that appears on phone numbers where the first two characters must be 07 or 09, and length must be 10',
            id: 'v2.event.death.action.declare.form.section.informant.field.phoneNo.error'
          },
          validator: or(
            field('informant.phoneNo').matches(PHONE_NUMBER_REGEX),
            field('informant.phoneNo').isFalsy()
          )
        }
      ]
    },
    {
      id: 'informant.email',
      type: FieldType.EMAIL,
      required: true,
      label: {
        defaultMessage: 'Email',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.informant.field.email.label'
      },
      configuration: {
        maxLength: 255
      }
    }
  ]
})
