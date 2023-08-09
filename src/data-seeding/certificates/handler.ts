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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { readFileSync } from 'fs'

export async function certificateHandler(_: Request, h: ResponseToolkit) {
  const Certificates = [
    {
      event: 'birth',
      fileName: 'farajaland-birth-certificate-v1.svg',
      svgCode: readFileSync(
        './src/data-seeding/certificates/source/BirthCertificate.svg'
      ).toString()
    },
    {
      event: 'death',
      fileName: 'farajaland-death-certificate-v1.svg',
      svgCode: readFileSync(
        './src/data-seeding/certificates/source/DeathCertificate.svg'
      ).toString()
    },
    {
      event: 'marriage',
      fileName: 'farajaland-marriage-certificate-v1.svg',
      svgCode: readFileSync(
        './src/data-seeding/certificates/source/MarriageCertificate.svg'
      ).toString()
    }
  ]
  const res = JSON.stringify(Certificates)
  return h.response(res)
}
