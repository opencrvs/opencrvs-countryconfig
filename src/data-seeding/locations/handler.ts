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
  readCSVToJSON,
  extractStatisticsMap,
  getStatistics,
  LocationStatistic
} from '@countryconfig/utils'
import { Request, ResponseToolkit } from '@hapi/hapi'

type HumdataLocation = {
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

type Facility = {
  id: string
  name: string
  partOf: string
  locationType: 'HEALTH_FACILITY' | 'CRVS_OFFICE'
}

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
  const [humdataLocations, healthFacilities, crvsFacilities, statistics] =
    await Promise.all([
      readCSVToJSON<HumdataLocation[]>(
        './src/data-seeding/locations/source/locations.csv'
      ),
      readCSVToJSON<Facility[]>(
        './src/data-seeding/locations/source/health-facilities.csv'
      ),
      readCSVToJSON<Facility[]>(
        './src/data-seeding/locations/source/crvs-facilities.csv'
      ),
      getStatistics()
    ])
  const locations = new Map<string, Location>()
  const statisticsMap = extractStatisticsMap(statistics)
  humdataLocations.forEach((humdataLocation) => {
    ;([1, 2, 3, 4] as const).forEach((locationLevel) => {
      const id = humdataLocation[`admin${locationLevel}Pcode`]
      if (id) {
        locations.set(id, {
          id,
          name: humdataLocation[`admin${locationLevel}Name_en`]!,
          alias: humdataLocation[`admin${locationLevel}Name_alias`]!,
          partOf:
            locationLevel == 1
              ? 'Location/0'
              : `Location/${
                  humdataLocation[
                    `admin${(locationLevel - 1) as 1 | 2 | 3}Pcode`
                  ]
                }`,
          locationType: 'ADMIN_STRUCTURE',
          jurisdictionType: JURISDICTION_TYPE[locationLevel - 1],
          statistics: statisticsMap.get(id)?.years
        })
      }
    })
  })
  ;[...healthFacilities, ...crvsFacilities].forEach((healthFacility) => {
    locations.set(healthFacility.id, {
      ...healthFacility,
      // We haven't set aliases for the facilities in farajaland
      // that's why just using the name instead
      alias: healthFacility.name
    })
  })
  return h.response(Array.from(locations.values()))
}
