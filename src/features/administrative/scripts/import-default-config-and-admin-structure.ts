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
import {
  composeAndSaveFhirLocation,
  getLocationPartOfIds
} from '@countryconfig/features/administrative/scripts/utils'
import chalk from 'chalk'
import { ICSVLocation, readCSVToJSON } from '@countryconfig/features/utils'
import populateDefaultConfig from '@countryconfig/features/config/scripts/populate-default-config'
import { cloneDeep } from 'lodash'

export default async function importAdminStructure() {
  let ADMIN_LEVELS: number = 0
  const fhirLocations: fhir.Location[] = []
  const locationLevelName = [
    'COUNTRY',
    'STATE',
    'DISTRICT',
    'LOCATION_LEVEL_3',
    'LOCATION_LEVEL_4',
    'LOCATION_LEVEL_5'
  ]
  const nameExpression = /^admin(\d+)name_en$/i
  const aliasExpression = /^admin(\d+)name_alias$/i

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// IMPORTING LOCATIONS FROM JSON AND SAVING TO FHIR ///////////////////////////'
    )}`
  )

  let rawLocations: any = await readCSVToJSON(process.argv[2])

  rawLocations = rawLocations.map((location: {}) => {
    for (const key in location) {
      if (nameExpression.exec(key)) {
        location[key.split('_')[0].toUpperCase()] = location[key]
        delete location[key]
      } else if (aliasExpression.exec(key)) {
        location[key.substring(0, 6).concat('alias').toUpperCase()] =
          location[key]
        delete location[key]
      } else {
        location[key.toUpperCase()] = location[key]
        delete location[key]
      }
    }
    return location
  })

  const locationHeaders = [...new Set(Object.keys(rawLocations[0]))]
  locationHeaders.map((header: string) => {
    const currentLevel = /^admin(\d+)/i.exec(header)
    if (currentLevel) {
      ADMIN_LEVELS < Number(currentLevel[1])
        ? (ADMIN_LEVELS = Number(currentLevel[1]))
        : ADMIN_LEVELS
    }
  })

  const LocationMap = new Map<
    string,
    {
      name: string
      alias: string
      locationLevel: number
      partOf: string
    }
  >()

  for (const location of rawLocations) {
    for (const key in location) {
      const currentLevel = /^admin(\d+)Pcode$/i.exec(key)
      if (currentLevel && !LocationMap.has(currentLevel[0])) {
        const nameKey = `ADMIN${currentLevel[1]}NAME`
        const aliasKey = `ADMIN${currentLevel[1]}ALIAS`
        let parentPcode = location[`ADMIN${Number(currentLevel[1]) - 1}PCODE`]
        if (!parentPcode) continue
        if (Number(currentLevel[1]) === 1) {
          parentPcode = 0
        }

        LocationMap.set(location[currentLevel[0]], {
          name: location[nameKey],
          alias: location[aliasKey],
          locationLevel: Number(currentLevel[1]),
          partOf: `Location/${parentPcode}`
        })
      }
    }
  }

  try {
    // eslint-disable-next-line no-console
    console.log(
      `${chalk.yellow('Fetching from LocationMap:')}. Please wait ....`
    )

    const csvLocations = Array.from(LocationMap, ([key, value]) => {
      return {
        statisticalID: key,
        name: value.name,
        alias: value.alias,
        locationLevel: value.locationLevel,
        partOf: value.partOf,
        code: 'ADMIN_STRUCTURE',
        physicalType: 'Jurisdiction'
      }
    })

    const filterLocationLevel = (
      csvLocations: (ICSVLocation & { locationLevel: number })[],
      locationLevel: number
    ) => {
      return (
        csvLocations
          .filter((csvLocation) => csvLocation.locationLevel === locationLevel)
          // eslint-disable-next-line no-unused-vars
          .map(({ locationLevel, ...rest }) => rest)
      )
    }

    let comparingLocations: fhir.Location[] = await composeAndSaveFhirLocation(
      filterLocationLevel(csvLocations, 1),
      'STATE'
    )
    for (
      let locationLevel = 2;
      locationLevel <= ADMIN_LEVELS;
      locationLevel++
    ) {
      const nextLevelLocations = await composeAndSaveFhirLocation(
        getLocationPartOfIds(
          filterLocationLevel(csvLocations, locationLevel),
          comparingLocations
        ),
        locationLevelName[locationLevel]
      )
      fhirLocations.push(...nextLevelLocations)
      comparingLocations = cloneDeep(nextLevelLocations)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err)
    process.exit(1)
  }

  populateDefaultConfig(ADMIN_LEVELS)

  return true
}

importAdminStructure()
