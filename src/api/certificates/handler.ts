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

import { Event } from '@countryconfig/form/types/types'
import { Request, ResponseToolkit } from '@hapi/hapi'

type FontFamilyTypes = {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}
export interface ICertificateConfigData {
  id: string
  event: Event
  label: {
    id: string
    defaultMessage: string
    description: string
  }
  isDefault: boolean
  fee: {
    onTime: number
    late: number
    delayed: number
  }
  svgUrl: string
  fonts?: Record<string, FontFamilyTypes>
}

export async function certificateHandler(request: Request, h: ResponseToolkit) {
  if (request.params.id) {
    const filePath = `${__dirname}/source/${request.params.id}`
    return h.file(filePath)
  }
  const certificateConfigs: ICertificateConfigData[] = [
    {
      id: 'birth-certificate',
      event: Event.Birth,
      label: {
        id: 'certificates.birth.certificate',
        defaultMessage: 'Birth Certificate',
        description: 'The label for a birth certificate'
      },
      isDefault: true,
      fee: {
        onTime: 5,
        late: 7,
        delayed: 15
      },
      svgUrl: '/api/countryconfig/certificates/birth-certificate.svg',
      fonts: {
        'Libre Baskerville': {
          normal: '/api/countryconfig/fonts/LibreBaskerville-Regular.ttf',
          bold: '/api/countryconfig/fonts/LibreBaskerville-Bold.ttf',
          italics: '/api/countryconfig/fonts/LibreBaskerville-Italic.ttf',
          bolditalics: '/api/countryconfig/fonts/LibreBaskerville-Regular.ttf'
        }
      }
    },
    {
      id: 'birth-certificate-certified-copy',
      event: Event.Birth,
      label: {
        id: 'certificates.birth.certificate.copy',
        defaultMessage: 'Birth Certificate certified copy',
        description: 'The label for a birth certificate'
      },
      isDefault: false,
      fee: {
        onTime: 0,
        late: 11.5,
        delayed: 17
      },
      svgUrl:
        '/api/countryconfig/certificates/birth-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'death-certificate',
      event: Event.Death,
      label: {
        id: 'certificates.death.certificate',
        defaultMessage: 'Death Certificate',
        description: 'The label for a death certificate'
      },
      isDefault: true,
      fee: {
        onTime: 3,
        late: 5.7,
        delayed: 12
      },
      svgUrl: '/api/countryconfig/certificates/death-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'death-certificate-certified-copy',
      event: Event.Death,
      label: {
        id: 'certificates.death.certificate.copy',
        defaultMessage: 'Death Certificate certified copy',
        description: 'The label for a death certificate'
      },
      isDefault: false,
      fee: {
        onTime: 0,
        late: 9,
        delayed: 14.5
      },
      svgUrl:
        '/api/countryconfig/certificates/death-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'marriage-certificate',
      event: Event.Marriage,
      label: {
        id: 'certificates.marriage.certificate',
        defaultMessage: 'Marriage Certificate',
        description: 'The label for a marriage certificate'
      },
      isDefault: true,
      fee: {
        onTime: 4.4,
        late: 6,
        delayed: 13.5
      },
      svgUrl: '/api/countryconfig/certificates/marriage-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'marriage-certificate-certified-copy',
      event: Event.Marriage,
      label: {
        id: 'certificates.marriage.certificate.copy',
        defaultMessage: 'Marriage Certificate certified copy',
        description: 'The label for a marriage certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/marriage-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'v2.birth-certificate',
      event: Event.V2_BIRTH,
      label: {
        id: 'certificates.birth.certificate',
        defaultMessage: 'Birth Certificate copy',
        description: 'The label for a birth certificate'
      },
      isDefault: true,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl: '/api/countryconfig/certificates/v2.birth-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'v2.birth-certified-certificate',
      event: Event.V2_BIRTH,
      label: {
        id: 'certificates.birth.certificate.copy',
        defaultMessage: 'Birth Certificate certified copy',
        description: 'The label for a birth certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.birth-certificate-certified-copy.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'v2.tennis-club-membership-certificate',
      event: Event.TENNIS_CLUB_MEMBERSHIP,
      label: {
        id: 'certificates.tennis-club-membership.certificate.copy',
        defaultMessage: 'Tennis Club Membership Certificate copy',
        description: 'The label for a tennis-club-membership certificate'
      },
      isDefault: true,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.tennis-club-membership-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    },
    {
      id: 'v2.tennis-club-membership-certified-certificate',
      event: Event.TENNIS_CLUB_MEMBERSHIP,
      label: {
        id: 'certificates.tennis-club-membership.certificate.certified-copy',
        defaultMessage: 'Tennis Club Membership Certificate certified copy',
        description: 'The label for a tennis-club-membership certificate'
      },
      isDefault: false,
      fee: {
        onTime: 7,
        late: 10.6,
        delayed: 18
      },
      svgUrl:
        '/api/countryconfig/certificates/v2.tennis-club-membership-certified-certificate.svg',
      fonts: {
        'Noto Sans': {
          normal: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bold: '/api/countryconfig/fonts/NotoSans-Bold.ttf',
          italics: '/api/countryconfig/fonts/NotoSans-Regular.ttf',
          bolditalics: '/api/countryconfig/fonts/NotoSans-Regular.ttf'
        }
      }
    }
  ]
  return certificateConfigs
}
