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
import { field } from '@opencrvs/toolkit/events'
import { defineFormConditional } from '@opencrvs/toolkit/conditionals'

export const MAX_NAME_LENGTH = 32

export const invalidNameValidator = (fieldName: string) => ({
  message: {
    defaultMessage:
      "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)",
    description: 'This is the error message for invalid name',
    id: 'v2.error.invalidName'
  },
  validator: field(fieldName).isValidEnglishName()
})

export const nationalIdValidator = (fieldId: string) => ({
  message: {
    defaultMessage:
      'The national ID can only be numeric and must be 10 digits long',
    description: 'This is the error message for an invalid national ID',
    id: 'v2.error.invalidNationalId'
  },
  validator: defineFormConditional({
    type: 'object',
    properties: {
      [fieldId]: {
        type: 'string',
        pattern: '^[0-9]{10}$',
        description: 'Must be numeric and 10 digits long.'
      }
    }
  })
})
