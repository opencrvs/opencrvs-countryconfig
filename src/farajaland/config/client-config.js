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
  API_GATEWAY_URL: 'http://localhost:7070/',
  BACKGROUND_SYNC_BROADCAST_CHANNEL: 'backgroundSynBroadCastChannel',
  COUNTRY: 'FAR',
  COUNTRY_LOGO_FILE: 'logo.png',
  COUNTRY_LOGO_RENDER_WIDTH: 104, // in px
  COUNTRY_LOGO_RENDER_HEIGHT: 104, // in px
  DESKTOP_TIME_OUT_MILLISECONDS: 900000, // 15 mins
  HEALTH_FACILITY_FILTER: 'DISTRICT',
  LANGUAGES: 'en',
  LOGIN_URL: 'http://localhost:3020',
  AUTH_URL: 'http://localhost:4040',
  COUNTRY_CONFIG_URL: 'http://localhost:3040',
  SHOW_FARAJALAND_IN_COUNTRY_LISTS: true,
  CERTIFICATE_PRINT_CHARGE_FREE_PERIOD: 36500, // 100 years =  (100 * 365) days
  CERTIFICATE_PRINT_CHARGE_UP_LIMIT: 36500, // 100 years =  (100 * 365) days
  CERTIFICATE_PRINT_LOWEST_CHARGE: 0,
  CERTIFICATE_PRINT_HIGHEST_CHARGE: 0,
  UI_POLLING_INTERVAL: 5000,
  FIELD_AGENT_AUDIT_LOCATIONS: 'DISTRICT',
  APPLICATION_AUDIT_LOCATIONS: 'DISTRICT',
  INFORMANT_MINIMUM_AGE: 16, // Minimum age to be able to register for a birth or death event
  HIDE_EVENT_REGISTER_INFORMATION: false, // this flag will decide whether to hide info form at the beginning of each event registration or not
  EXTERNAL_VALIDATION_WORKQUEUE: false, // this flag will decide whether to show external validation workqueue on registrar home
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
  },
  NID_NUMBER_PATTERN: {
    pattern: /^[0-9]{9}$/,
    example: '4837281940',
    num: '9'
  }
}
