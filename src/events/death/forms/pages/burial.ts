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
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  never,
  PageTypes,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  defaultStreetAddressConfiguration,
  emptyMessage,
  getNestedFieldValidators
} from '@countryconfig/events/utils'

const BurialArrangementType = {
  BURIAL_IN_TUVALU: 'BURIAL_IN_TUVALU',
  BURIAL_OUTSIDE_TUVALU: 'BURIAL_OUTSIDE_TUVALU',
  OTHER: 'OTHER'
} as const

const burialArrangementOptions = [
  {
    value: BurialArrangementType.BURIAL_IN_TUVALU,
    label: {
      defaultMessage: 'Burial in Tuvalu',
      description: 'Option for burial arrangement: in Tuvalu',
      id: 'event.death.action.declare.form.section.burial.field.arrangement.option.inTuvalu'
    }
  },
  {
    value: BurialArrangementType.BURIAL_OUTSIDE_TUVALU,
    label: {
      defaultMessage: 'Burial planned outside Tuvalu',
      description: 'Option for burial arrangement: outside Tuvalu',
      id: 'event.death.action.declare.form.section.burial.field.arrangement.option.outsideTuvalu'
    }
  },
  {
    value: BurialArrangementType.OTHER,
    label: {
      defaultMessage: 'Other',
      description: 'Option for burial arrangement: other',
      id: 'event.death.action.declare.form.section.burial.field.arrangement.option.other'
    }
  }
]

const isOtherBurialArrangement = field(
  'burial.arrangement'
).isEqualTo(BurialArrangementType.OTHER)

export const burial = defineFormPage({
  id: 'burial',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Burial details',
    description: 'Form section title for burial details',
    id: 'form.death.burial.title'
  },
  fields: [
    // ---- Burial arrangement ----
    {
      id: 'burial.arrangement',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Burial arrangement',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.burial.field.arrangement.label'
      },
      options: burialArrangementOptions,
      defaultValue: BurialArrangementType.BURIAL_IN_TUVALU
    },
    // ---- Specify other burial status (shown if Other) ----
    {
      id: 'burial.arrangementOther',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Specify other burial status',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.burial.field.arrangementOther.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isOtherBurialArrangement
        }
      ]
    },
    // ---- Date of burial ----
    {
      id: 'burial.date',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Date of burial',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.burial.field.date.label'
      }
    },
    // ---- Where buried heading ----
    {
      id: 'burial.locationHelper',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Where buried',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.burial.field.locationHelper.label'
      },
      configuration: {
        styles: { fontVariant: 'h3' }
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Burial location (address) ----
    {
      id: 'burial.address',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      analytics: true,
      label: {
        defaultMessage: 'Burial location',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.burial.field.address.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field('burial.address').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'burial.address',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    // ---- Divider ----
    {
      id: 'burial.descriptionDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // ---- Burial place or location description ----
    {
      id: 'burial.locationDescription',
      type: FieldType.TEXTAREA,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Burial place or location description',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.burial.field.locationDescription.label'
      }
    }
  ]
})
