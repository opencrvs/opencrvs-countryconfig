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
import { PRODUCTION, QA_ENV } from '@countryconfig/constants'
import { roles } from './roles'
import { Request, ResponseToolkit } from '@hapi/hapi'

export async function rolesHandler(_: Request, h: ResponseToolkit) {
  if (!PRODUCTION || QA_ENV) {
    return roles.map((role) => {
      return {
        ...role,
        scopes: [...role.scopes, 'demo']
      }
    })
  }
  return h.response(roles)
}
