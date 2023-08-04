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
  API_GATEWAY_URL: 'https://gateway.{{hostname}}/',
  CONFIG_API_URL: 'https://config.{{hostname}}',
  LOGIN_URL: 'https://login.{{hostname}}',
  AUTH_URL: 'https://auth.{{hostname}}',
  MINIO_BUCKET: 'ocrvs',
  COUNTRY_CONFIG_URL: 'https://countryconfig.{{hostname}}',
  USER_NOTIFICATION_DELIVERY_METHOD: 'sms', // 'email'
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: 'email',
  // Country code in uppercase ALPHA-3 format
  COUNTRY: 'FAR',
  AVAILABLE_LANGUAGES_SELECT: 'en:English,fr:Français',
  LANGUAGES: 'en,fr',
  SENTRY:
    'https://f892d643aab642108f44e2d1795706bc@o309867.ingest.sentry.io/1774604',
  LOGROCKET: '',
  LEADERBOARDS_DASHBOARD_URL:
    'https://metabase.{{hostname}}/public/dashboard/acae0527-74be-4804-a3ee-f8b3c9c8784c#bordered=false&titled=false&refresh=300',
  REGISTRATIONS_DASHBOARD_URL:
    'https://metabase.{{hostname}}/public/dashboard/fec78656-e4f9-4b51-b540-0fed81dbd821#bordered=false&titled=false&refresh=300',
  STATISTICS_DASHBOARD_URL:
    'https://metabase.{{hostname}}/public/dashboard/a17e9bc0-15a2-4bd1-92fa-ab0f346227ca#bordered=false&titled=false&refresh=300'
}
