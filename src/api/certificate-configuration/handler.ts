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

import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'

type FontFamilyTypes = {
  normal: string
  bold: string
  italics: string
  bolditalics: string
}

type Configuration = Partial<{
  fonts: Record<string, FontFamilyTypes>
}>

export function certificateConfigurationHandler(): Configuration {
  return {
    fonts: {
      ['Noto Sans']: {
        normal: `${COUNTRY_CONFIG_URL}/fonts/NotoSans-Regular.ttf`,
        bold: `${COUNTRY_CONFIG_URL}/fonts/NotoSans-Bold.ttf`,
        italics: `${COUNTRY_CONFIG_URL}/fonts/NotoSans-Regular.ttf`,
        bolditalics: `${COUNTRY_CONFIG_URL}/fonts/NotoSans-Regular.ttf`
      }
    }
  }
}
