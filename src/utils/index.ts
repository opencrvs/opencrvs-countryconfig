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

import fetch from 'node-fetch'
import { APPLICATION_CONFIG_URL } from '@countryconfig/constants'
import csv2json from 'csv2json'
import { createReadStream } from 'fs'
import fs from 'fs'
import { URL } from 'url'
import { build } from 'esbuild'
import { memoize } from 'lodash'
import { join } from 'path'
import { stringify } from 'csv-stringify/sync'

export interface ILocation {
  id?: string
  name?: string
  alias?: string
  status?: string
  address?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
  statistics: Array<{ name: string; year: number; value: number }>
}

interface ILoginBackground {
  backgroundColor: string
  backgroundImage: string
  imageFit: string
}
interface ICountryLogo {
  fileName: string
  file: string
}

export interface IApplicationConfig {
  APPLICATION_NAME: string
  COUNTRY: string
  COUNTRY_LOGO: ICountryLogo
  SENTRY: string
  LOGIN_BACKGROUND: ILoginBackground
  USER_NOTIFICATION_DELIVERY_METHOD: string
  INFORMANT_NOTIFICATION_DELIVERY_METHOD: string
}

export async function writeJSONToCSV(
  filename: string,
  data: Array<Record<string, any>>
) {
  const csv = stringify(data, {
    header: true
  })
  return fs.promises.writeFile(filename, csv, 'utf8')
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

export async function getApplicationConfig() {
  const configURL = new URL('publicConfig', APPLICATION_CONFIG_URL).toString()
  const res = await fetch(configURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const configData = (await res.json()) as {
    config: IApplicationConfig
  }
  return configData.config
}

export const buildTypeScriptToJavaScript = memoize(async (path: string) => {
  const result = await build({
    entryPoints: [path],
    write: false,
    loader: { '.ts': 'ts' },
    format: 'esm',
    platform: 'browser'
  })

  return result.outputFiles[0].text
})

type Year = {
  year: number
  male_population: number
  female_population: number
  population: number
  crude_birth_rate: number
}

export type LocationStatistic = {
  id: string
  name: string
  years: Year[]
}

export async function getStatistics(path?: string) {
  if (!path) {
    path = join(__dirname, '../data-seeding/locations/source/statistics.csv')
  }
  const data =
    await readCSVToJSON<Array<Record<string, string> & { adminPcode: string }>>(
      path
    )

  return data.map<LocationStatistic>((item) => {
    const { adminPcode, name, ...yearKeys } = item
    return {
      id: adminPcode,
      name,
      years: Object.keys(yearKeys)
        .map((key) => key.split('_').pop())
        .map(Number)
        .filter((value, index, list) => list.indexOf(value) == index)
        .map((year) => ({
          year,
          male_population: parseFloat(yearKeys[`male_population_${year}`]),
          female_population: parseFloat(yearKeys[`female_population_${year}`]),
          population: parseFloat(yearKeys[`population_${year}`]),
          crude_birth_rate: parseFloat(yearKeys[`crude_birth_rate_${year}`])
        }))
    }
  })
}

export const extractStatisticsMap = (statistics: LocationStatistic[]) => {
  const statisticsMap: Map<string, LocationStatistic> = new Map()
  for (const stat of statistics) {
    statisticsMap.set(stat.id, stat)
  }
  return statisticsMap
}

export function createCustomFieldHandlebarName(fieldId: string) {
  const fieldIdNameArray = fieldId.split('.').map((field, index) => {
    if (index !== 0) {
      return field.charAt(0).toUpperCase() + field.slice(1)
    } else {
      return field
    }
  })

  return `${fieldIdNameArray[0]}${fieldIdNameArray[1]}${
    fieldIdNameArray[fieldIdNameArray.length - 1]
  }`
}

export function uppercaseFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
