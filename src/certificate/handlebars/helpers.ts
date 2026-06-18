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
