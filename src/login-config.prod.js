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
window.config = {
  AUTH_API_URL: 'https://gateway.{{hostname}}/auth/',
  CONFIG_API_URL: 'https://config.{{hostname}}',
  // Country code in uppercase ALPHA-3 format
  COUNTRY: 'FAR',
  LANGUAGES: 'en,fr',
  AVAILABLE_LANGUAGES_SELECT: 'en:English,fr:Français',
  CLIENT_APP_URL: 'https://register.{{hostname}}/',
  COUNTRY_CONFIG_URL: 'https://countryconfig.{{hostname}}',
  SENTRY: '{{sentry}}',
  LOGROCKET: ''
}
