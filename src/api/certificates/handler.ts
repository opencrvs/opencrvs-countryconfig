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

export async function certificateHandler(request: Request, h: ResponseToolkit) {
  if (request.params.event) {
    const res = readFileSync(
      `./src/api/certificates/source/Farajaland-${request.params.event}-certificate-v2.svg`
    ).toString()
    return h.response(res).code(200)
  }
  return [
    {
      id: 'birth.certificate',
      event: 'birth',
      label: {
        id: 'certificates.birth.certificate',
        defaultMessage: 'Birth Certificate',
        description: 'The label for a birth certificate'
      },
      svgUrl: '/certificates/birth-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/fonts/NotoSans-Regular.ttf',
          bold: '/fonts/NotoSans-Bold.ttf',
          italics: '/fonts/NotoSans-Regular.ttf',
          bolditalics: '/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'birth.certificate.copy',
      event: 'birth',
      label: {
        id: 'certificates.birth.certificate.copy',
        defaultMessage: 'Birth Certificate certified copy',
        description: 'The label for a birth certificate'
      },
      svgUrl: '/certificates/birth-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/fonts/NotoSans-Regular.ttf',
          bold: '/fonts/NotoSans-Bold.ttf',
          italics: '/fonts/NotoSans-Regular.ttf',
          bolditalics: '/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'death.certificate',
      event: 'death',
      label: {
        id: 'certificates.death.certificate',
        defaultMessage: 'Death Certificate',
        description: 'The label for a death certificate'
      },
      svgUrl: '/certificates/death-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/fonts/NotoSans-Regular.ttf',
          bold: '/fonts/NotoSans-Bold.ttf',
          italics: '/fonts/NotoSans-Regular.ttf',
          bolditalics: '/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'death.certificate.copy',
      event: 'death',
      label: {
        id: 'certificates.death.certificate.copy',
        defaultMessage: 'Death Certificate certified copy',
        description: 'The label for a death certificate'
      },
      svgUrl: '/certificates/death-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/fonts/NotoSans-Regular.ttf',
          bold: '/fonts/NotoSans-Bold.ttf',
          italics: '/fonts/NotoSans-Regular.ttf',
          bolditalics: '/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'marriage.certificate',
      event: 'marriage',
      label: {
        id: 'certificates.marriage.certificate',
        defaultMessage: 'Marriage Certificate',
        description: 'The label for a marriage certificate'
      },
      svgUrl: '/certificates/marriage-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/fonts/NotoSans-Regular.ttf',
          bold: '/fonts/NotoSans-Bold.ttf',
          italics: '/fonts/NotoSans-Regular.ttf',
          bolditalics: '/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'marriage.certificate.copy',
      event: 'marriage',
      label: {
        id: 'certificates.marriage.certificate.copy',
        defaultMessage: 'Marriage Certificate certified copy',
        description: 'The label for a marriage certificate'
      },
      svgUrl: '/certificates/marriage-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/fonts/NotoSans-Regular.ttf',
          bold: '/fonts/NotoSans-Bold.ttf',
          italics: '/fonts/NotoSans-Regular.ttf',
          bolditalics: '/fonts/NotoSans-Regular.ttf'
        }
      }
    }
  ]
}
