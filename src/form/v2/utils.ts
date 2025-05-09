import { SelectOption, TranslationConfig } from '@opencrvs/toolkit/events'

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
