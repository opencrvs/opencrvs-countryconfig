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
import { bool, cleanEnv, port, str, url } from 'envalid'

export const env = cleanEnv(process.env, {
  DOMAIN: str({ devDefault: '*' }),
  GATEWAY_URL: url({ devDefault: 'http://localhost:7070' }),
  LOGIN_URL: url({ devDefault: 'http://localhost:3020/' }),
  CLIENT_APP_URL: url({ devDefault: 'http://localhost:3000/' }),
  FHIR_URL: url({ devDefault: 'http://localhost:3447/fhir' }),
  COUNTRY_CONFIG_HOST: str({ default: '0.0.0.0' }),
  COUNTRY_CONFIG_PORT: port({ default: 3040 }),
  AUTH_URL: url({ devDefault: 'http://localhost:4040' }),
  COUNTRY_CONFIG_URL: url({ devDefault: 'http://localhost:3040' }),
  APPLICATION_CONFIG_URL: url({ devDefault: 'http://localhost:2021/' }),
  SENTRY_DSN: str({ default: undefined }),
  CHECK_INVALID_TOKEN: bool({
    default: true,
    devDefault: false,
    desc: 'Check if the token has been invalidated in the auth service before it has expired'
  }),
  CONFIRM_REGISTRATION_URL: url({
    devDefault: 'http://localhost:5050/confirm/registration'
  }),
  QA_ENV: bool({ default: false }),
  ESIGNET_REDIRECT_URL: url({ devDefault: 'http://localhost:20260/authorize' }),
  OPENID_PROVIDER_CLIENT_ID: str({ devDefault: 'mock-client_id' }),
  OPENID_PROVIDER_CLAIMS: str({
    devDefault: 'name,family_name,given_name,middle_name,birthdate,address'
  }),
  MOSIP_API_USERINFO_URL: url({
    devDefault: 'http://localhost:2024/esignet/get-oidp-user-info'
  }),
  ADMIN_DATABASE_URL: url({
    devDefault: 'postgres://postgres:postgres@localhost:5432/events',
    desc: 'The Postgres superuser for your database. For country-config example, we are using the same database as events. Your country might want to set up a completely separate Postgres instance to have granular data access management'
  }),
  ANALYTICS_DATABASE_URL: url({
    devDefault:
      'postgres://events_analytics:analytics_password@localhost:5432/events',
    desc: 'The database URL for reads and writes to `analytics.events`. See `src/analytics/setup-database.ts` for how the example database is set up for your country.'
  }),
  ANALYTICS_DATABASE_PASSWORD: url({
    devDefault: 'analytics_password',
    desc: "The password for analytics user. This is not relevant if you 1) don't use analytics or 2) you set it up manually or with your infrastructure. In this country config example it is being set up on country-config start up."
  })
})
