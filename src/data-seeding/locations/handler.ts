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
import {
  extractStatisticsMap,
  getStatistics,
  LocationStatistic
} from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'
import { HumdataLocation, FacilityRow, readCSVToJSON } from './csv-helpers'

type Location = {
  id: string
  name: string
  alias: string
  partOf: string
  locationType: 'ADMIN_STRUCTURE' | 'HEALTH_FACILITY' | 'CRVS_OFFICE'
  jurisdictionType?: (typeof JURISDICTION_TYPE)[number]
  statistics?: LocationStatistic['years']
}

const JURISDICTION_TYPE = [
  'STATE',
  'DISTRICT',
  'LOCATION_LEVEL_3',
  'LOCATION_LEVEL_4',
  'LOCATION_LEVEL_5'
] as const

export async function locationsHandler(_: Request, h: ResponseToolkit) {
  const [humdataLocations, crvsLocations, statistics] = await Promise.all([
    readCSVToJSON<HumdataLocation[]>(
      './src/data-seeding/locations/source/administrative-areas.csv'
    ),
    readCSVToJSON<FacilityRow[]>(
      './src/data-seeding/locations/source/locations.csv'
    ),
    getStatistics()
  ])
  const locations = new Map<string, Location>()
  const statisticsMap = extractStatisticsMap(statistics)
  humdataLocations.forEach((humdataLocation) => {
    ;([1, 2, 3, 4] as const).forEach((locationLevel) => {
      const id = humdataLocation[`admin${locationLevel}Pcode`]
      if (id) {
        const nonEmptyLevels = ([1, 2, 3, 4] as const)
          .slice(0, locationLevel)
          .filter((l) => humdataLocation[`admin${l}Pcode`])
        const depth = nonEmptyLevels.length
        const parentPcode = nonEmptyLevels[depth - 2]
        const partOf = parentPcode
          ? `Location/${humdataLocation[`admin${parentPcode}Pcode`]}`
          : 'Location/0'

        locations.set(id, {
          id,
          name: humdataLocation[`admin${locationLevel}Name_en`]!,
          alias: humdataLocation[`admin${locationLevel}Name_alias`]!,
          partOf,
          locationType: 'ADMIN_STRUCTURE',
          jurisdictionType: JURISDICTION_TYPE[depth - 1],
          statistics: statisticsMap.get(id)?.years
        })
      }
    })
  })
  crvsLocations.forEach((crvsLocation) => {
    locations.set(crvsLocation.id, {
      ...crvsLocation,
      // We haven't set aliases for the facilities in farajaland
      // that's why just using the name instead
      alias: crvsLocation.name
    })
  })
  return h.response(Array.from(locations.values()))
}
