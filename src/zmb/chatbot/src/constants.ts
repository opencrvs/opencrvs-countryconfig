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
// import { readFileSync } from 'fs'
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
/*export const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY
  ? readFileSync(process.env.TELEGRAM_API_KEY).toString()
  : ''*/
export const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY || ''
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
export const MEDIATOR_URL = process.env.MEDIATOR_URL || 'http://localhost:8050/'
