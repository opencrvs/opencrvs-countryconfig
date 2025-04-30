import {
  InferredInput,
  PageTypes,
  defineConfig,
  defineFormPage,
  fieldTypes as ALL_SUPPORTED_FIELD_TYPES,
  FieldType,
  TextField,
  FieldConfig,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import {
  ISerializedForm,
  ISerializedFormSectionGroup,
  ITextFormField,
  InitialValue,
  SerializedFormField
} from './form/types/types'
import assert from 'assert'

export const defineTextField = (field: ITextFormField) => {
  const id = field.name

  // @TODO: Auto-generate the translation messages, and after the script has run, go through the TranslationMessages and if they aren't available in the client.csv *käsittelyä*
  // ^^^ think about the skill level of the upgraders

  // ..or @TODO: käyttäjälle annetaan lista niistä puuttuvista ja formiin menis jotain @TODO: kommentteja

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

  return {
    id,
    type: FieldType.TEXT,
    label: {
      defaultMessage: field.label.defaultMessage! as any,
      description: field.label.description! as any,
      id: field.label.id! as any
    },
    required: field.required!,
    disabled: field.disabled!,
    defaultValue: field.initialValue as any,
    hidden: field.hidden!,
    placeholder:
      typeof field.placeholder !== 'undefined'
        ? {
            defaultMessage: field.placeholder.defaultMessage as any,
            description: field.placeholder.description as any,
            id: field.placeholder.id as any
          }
        : (undefined as any),
    dependsOn: field.dependency ? [field.dependency] : (undefined as any),
    hideLabel: field.hideHeader!,
    // @TODO: How much the
    // validation: field.validator,
    // conditionals: undefined
    configuration: {
      maxLength: field.maxLength,
      type: 'text'
    }
  } as any satisfies Required<TextField>
}
