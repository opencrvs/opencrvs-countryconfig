import { Validator } from '@countryconfig/form/types/validators'
import { invalidNameValidator } from '@countryconfig/form/v2/birth/validators'
import { compact as removeUndefineds } from 'lodash'

const englishOnlyNameFormat = (fieldName: string) =>
  invalidNameValidator(fieldName)

export const validatorToValidation = (
  fieldName: string,
  validator: Validator[]
) => {
  const validations = validator.map(({ operation }) => {
    if (operation === 'englishOnlyNameFormat') {
      return englishOnlyNameFormat(fieldName)
    }

    console.warn(`Validator '${operation}' not reckognized.`)
    return undefined
  })

  return removeUndefineds(validations)
}
