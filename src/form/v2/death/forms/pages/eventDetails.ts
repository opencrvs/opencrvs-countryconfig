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
  field,
  FieldType,
  not,
  or,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'

import { createSelectOptions, emptyMessage } from '@countryconfig/form/v2/utils'
import { applicationConfig } from '@countryconfig/api/application/application-config'

export const MannerDeathType = {
  MANNER_NATURAL: 'MANNER_NATURAL',
  MANNER_ACCIDENT: 'MANNER_ACCIDENT',
  MANNER_SUICIDE: 'MANNER_SUICIDE',
  MANNER_HOMICIDE: 'MANNER_HOMICIDE',
  MANNER_UNDETERMINED: 'MANNER_UNDETERMINED'
} as const
export type MannerDeathTypeKey = keyof typeof MannerDeathType

const mannerDeathMessageDescriptors = {
  MANNER_NATURAL: {
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathNatural'
  },
  MANNER_ACCIDENT: {
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathAccident'
  },
  MANNER_SUICIDE: {
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathSuicide'
  },
  MANNER_HOMICIDE: {
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathHomicide'
  },
  MANNER_UNDETERMINED: {
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathUndetermined'
  }
} satisfies Record<keyof typeof MannerDeathType, TranslationConfig>

const mannerDeathTypeOptions = createSelectOptions(
  MannerDeathType,
  mannerDeathMessageDescriptors
)

export const SourceCauseDeathType = {
  PHYSICIAN: 'PHYSICIAN',
  LAY_REPORTED: 'LAY_REPORTED',
  VERBAL_AUTOPSY: 'VERBAL_AUTOPSY',
  MEDICALLY_CERTIFIED: 'MEDICALLY_CERTIFIED'
} as const
export type SourceCauseDeathTypeKey = keyof typeof SourceCauseDeathType

const sourceCauseDeathMessageDescriptors = {
  PHYSICIAN: {
    defaultMessage: 'Physician',
    description: 'Label for form field: physician',
    id: 'form.field.label.physician'
  },
  LAY_REPORTED: {
    defaultMessage: 'Lay reported',
    description: 'Label for form field: Lay reported',
    id: 'form.field.label.layReported'
  },
  VERBAL_AUTOPSY: {
    defaultMessage: 'Verbal autopsy',
    description: 'Option for form field: verbalAutopsy',
    id: 'form.field.label.verbalAutopsy'
  },
  MEDICALLY_CERTIFIED: {
    defaultMessage: 'Medically Certified Cause of Death',
    description: 'Option for form field: Method of Cause of Death',
    id: 'form.field.label.medicallyCertified'
  }
} satisfies Record<keyof typeof SourceCauseDeathType, TranslationConfig>

const sourceCauseDeathOptions = createSelectOptions(
  SourceCauseDeathType,
  sourceCauseDeathMessageDescriptors
)

export const PlaceOfDeath = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  DECEASED_USUAL_RESIDENCE: 'DECEASED_USUAL_RESIDENCE',
  OTHER: 'OTHER'
} as const

const placeOfDeathMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'v2.form.field.label.healthInstitution'
  },
  DECEASED_USUAL_RESIDENCE: {
    defaultMessage: "Deceased's usual place of residence",
    description:
      'Option for place of occurrence of death same as deceased primary address',
    id: 'v2.form.field.label.placeOfDeathSameAsPrimary'
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

export const eventDetails = defineFormPage({
  id: 'eventDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Event details',
    description: 'Form section title for event details',
    id: 'v2.form.death.eventDetails.title'
  },
  fields: [
    {
      id: 'event.date',
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'v2.event.death.action.declare.form.section.event.field.date.error'
          },
          validator: field('event.date').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.event.field.date.label'
      }
    },
    {
      id: 'event.reasonForLateRegistration',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.event.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('event.date')
                .isAfter()
                .days(applicationConfig.DEATH.REGISTRATION_TARGET)
                .inPast()
            ),
            field('event.date').isBefore().now()
          )
        }
      ]
    },
    {
      id: 'event.manner',
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Manner of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.event.field.manner.label'
      },
      options: mannerDeathTypeOptions
    },
    {
      id: 'event.causeOfDeath',
      type: FieldType.CHECKBOX,
      label: {
        defaultMessage: 'Cause of death has been established',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.event.field.causeOfDeath.label'
      }
    },
    {
      id: 'event.sourceCauseDeath',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Source of cause of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.event.field.sourceCauseDeath.label'
      },
      options: sourceCauseDeathOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('event.causeOfDeath').isEqualTo(true)
        }
      ]
    },
    {
      id: 'event.description',
      type: FieldType.TEXTAREA,
      required: true,
      label: {
        defaultMessage: 'Description',
        description:
          'Description of cause of death by lay person or verbal autopsy',
        id: 'v2.event.death.action.declare.form.section.event.field.description.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            or(
              field('event.sourceCauseDeath').isEqualTo(
                SourceCauseDeathType.LAY_REPORTED
              ),
              field('event.sourceCauseDeath').isEqualTo(
                SourceCauseDeathType.VERBAL_AUTOPSY
              )
            ),
            field('event.causeOfDeath').isEqualTo(true)
          )
        }
      ]
    },
    {
      id: 'event.detailsDivider_1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'event.detailsAddressHelper',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'Place of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.event.field.addressHelper.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    {
      id: 'event.detailsDivider_2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'event.placeOfDeath',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Place of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.placeOfDeath.label'
      },
      options: placeOfDeathOptions
    },
    {
      id: 'event.deathLocation',
      type: FieldType.FACILITY,
      required: true,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.deathLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('event.placeOfDeath').isEqualTo(
            PlaceOfDeath.HEALTH_FACILITY
          )
        }
      ]
    },
    {
      id: 'event.deathLocationOther',
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Death location address',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.deceased.field.deathLocationOther.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('event.placeOfDeath').isEqualTo(PlaceOfDeath.OTHER)
        }
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    }
  ]
})
