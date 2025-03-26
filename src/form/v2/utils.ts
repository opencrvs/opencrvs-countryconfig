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

import { SelectOption, TranslationConfig } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'

export const MAX_NAME_LENGTH = 32

export const createSelectOptions = <
  T extends Record<string, string>,
  M extends Record<keyof T, TranslationConfig>
>(
  options: T,
  messageDescriptors: M
): SelectOption[] =>
  Object.entries(options).map(([key, value]) => ({
    value,
    label: messageDescriptors[key as keyof T]
  }))

export const emptyMessage = {
  defaultMessage: '',
  description: 'empty string',
  id: 'v2.messages.emptyString'
}

export const invalidNameValidator = (fieldName: string) => ({
  message: {
    defaultMessage:
      "Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)",
    description: 'This is the error message for invalid name',
    id: 'v2.error.invalidName'
  },
  validator: field(fieldName).isValidEnglishName()
})
