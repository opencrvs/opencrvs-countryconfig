export const conditionals = {
  // This is an example how you can override the conditionals found from opencrvs-core
  isDefaultCountry: {
    action: 'hide',
    expression: 'isDefaultCountry(values.country)'
  }
}
