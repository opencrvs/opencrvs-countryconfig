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
  FieldType,
  PageTypes,
  ConditionalType,
  field,
  not
} from '@opencrvs/toolkit/events'
import { emptyMessage } from '@countryconfig/events/utils'

export const feeCollection = defineFormPage({
  id: 'feeCollection',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Collect fee',
    description: 'Form section title for fee collection',
    id: 'event.nameChange.action.declare.form.section.feeCollection.title'
  },
  fields: [
    // E1: Service (for less than 4 years)
    {
      id: 'feeCollection.serviceLessThan4',
      type: FieldType.HEADING,
      hideLabel: true,
      configuration: { styles: { fontVariant: 'h3' } },

      label: {
        defaultMessage: 'Service',
        description: 'Service',
        id: 'form.section.informant.service'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('subjects.dob')
              .isBefore()
              .days(4 * 365)
              .inPast()
          )
        }
      ]
    },
    {
      id: 'feeCollection.serviceLessThan4Description',
      type: FieldType.HEADING,
      hideLabel: true,
      label: {
        defaultMessage: 'Name change (deed poll): Up to 3 years of age',
        description: 'Name change (deed poll): Up to 3 years of age',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.serviceLessThan4Description.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('subjects.dob')
              .isBefore()
              .days(4 * 365)
              .inPast()
          )
        }
      ]
    },
    {
      id: 'feeCollection.serviceLessThan4Feeheading',
      type: FieldType.HEADING,
      hideLabel: true,
      configuration: { styles: { fontVariant: 'h3' } },

      label: {
        defaultMessage: 'Fee',
        description: 'Fee',
        id: 'form.section.informant.fee'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('subjects.dob')
              .isBefore()
              .days(4 * 365)
              .inPast()
          )
        }
      ]
    },
    {
      id: 'feeCollection.serviceLessThan4Fee',
      type: FieldType.HEADING,
      hideLabel: true,
      label: {
        defaultMessage: '$40',
        description: '$40',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.serviceLessThan4Fee.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('subjects.dob')
              .isBefore()
              .days(4 * 365)
              .inPast()
          )
        }
      ]
    },

    // E3: Service (for 4 years and over)
    {
      id: 'feeCollection.fee4AndOver',
      type: FieldType.HEADING,
      hideLabel: true,
      configuration: { styles: { fontVariant: 'h3' } },

      label: {
        defaultMessage: 'Service',
        description: 'Service',
        id: 'form.section.informant.service'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.dob')
            .isBefore()
            .days(4 * 365)
            .inPast()
        }
      ]
    },
    {
      id: 'feeCollection.serviceMoreThan4Description',
      type: FieldType.HEADING,
      hideLabel: true,
      label: {
        defaultMessage: 'Name change (deed poll): 4 years of age and over',
        description: 'Name change (deed poll): 4 years of age and over',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.serviceMoreThan4Description.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.dob')
            .isBefore()
            .days(4 * 365)
            .inPast()
        }
      ]
    },
    {
      id: 'feeCollection.fee4AndOverFeeheading',
      type: FieldType.HEADING,
      hideLabel: true,
      configuration: { styles: { fontVariant: 'h3' } },

      label: {
        defaultMessage: 'Fee',
        description: 'Fee',
        id: 'form.section.informant.fee'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.dob')
            .isBefore()
            .days(4 * 365)
            .inPast()
        }
      ]
    },
    {
      id: 'feeCollection.serviceMoreThan4Fee',
      type: FieldType.HEADING,
      hideLabel: true,
      label: {
        defaultMessage: '$75',
        description: '$75',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.serviceMoreThan4Fee.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('subjects.dob')
            .isBefore()
            .days(4 * 365)
            .inPast()
        }
      ]
    },

    // Fee waiver checkbox
    {
      id: 'feeCollection.feeWaived',
      type: FieldType.CHECKBOX,
      required: false,
      label: {
        defaultMessage: 'Fee is waived / not collected',
        description: 'Label for fee waiver checkbox',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.feeWaived.label'
      }
    },
    // Divider
    {
      id: 'feeCollection.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // E5: Confirm amount collected
    {
      id: 'feeCollection.amountCollected',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Confirm amount collected',
        description: 'Label for amount collected field',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.amountCollected.label'
      },
      configuration: {
        prefix: {
          defaultMessage: '$',
          description: 'Dollar sign prefix',
          id: 'event.nameChange.action.declare.form.section.feeCollection.field.amountCollected.prefix'
        }
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('feeCollection.feeWaived').isEqualTo(true))
        }
      ]
    },
    // E6: Receipt number
    {
      id: 'feeCollection.receiptNumber',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Receipt number',
        description: 'Label for receipt number field',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.receiptNumber.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('feeCollection.feeWaived').isEqualTo(true))
        }
      ]
    },
    // Reason for fee waiver / non-collection
    {
      id: 'feeCollection.waiverReason',
      type: FieldType.TEXTAREA,
      required: false,
      label: {
        defaultMessage: 'Reason for fee waiver / non-collection',
        description: 'Label for waiver reason field',
        id: 'event.nameChange.action.declare.form.section.feeCollection.field.waiverReason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('feeCollection.feeWaived').isEqualTo(true)
        }
      ]
    }
  ]
})
