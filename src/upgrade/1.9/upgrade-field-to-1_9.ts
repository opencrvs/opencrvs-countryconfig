import { FieldType, TextField } from '@opencrvs/toolkit/events'
import { ITextFormField } from '../../form/types/types'
import { validatorToValidation } from './validators'
import { upgradeConditionals } from './conditionals'

export const defineTextField = (field: ITextFormField) => {
  const id = field.name

  // @TODO: Auto-generate translation id's for these and add them to the translation file, rather than warning.
  // Our default forms don't use prefix at all.
  if (field.prefix)
    console.warn(
      `Prefix needs to be translated for Events V2, please add the prefix manually for ${id}.`
    )

  if (field.postfix)
    console.warn(
      `Postfix needs to be translated for Events v2, please add the prefix manually for ${id}.`
    )

  if (typeof field.initialValue === 'string' && field.initialValue.length === 0)
    delete field.initialValue

  const validation = validatorToValidation(id, field.validator)
  // @TODO: Add support for 'hidden', 'disabled' and 'dependsOn'
  // previously:
  //   hidden: field.hidden,
  //   disabled: field.disabled,
  const conditionals = upgradeConditionals(id, field.conditionals ?? [])

  return {
    id,
    type: FieldType.TEXT,
    label: {
      defaultMessage: field.label.defaultMessage as string,
      description: field.label.description as string,
      id: field.label.id as string
    },
    required: field.required!,
    defaultValue: field.initialValue as string,
    placeholder:
      typeof field.placeholder !== 'undefined'
        ? {
            defaultMessage: field.placeholder.defaultMessage as string,
            description: field.placeholder.description as string,
            id: field.placeholder.id as string
          }
        : undefined!,
    hideLabel: field.hideHeader!,
    validation,
    conditionals,
    // @TODO: We probably don't need to convert this at all, as the default forms only used this for 'ADDRESS'. We can convert that separately.
    parent: field.dependency ? { _fieldId: field.dependency } : undefined!,
    configuration: {
      maxLength: field.maxLength,
      type: 'text'
    }
  } satisfies Required<TextField>
}
