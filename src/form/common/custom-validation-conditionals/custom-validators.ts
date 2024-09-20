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

import { IFormFieldValue, ValidationResult } from '../../types/types'

export function isNumberLessThan21(value: IFormFieldValue) {
  if (Number(value) < 21) {
    return {
      message: {
        defaultMessage: 'Must be less than 21',
        description:
          'The error message appears when the the given value is less than 21'
      }
    } satisfies ValidationResult
  }

  return {}
}

function isValidUIN(input: string): boolean {
  const sanitizedInput = input.replace(/\D/g, '')
  let sum = 0
  let isOdd = false

  for (let i = sanitizedInput.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitizedInput[i], 10)

    if (isOdd) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isOdd = !isOdd
  }

  return sum % 10 === 0
}

function isAValidNIDNumberFormat(value: string): boolean {
  // pattern should be same as defaultApplicationConfig.NID_NUMBER_PATTERN
  // in src/api/application/application-config-default.ts
  const pattern = '^[0-9]{10}$'
  return new RegExp(pattern).test(value)
}

export function validIDNumberCustom(typeOfID: string) {
  return function (value: any) {
    value = (value && value.toString()) || ''

    const cast = value as string
    const trimmedValue = cast === undefined || cast === null ? '' : cast.trim()
    if (typeOfID === 'NATIONAL_ID') {
      if (
        (isAValidNIDNumberFormat(trimmedValue) && isValidUIN(trimmedValue)) ||
        !trimmedValue
      ) {
        return undefined
      }

      return {
        message: {
          defaultMessage:
            'The National ID can only be numeric and must be 10 digits long',
          id: 'validations.validNationalId'
        }
      } satisfies ValidationResult
    }
    return undefined
  }
}

export function isDateNotOlderThanDays(limit: number) {
  return (value: string) => {
    const inputDate = new Date(value)
    const currentDate = new Date()
    const timeDifference = currentDate.getTime() - inputDate.getTime()
    const dayDifference = timeDifference / (1000 * 3600 * 24)

    if (dayDifference > limit) {
      return {
        message: {
          id: 'validations.isDateNotOlderThanDays',
          defaultMessage: 'Over {limit} days. Unable to register',
          description:
            'The error message appears when the given date is older than the limit days'
        },
        props: { limit: 30 }
      } satisfies ValidationResult
    }

    return undefined
  }
}
