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

import { Request, ResponseToolkit } from '@hapi/hapi'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function certificateHandler(request: Request, h: ResponseToolkit) {
  if (request.params.event) {
    const res = readFileSync(
      `./src/api/certificates/source/Madagascar-${request.params.event}-certificate.svg`
    )
      .toString()
      .replace(
        '{{certificateLogo}}',
        `data:image/png;base64,${readFileSync(
          join(__dirname, './source/Madagascar-logo.png'),
          {
            encoding: 'base64'
          }
        )}`
      )

    return h.response(res).code(200)
  }

  const Certificates = [
    {
      event: 'birth',
      fileName: 'Madagascar-birth-certificate.svg',
      svgCode: readFileSync(
        './src/api/certificates/source/Madagascar-birth-certificate.svg'
      )
        .toString()
        .replace(
          '{{certificateLogo}}',
          `data:image/png;base64,${readFileSync(
            join(__dirname, './source/Madagascar-logo.png'),
            {
              encoding: 'base64'
            }
          )}`
        )
    },
    {
      event: 'death',
      fileName: 'Madagascar-death-certificate.svg',
      svgCode: readFileSync(
        './src/api/certificates/source/Madagascar-death-certificate.svg'
      ).toString()
    },
    {
      event: 'marriage',
      fileName: 'Madagascar-marriage-certificate.svg',
      svgCode: readFileSync(
        './src/api/certificates/source/Madagascar-marriage-certificate.svg'
      ).toString()
    }
  ]

  const res = JSON.stringify(Certificates)
  return h.response(res)
}
