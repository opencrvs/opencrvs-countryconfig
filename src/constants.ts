/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
export const TEST_SOURCE = `${process.cwd()}/src/tests/`
export const HOSTNAME = process.env.HOSTNAME || '*'
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'
export const OPENHIM_URL =
  process.env.OPENHIM_URL || 'http://localhost:5001/fhir'
export const ORG_URL = 'http://opencrvs.org'
export const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost/user-mgnt'
  export const CONFIG_MONGO_URL =
    process.env.CONFIG_MONGO_URL || 'mongodb://localhost/application-config'
export const COUNTRY_CONFIG_HOST = process.env.COUNTRY_CONFIG_HOST || '0.0.0.0'
export const COUNTRY_CONFIG_PORT = process.env.COUNTRY_CONFIG_PORT || 3040
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const SENTRY_DSN = process.env.SENTRY_DSN

// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
// Send registration to BDRIS2 for validation before confirming registration
// This needs to be a string to make it easy to pass as an ENV var.
export const VALIDATE_IN_BDRIS2 = process.env.VALIDATE_IN_BDRIS2 || 'false'
export const CONFIRM_REGISTRATION_URL =
  process.env.CONFIRM_REGISTRATION_URL ||
  'http://localhost:5001/confirm/registration'
// This value is configured based on country's data
export const COUNTRY_WIDE_CRUDE_DEATH_RATE =
  process.env.COUNTRY_WIDE_CRUDE_DEATH_RATE || 6.633

  import * as path from 'path'
import { readFileSync } from 'fs'

export const LANGUAGES_SOURCE = path.join(
  process.cwd(),
  'src/features/languages/generated/'
)
export const ADMIN_STRUCTURE_SOURCE = path.join(
  process.cwd(),
  'src/features/administrative/'
)

export const FACILITIES_SOURCE = path.join(
  process.cwd(),
  'src/features/facilities/'
)

export const EMPLOYEES_SOURCE = path.join(
  process.cwd(),
  'src/features/employees/'
)

export const QUESTIONS_SOURCE = path.join(
  process.cwd(),
  'src/zmb/features/forms/'
)

export const CMS_API_KEY =
  process.env.CMS_API_KEY ||
  (process.env.CMS_API_KEY && readFileSync(process.env.CMS_API_KEY)) ||
  ''
export const CONTENTFUL_SPACE_ID =
  process.env.CONTENTFUL_SPACE_ID ||
  (process.env.CONTENTFUL_SPACE_ID &&
    readFileSync(process.env.CONTENTFUL_SPACE_ID)) ||
  ''
export const CMS = process.env.CMS // || 'contentful'
export const DEFAULT_TIMEOUT = 600000

