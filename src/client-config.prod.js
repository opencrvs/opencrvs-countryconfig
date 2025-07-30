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
const scheme = window.location.protocol // "http:" or "https:"
const hostname = '{{hostname}}' // Replace dynamically if needed
const sentry = '{{sentry}}' // Replace dynamically if needed

window.config = {
  API_GATEWAY_URL: `${scheme}//gateway.${hostname}/`,
  CONFIG_API_URL: `${scheme}//config.${hostname}`,
  LOGIN_URL: `${scheme}//login.${hostname}`,
  AUTH_URL: `${scheme}//gateway.${hostname}/auth/`,
  MINIO_URL: `${scheme}//minio.${hostname}/ocrvs/`,
  MINIO_BASE_URL: `${scheme}//minio.${hostname}`, // URL without path/bucket information, used for file uploads, v2
  MINIO_BUCKET: 'ocrvs',
  COUNTRY_CONFIG_URL: `${scheme}//countryconfig.${hostname}`,
  // Country code in uppercase ALPHA-3 format
  COUNTRY: 'FAR',
  LANGUAGES: 'en,fr',
  SENTRY: sentry,
  LEADERBOARDS_DASHBOARD_URL: `${scheme}//metabase.${hostname}/public/dashboard/acae0527-74be-4804-a3ee-f8b3c9c8784c#bordered=false&titled=false&refresh=300`,
  REGISTRATIONS_DASHBOARD_URL: `${scheme}//metabase.${hostname}/public/dashboard/fec78656-e4f9-4b51-b540-0fed81dbd821#bordered=false&titled=false&refresh=300`,
  STATISTICS_DASHBOARD_URL: `${scheme}//metabase.${hostname}/public/dashboard/a17e9bc0-15a2-4bd1-92fa-ab0f346227ca#bordered=false&titled=false&refresh=300`,
  FEATURES: {}
}
