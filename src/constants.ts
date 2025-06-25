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
import { env } from './environment'

export const TEST_SOURCE = `${process.cwd()}/src/tests/`
export const DEFAULT_TIMEOUT = 600000
export const SEVEN_DAYS_IN_MILISECOND = 1000 * 60 * 60 * 24 * 7

export const DOMAIN = env.DOMAIN
export const GATEWAY_URL = env.GATEWAY_URL
export const LOGIN_URL = env.LOGIN_URL
export const CLIENT_APP_URL = env.CLIENT_APP_URL
export const FHIR_URL = env.FHIR_URL

export const COUNTRY_CONFIG_HOST = env.COUNTRY_CONFIG_HOST
export const COUNTRY_CONFIG_PORT = env.COUNTRY_CONFIG_PORT
export const AUTH_URL = env.AUTH_URL
export const COUNTRY_CONFIG_URL = env.COUNTRY_CONFIG_URL
export const APPLICATION_CONFIG_URL = env.APPLICATION_CONFIG_URL

export const SENTRY_DSN = env.SENTRY_DSN
export const CHECK_INVALID_TOKEN = env.CHECK_INVALID_TOKEN

export const PRODUCTION = env.isProd
export const QA_ENV = env.QA_ENV
