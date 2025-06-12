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
  ConditionalType,
  FieldType,
  PageTypes,
  field,
  never
} from '@opencrvs/toolkit/events'

import { createSelectOptions } from '@countryconfig/form/v2/utils'
import { PersonType } from '@countryconfig/form/v2/person'
import { requireDeceasedDetails } from './deceased'

const MannerOfDeathTypes = {
  NATURAL_CAUSES: 'Natural Causes',
  ACCIDENT: 'Accident',
  SUICIDE: 'Suicide',
  HOMICIDE: 'Homicide',
  MANNER_UNDETERMINED: 'Manner Undetermined'
} as const

export const PlaceOfBirth = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  PRIVATE_HOME: 'PRIVATE_HOME',
  OTHER: 'OTHER'
} as const

const mannerOfDeathMessageDescriptors = {
  NATURAL_CAUSES: {
    defaultMessage: 'Natural Causes',
    description: 'Label for option natural causes',
    id: 'v2.form.field.label.naturalCauses'
  },
  ACCIDENT: {
    defaultMessage: 'Accident',
    description: 'Label for option accident',
    id: 'v2.form.field.label.accident'
  },
  SUICIDE: {
    defaultMessage: 'Suicide',
    description: 'Label for option suicide',
    id: 'v2.form.field.label.suicide'
  },
  HOMICIDE: {
    defaultMessage: 'Homicide',
    description: 'Label for option homicide',
    id: 'v2.form.field.label.homicide'
  },
  MANNER_UNDETERMINED: {
    defaultMessage: 'Manner Undetermined',
    description: 'Label for option manner undetermined',
    id: 'v2.form.field.label.mannerUndetermined'
  }
} satisfies Record<keyof typeof MannerOfDeathTypes, TranslationConfig>

const mannerOfDeathOptions = createSelectOptions(
  MannerOfDeathTypes,
  mannerOfDeathMessageDescriptors
)

export const PlaceOfDeath = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  DECEASED_RESIDENCE: 'DECEASED_RESIDENCE',
  OTHER: 'OTHER'
} as const

const placeOfDeathMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'v2.form.field.label.healthInstitution'
  },
  DECEASED_RESIDENCE: {
    defaultMessage: `Deceased's usual place of residence`,
    description: 'Select item for Deceased usual place of residence',
    id: 'v2.form.field.label.deceasedUsualPlaceOfResidence'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'v2.form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfDeath, TranslationConfig>

const placeOfDeathOptions = createSelectOptions(
  PlaceOfDeath,
  placeOfDeathMessageDescriptors
)

export const deceasedDetails = defineFormPage({
  id: 'deceasedDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Event details',
    description: 'Form section title for event details',
    id: 'v2.form.death.deceasedDetails.title'
  },
  fields: [
    {
      id: `${PersonType.deceased}.dob`,
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.death.action.declare.form.section.deceasedDetails.field.dob.error'
          },
          validator: field('deceased.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceasedDetails.field.dob.label'
      }
    },
    {
      id: 'child.mannerofdeath',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Manner of Death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceasedDetails.field.mannerofdeath.label'
      },
      options: mannerOfDeathOptions
    },
    {
      id: `${PersonType.deceased}.causeestablished`,
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Cause of death has been established',
        description: 'This is the label for the field',
        id: `v2.event.death.action.declare.form.section.deceasedDetails.field.causeestablished.checkbox.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireDeceasedDetails
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'deceased.placeOfDeath',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Place of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceasedDetails.field.placeOfDelivery.label'
      },
      options: placeOfDeathOptions
    }
  ]
})
