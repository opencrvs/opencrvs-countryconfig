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
  API_GATEWAY_URL: 'http://localhost:7070/',
  CONFIG_API_URL: 'http://localhost:2021',
  LOGIN_URL: 'http://localhost:3020',
  AUTH_URL: 'http://localhost:7070/auth/',
  MINIO_BUCKET: 'ocrvs',
  MINIO_URL: 'http://localhost:3535/ocrvs/',
  COUNTRY_CONFIG_URL: 'http://localhost:3040',
  // Country code in uppercase ALPHA-3 format
  COUNTRY: 'FAR',
  LANGUAGES: 'en,fr',
  SENTRY: '',
  // Use the values in comments when Metabase is running locally
  // http://localhost:4444/public/dashboard/acae0527-74be-4804-a3ee-f8b3c9c8784c#bordered=false&titled=false&refresh=300
  LEADERBOARDS_DASHBOARD_URL: '',
  // http://localhost:4444/public/dashboard/fec78656-e4f9-4b51-b540-0fed81dbd821#bordered=false&titled=false&refresh=300
  REGISTRATIONS_DASHBOARD_URL: '',
  // http://localhost:4444/public/dashboard/a17e9bc0-15a2-4bd1-92fa-ab0f346227ca#bordered=false&titled=false&refresh=300
  STATISTICS_DASHBOARD_URL: '',
  FEATURES: {
    // The V2_EVENTS variable is passed down from src/index.ts:309
    V2_EVENTS: {{ V2_EVENTS }}
  }
}
