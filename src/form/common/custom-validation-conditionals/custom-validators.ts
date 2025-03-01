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

const INFORMANT_MININUM_AGE = 18

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

export const minAgeGapExist = (
  first: string,
  second: string,
  minAgeGap: number
): boolean => {
  const diff =
    (new Date(first).getTime() - new Date(second).getTime()) /
    (1000 * 60 * 60 * 24) /
    365
  return diff >= minAgeGap
}

export function isInformantOfLegalAgeCustom(value: IFormFieldValue) {
  const isInformantOldEnough =
    typeof value === 'string'
      ? minAgeGapExist(
          new Date().toISOString().split('T')[0],
          value,
          INFORMANT_MININUM_AGE
        )
      : true

  if (!value || isInformantOldEnough) {
    return undefined
  } else {
    return {
      message: {
        id: 'validations.isInformantOfLegalAge',
        defaultMessage: 'Informant is not of legal age',
        description:
          'The error message appears when the informant is not of legal age'
      }
    }
  }
}

export function isDateNotOlderThanDays(limit: number) {
  return (value: string, $draft: Record<string, any>) => {
    const inputDate = new Date(value)
    const currentDate = new Date()
    const timeDifference = currentDate.getTime() - inputDate.getTime()
    const dayDifference = timeDifference / (1000 * 3600 * 24)
    const isFirstCertificate =
      !$draft?.history?.some((h: any) => h.regStatus === 'CERTIFIED') ||
      !$draft?.history

    if (isFirstCertificate && dayDifference > limit) {
      return {
        message: {
          id: 'validations.isDateNotOlderThanDays',
          defaultMessage: 'Over {limit} days. Unable to register',
          description:
            'The error message appears when the given date is older than the limit days'
        },
        props: { limit: 365 }
      } satisfies ValidationResult
    }

    return undefined
  }
}

export function isFatherRecognitionDocNeeded() {
  return (_: string, $draft: Record<string, any>) => {
    const isRecognition = Array.from(
      { length: 10 },
      (_, i) => 'typeOfMention__' + i
    )?.some(
      (key) =>
        $draft?.mention &&
        $draft.mention[key] &&
        $draft.mention[key] === 'RECOGNITION'
    )
    const isDocProvided = $draft?.documents?.uploadDocForFather?.length
    const isBirthRecognition =
      $draft.father.fatherHasFormallyRecognisedChild == 'true'

    if (isBirthRecognition && !isDocProvided) {
      return {
        message: {
          id: 'validations.isFatherRecognitionDocNeeded',
          defaultMessage: 'Required for recognition',
          description:
            'The error message appears when father recognize the child on declaration and father CIN is not provided'
        }
      } satisfies ValidationResult
    }

    if (isRecognition && !isDocProvided) {
      return {
        message: {
          id: 'validations.isFatherRecognitionDocNeeded',
          defaultMessage: 'Required for recognition',
          description:
            'The error message appears when father CIN is not provided on recognition'
        }
      } satisfies ValidationResult
    }

    return undefined
  }
}


/**
 * @todo find better way to set this the correct way into separate eusable file without importation error
 */
function isValidDate(value?: string) {
  // Check if value is null, undefined, or an empty string
  if (!value || typeof value !== 'string') {
    return false
  }

  // Parse the string into a Date object
  const date = new Date(value)

  // Check if the resulting Date object is valid
  return !isNaN(date.getTime())
}

/**
 * Custom validator to check if the date value of the field is not before child birth date
 */
export function isDateNotBeforeChildBirthDate() {
  return (value: string, $draft: Record<string, any>) => {
    const childBirthDate = $draft?.child?.childBirthDate

    if (
      childBirthDate &&
      value &&
      isValidDate(childBirthDate) &&
      isValidDate(value)
    ) {
      const isBeforeChildBirthDate = new Date(childBirthDate) > new Date(value)

      if (isBeforeChildBirthDate) {
        return {
          message: {
            id: 'validations.isDateNotBeforeChildBirthDate',
            defaultMessage: 'Date must be after child birth date',
            description:
              'The error message appears when the given date is before child birth date'
          }
        } satisfies ValidationResult
      }
 }
export function isProofOfRecognitionDocNeeded() {
  return (_: string, $draft: Record<string, any>) => {
    const isRecognition = Array.from(
      { length: 10 },
      (_, i) => 'typeOfMention__' + i
    )?.some(
      (key) =>
        $draft?.mention &&
        $draft.mention[key] &&
        $draft.mention[key] === 'RECOGNITION'
    )
    const isRecognitionDocProvided =
      $draft?.documents?.uploadDocForRecognition?.length

    if (isRecognition && !isRecognitionDocProvided) {
      return {
        message: {
          id: 'validations.isProofOfRecognitionDocNeeded',
          defaultMessage: 'Required for recognition',
          description:
            'The error message appears when proof of recognition Doc is not provided on recognition'
        }
      } satisfies ValidationResult

   

    return undefined
  }
}
