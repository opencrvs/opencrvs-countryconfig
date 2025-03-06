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
  })
})
