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
import { readFileSync } from 'fs'
import * as jwt from 'jsonwebtoken'
import { createServer } from '@countryconfig/index'

describe('definitions handler tests', () => {
  let server: any

  beforeEach(async () => {
    server = await createServer()
  })

  it('returns definitions as json', async () => {
    const token = jwt.sign({}, readFileSync('./test/cert.key'), {
      algorithm: 'RS256',
      issuer: 'opencrvs:auth-service',
      audience: 'opencrvs:countryconfig-user'
    })

    const res = await server.server.inject({
      method: 'GET',
      url: '/definitions/register',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    expect(JSON.parse(res.payload)).toBeDefined()
  })
})
