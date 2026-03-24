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

/**
 * Pure CSV utilities with no environment variable dependencies.
 * Safe to import from standalone scripts that run outside the Hapi server context.
 */

import csv2json from 'csv2json'
import { createReadStream } from 'fs'

export type HumdataLocation = {
  admin0Pcode: string
  admin0Name_en: string
  admin0Name_alias?: string

  admin1Pcode?: string
  admin1Name_en?: string
  admin1Name_alias?: string

  admin2Pcode?: string
  admin2Name_en?: string
  admin2Name_alias?: string

  admin3Pcode?: string
  admin3Name_en?: string
  admin3Name_alias?: string

  admin4Pcode?: string
  admin4Name_en?: string
  admin4Name_alias?: string
}

export type FacilityRow = {
  id: string
  name: string
  partOf: string
  locationType: 'HEALTH_FACILITY' | 'CRVS_OFFICE'
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}
