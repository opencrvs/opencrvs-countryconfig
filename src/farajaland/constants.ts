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
import * as path from 'path'
import { readFileSync } from 'fs'
export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:3447/fhir'

export const LANGUAGES_SOURCE = path.join(
  process.cwd(),
  'src/farajaland/features/languages/generated/'
)
export const ADMIN_STRUCTURE_SOURCE = path.join(
  process.cwd(),
  'src/farajaland/features/administrative/'
)

export const FACILITIES_SOURCE = path.join(
  process.cwd(),
  'src/farajaland/features/facilities/'
)

export const EMPLOYEES_SOURCE = path.join(
  process.cwd(),
  'src/farajaland/features/employees/'
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
