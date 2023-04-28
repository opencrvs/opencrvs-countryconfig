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
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'
import { readFileSync } from 'fs'

enableFetchMocks()

fetchMock.mockIf(
  (req) => req.url.endsWith('.well-known'),
  readFileSync('./test/cert.key.pub').toString()
)

process.env.NODE_ENV = 'development'
