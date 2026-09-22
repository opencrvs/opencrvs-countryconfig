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

import { FieldConfig, FieldType } from '@opencrvs/toolkit/events'

/**
 * Page 5 - Collect Payment
 * Fields: Fee collected (optional), Receipt number (optional)
 */

export const collectPaymentFields: FieldConfig[] = [
  // Fee collected
  {
    id: 'fees.amount',
    type: FieldType.NUMBER,
    required: false,
    label: {
      defaultMessage: 'Fee collected',
      description: 'Label for the amount field',
      id: 'event.divorce.action.correction.fees.amount.label'
    },
    configuration: {
      min: 0,
      prefix: {
        defaultMessage: '$',
        description: 'Prefix for the amount field',
        id: 'event.divorce.action.correction.fees.amount.prefix'
      }
    }
  },
  // Receipt number
  {
    id: 'fees.receiptNumber',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'Receipt number',
      description: 'Label for the receipt number field',
      id: 'event.divorce.action.correction.fees.receiptNumber.label'
    }
  }
]
