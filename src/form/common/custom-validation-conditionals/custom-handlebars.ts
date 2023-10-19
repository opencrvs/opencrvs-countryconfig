import * as Handlebars from 'handlebars'

export const loud: Handlebars.HelperDelegate = function (
  this: any,
  value: string
) {
  return value.toUpperCase()
}

export const quiet: Handlebars.HelperDelegate = function (
  this: any,
  value: string
) {
  return value.toLowerCase()
}
