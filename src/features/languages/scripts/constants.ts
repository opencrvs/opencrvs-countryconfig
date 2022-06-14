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

import { SupportedLocaleConfig } from '@countryconfig/features/languages/scripts/contentfulImport'

// Create a spcae on contentful and create the locales you require, tnen export a template using the contentful cli like this:

// contentful space export --space-id=<your-contentful-space-id>

// Copy the information into the values below

export const SPACE_ID = ''
export const USER_ID = ''

export const SUPPORTED_LOCALES: SupportedLocaleConfig[] = [
  {
    id: '',
    name: 'English (United States)',
    code: 'en-US',
    fallbackCode: 'bn-BD'
  }
  // Add more locales to suit your requirements and contentful plan
]
