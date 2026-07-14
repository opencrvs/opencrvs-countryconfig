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

/*
 * This file is compiled to JavaScript and served at /handlebars.js.
 * The client loads it to register any country-specific Handlebars helpers
 * for use in certificate SVG templates.
 *
 * IMPORTANT: Each export must be a factory function that takes { intl } and returns
 * the actual Handlebars helper. This matches the LoadHandlebarHelpersResponse type
 * expected by core:
 *   export function myHelper({ intl }) {
 *     return function(arg1, arg2) { ... }
 *   }
 */

function wordWrap(text: string, boundary: number) {
  return text
    .split('\n')
    .map(function (line) {
      let pos = 0
      return line
        .split(/\b/)
        .map(function (word) {
          pos += word.length
          if (pos > boundary) {
            pos = 0
            return '\n' + word.trimLeft()
          }
          return word
        })
        .join('')
    })
    .join('\n')
    .split('\n')
}

function insertTspansIntoText(
  textLines: string[],
  x = 281.123,
  initialY = 424.418,
  lineHeight = 14
) {
  let svgString = ''
  let y = initialY
  for (const line of textLines) {
    svgString += `<tspan x="${x}" y="${y}">${line}</tspan>`
    y += lineHeight
  }
  return svgString
}

export function concatAddress(): Handlebars.HelperDelegate {
  return function (
    this: any,
    value: any,
    x = 281.123,
    initialY = 332.418,
    lineHeight = 14
  ) {
    if (value) {
      if (value['addressType'] === 'INTERNATIONAL') {
        const addressLines = [
          value?.streetLevelDetails?.addressLine1,
          value?.streetLevelDetails?.addressLine2,
          value?.streetLevelDetails?.addressLine3,
          value?.streetLevelDetails?.cityOrTown,
          value?.streetLevelDetails?.district2,
          value?.country,
          value?.streetLevelDetails?.postcodeOrZip
        ]
          .filter(Boolean)
          .join(', ')
        const lines = wordWrap(addressLines, 50)
        return insertTspansIntoText(lines, x, initialY, lineHeight)
      } else {
        const addressLines = [value?.name, value?.streetLevelDetails?.village, value?.island, value?.country]
          .filter(Boolean)
          .join(', ')
        const lines = wordWrap(addressLines, 50)
        return insertTspansIntoText(lines, x, initialY, lineHeight)
      }
    } else {
      return ''
    }
  }
}

/**
 * Returns the value if truthy, otherwise the fallback string.
 * Use instead of $or when the fallback is a string literal.
 * Example: {{$defaultTo ($lookup $declaration 'field') '-'}}
 */
export function $defaultTo() {
  return function (value: unknown, fallback: string): string {
    if (value === undefined || value === null || value === '') return fallback
    return String(value)
  }
}

/**
 * Wraps a single text value into multiple SVG <tspan> elements.
 * Returns an empty string when the value is absent.
 * Use triple braces {{{$wrapText ...}}} in the SVG template to avoid HTML escaping.
 * If maxLines is provided and the wrapped text exceeds it, the last line is truncated with '...'.
 * Example: {{{$wrapText ($lookup $declaration 'burial.locationDescription') 50 190 301.831 14 3}}}
 */
export function $wrapText() {
  return function (
    text: unknown,
    boundary: number,
    x: number,
    y: number,
    lineHeight: number,
    maxLines?: number
  ): string {
    if (text === undefined || text === null || text === '') return ''
    let lines = wordWrap(String(text), boundary)
    if (typeof maxLines === 'number' && lines.length > maxLines) {
      lines = lines.slice(0, maxLines)
      lines[lines.length - 1] += '...'
    }
    return insertTspansIntoText(lines, x, y, lineHeight)
  }
}

/**
 * Combines two values with a separator (falling back to '-' for each absent value),
 * wraps the combined string, and returns multiple SVG <tspan> elements.
 * Use triple braces {{{$wrapCombined ...}}} in the SVG template to avoid HTML escaping.
 * If maxLines is provided and the wrapped text exceeds it, the last line is truncated with '...'.
 * Example: {{{$wrapCombined ($lookup $declaration 'deceased.placeOfMarriage') ($lookup $declaration 'deceased.dateOfMarriage') ', ' 50 190 512.831 14 3}}}
 */
export function $wrapCombined() {
  return function (
    val1: unknown,
    val2: unknown,
    separator: string,
    boundary: number,
    x: number,
    y: number,
    lineHeight: number,
    maxLines?: number
  ): string {
    const str1 =
      val1 !== undefined && val1 !== null && val1 !== '' ? String(val1) : '-'
    const str2 =
      val2 !== undefined && val2 !== null && val2 !== '' ? String(val2) : '-'
    const combined = str1 + separator + str2
    let lines = wordWrap(combined, boundary)
    if (typeof maxLines === 'number' && lines.length > maxLines) {
      lines = lines.slice(0, maxLines)
      lines[lines.length - 1] += '...'
    }
    return insertTspansIntoText(lines, x, y, lineHeight)
  }
}

/**
 * Converts a SCREAMING_SNAKE_CASE enum value to Title Case words.
 * Example: REGISTRAR_GENERAL → Registrar General
 * Returns '-' if the value is absent.
 */
export function $formatEnum() {
  return function (value: unknown): string {
    if (value === undefined || value === null || value === '') return '-'
    return String(value)
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }
}

/** console.logs available handlebar variables with the handlebar: {{debug}} */
export function debug(): Handlebars.HelperDelegate {
  return function (this: any, value: string) {
    // eslint-disable-next-line no-console
    console.log(this)

    return value
  }
}
