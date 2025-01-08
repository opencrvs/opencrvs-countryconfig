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

import { FieldConditional, FieldConfig } from '@opencrvs/toolkit/events'

export const appendConditionalsToFields = ({
  inputFields,
  newConditionals
}: {
  inputFields: FieldConfig[]
  newConditionals: FieldConditional[]
}): FieldConfig[] =>
  inputFields.map(
    (inputField) =>
      ({
        ...inputField,
        conditionals: [...inputField.conditionals, ...newConditionals]
      } as FieldConfig)
  )

export const concatFields = (fields: string[]) => {
  return fields.join('____')
}
