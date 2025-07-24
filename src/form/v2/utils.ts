import { SelectOption, TranslationConfig } from '@opencrvs/toolkit/events'
import { countries, callingCountries } from 'country-data'

interface CountryOption {
  label: string
  value: string
}

interface Country {
  name: string
  alpha2: string
  alpha3: string
  status: string
  currencies: string[]
  languages: string[]
  countryCallingCodes: string[]
  ioc: string
  emoji: string
}

const getFlagEmoji = (countryCode: string): string => {
  return countryCode
    .toUpperCase()
    .replace(/./g, (char: string) =>
      String.fromCodePoint(char.charCodeAt(0) + 0x1f1a5)
    )
}

export const getDialingCodeFromAlpha3 = (alpha3: string): string => {
  const match = countries.all.find(
    (country: Country) => country.alpha3 === alpha3.toUpperCase()
  )
  return match?.countryCallingCodes?.[0] // return first dialing code (e.g. +94)
}

export const intlPhoneOptions: CountryOption[] = callingCountries.all
  .filter(
    (c: any): c is typeof c & { alpha2: string } =>
      c.countryCallingCodes.length > 0 && !!c.alpha2
  )
  .map((c: any): CountryOption => {
    const code: string = c.countryCallingCodes[0]
    const flag: string = getFlagEmoji(c.alpha2)
    return {
      label: `${flag} ${code}`,
      value: code
    }
  })
  .sort((a: CountryOption, b: CountryOption) => a.label.localeCompare(b.label))

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
