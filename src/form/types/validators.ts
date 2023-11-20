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

import * as customValidators from '../common/custom-validation-conditionals/custom-validators'

/** Validators that are built in to core. You can create your own ones, or override these ones in the custom validators file imported above */
type CoreValidator =
  | 'requiredBasic'
  | 'requiredSymbol'
  | 'required'
  | 'minLength'
  | 'validLength'
  | 'maxLength'
  | 'blockAlphaNumericDot'
  | 'nonDecimalPointNumber'
  | 'numeric'
  | 'facilityMustBeSelected'
  | 'officeMustBeSelected'
  | 'phoneNumberFormat'
  | 'emailAddressFormat'
  | 'dateFormat'
  | 'isValidBirthDate'
  | 'isValidChildBirthDate'
  | 'isValidParentsBirthDate'
  | 'checkBirthDate'
  | 'checkMarriageDate'
  | 'isValidDateOfBirthForMarriage'
  | 'dateGreaterThan'
  | 'dateLessThan'
  | 'dateNotInFuture'
  | 'isDateInPast'
  | 'dateInPast'
  | 'dateFormatIsCorrect'
  | 'bengaliOnlyNameFormat'
  | 'englishOnlyNameFormat'
  | 'range'
  | 'oneOf'
  | 'validIDNumber'
  | 'duplicateIDNumber'
  | 'isValidDeathOccurrenceDate'
  | 'isMoVisitDateAfterBirthDateAndBeforeDeathDate'
  | 'isInformantOfLegalAge'
  | 'greaterThanZero'
  | 'notGreaterThan'

type CustomValidator = keyof typeof customValidators
export type Validator = {
  operation: CoreValidator | CustomValidator
  parameters?: any[]
}
