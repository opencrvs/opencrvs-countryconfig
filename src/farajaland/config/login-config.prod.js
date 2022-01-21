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
window.config = {
  AUTH_API_URL: 'https://auth.{{hostname}}/',
  COUNTRY: 'FAR',
  LANGUAGES: 'en',
  CLIENT_APP_URL: 'https://register.{{hostname}}/',
  PHONE_NUMBER_PATTERN: {
    pattern: /^0(7|9)[0-9]{1}[0-9]{7}$/,
    example: '0970545855',
    start: '0[7|9]',
    num: '10',
    mask: {
      // ex: 0970****55
      startForm: 4,
      endBefore: 2
    }
  },
  SENTRY: 'https://f892d643aab642108f44e2d1795706bc@sentry.io/1774604',
  LOGROCKET: 'opencrvs-foundation/opencrvs-farajaland',
  PHONE_NUMBER_PATTERN: {
    pattern: /^0(7|9)[0-9]{1}[0-9]{7}$/,
    example: '0970545855',
    start: '0[7|9]',
    num: '10',
    mask: {
      // ex: +683*****23
      startForm: 4,
      endBefore: 2
    }
  }
}
