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
import { readFileSync } from 'fs'
export const HOST = process.env.HOST || '0.0.0.0'
export const PORT = process.env.PORT || 8060
export const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY
  ? readFileSync(process.env.TELEGRAM_API_KEY).toString()
  : ''
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) || '.secrets/public-key.pem'
export const MEDIATOR_URL = process.env.MEDIATOR_URL || 'http://localhost:8050/'
