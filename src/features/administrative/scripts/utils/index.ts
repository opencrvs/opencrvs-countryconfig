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
  sendToFhir,
  ICSVLocation,
  titleCase,
  getFromFhir
} from '@countryconfig/features/utils'
import { ORG_URL } from '@countryconfig/constants'
import { join } from 'path'
import { readCSVToJSON } from '../../../utils'
import { Location } from '@countryconfig/scripts/validate-source-files'
import { z } from 'zod'
import { round, sumBy, meanBy } from 'lodash'

export const JURISDICTION_TYPE_IDENTIFIER = `${ORG_URL}/specs/id/jurisdiction-type`

const composeFhirLocation = (
  location: ICSVLocation,
  jurisdictionType: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/statistical-code`,
        value: `ADMIN_STRUCTURE_${String(location.statisticalID)}`
      },
      {
        system: `${ORG_URL}/specs/id/jurisdiction-type`,
        value: jurisdictionType
      }
    ],
    name: titleCase(location.name), // English name
    alias: location.alias ? [titleCase(location.alias)] : [], // Additional language name in element 0
    description: location.statisticalID,
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: location.partOf
    },
    type: {
      coding: [
        {
          system: `${ORG_URL}/specs/location-type`,
          code: 'ADMIN_STRUCTURE'
        }
      ]
    },
    physicalType: {
      coding: [
        {
          code: 'jdn',
          display: 'Jurisdiction'
        }
      ]
    },
    extension: [
      {
        url: 'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
        valueAttachment: {
          contentType: 'application/geo+json',
          data: '<base64>' // base64 encoded geoJSON feature object
        }
      }
    ]
  }
}

export async function composeAndSaveFhirLocation(
  rawLocationData: ICSVLocation[],
  jurisdictionType: string
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const csvLocation of rawLocationData) {
    const newLocation: fhir.Location = composeFhirLocation(
      csvLocation,
      jurisdictionType
    )

    const savedLocationResponse = await sendToFhir(
      newLocation,
      '/Location',
      'POST'
    ).catch(() => {
      throw Error('Cannot save location to FHIR')
    })
    const locationHeader = savedLocationResponse.headers.get(
      'location'
    ) as string
    newLocation.id = locationHeader.split('/')[3]
    locations.push(newLocation)
  }
  return locations
}

export function getLocationPartOfIds(
  rawLocationData: ICSVLocation[],
  states: fhir.Location[]
): ICSVLocation[] {
  const locations: ICSVLocation[] = []
  for (const csvLocation of rawLocationData) {
    const partOfStatisticalID = csvLocation.partOf.split('/')[1]
    const parentState = states.filter((state) => {
      return state.description === partOfStatisticalID
    })[0]
    csvLocation.partOf = `Location/${parentState.id}`
    locations.push(csvLocation)
  }
  return locations
}

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
    path = join(__dirname, '../../source/farajaland-statistics.csv')
  }
  const data = await readCSVToJSON<
    Array<Record<string, string> & { adminPcode: string }>
  >(path)

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

// eslint-disable-next-line no-unused-vars
type ErrorCallback = (_: { id: number; row: number; column: string }) => void
type LocationMap = Map<string, string>

export function extractLocationTree(
  locations: Array<z.infer<typeof Location>>,
  maxAdminLevel: number,
  errorCallback?: ErrorCallback
) {
  const locationMap: LocationMap = new Map()

  for (let i = 0; i < locations.length; i++) {
    const row = locations[i]

    for (let adminLevel = maxAdminLevel; adminLevel >= 0; adminLevel--) {
      const column = `admin${adminLevel}Pcode`
      const id = row[column]
      const parentColumn = `admin${adminLevel - 1}Pcode`

      if (!locationMap.get(id)) {
        locationMap.set(id, row[parentColumn])
      } else {
        if (row[parentColumn] !== locationMap.get(id) && errorCallback) {
          errorCallback({ id, row: i, column })
          return undefined
        }
      }
    }
  }

  return locationMap
}

export const extractMaxAdminLevel = (rawLocations: []) => {
  const csvLocationHeaders = [...new Set(rawLocations.flatMap(Object.keys))]
  let MAX_ADMIN_LEVEL: 0 | 1 | 2 | 3 | 4 = 0

  for (const header of csvLocationHeaders) {
    const currentLevel = /^admin(\d+)Pcode$/i.exec(header)
    if (currentLevel) {
      MAX_ADMIN_LEVEL < Number(currentLevel[1])
        ? (MAX_ADMIN_LEVEL = Number(currentLevel[1]) as any)
        : MAX_ADMIN_LEVEL
    }
  }

  return MAX_ADMIN_LEVEL
}

export const extractStatisticsMap = (statistics: LocationStatistic[]) => {
  const statisticsMap: Map<string, LocationStatistic> = new Map()
  for (const stat of statistics) {
    statisticsMap.set(stat.id, stat)
  }
  return statisticsMap
}

export function getChildLocations(
  parent: string,
  locationMap: Map<string, string>
) {
  const children: string[] = []
  for (const [location, parentLocation] of locationMap) {
    if (parent === parentLocation) {
      children.push(location)
    }
  }
  return children
}

export function generateStatisticalExtensions(
  sourceStatistic: LocationStatistic
) {
  const malePopulations = []
  const femalePopulations = []
  const totalPopulations = []
  const birthRates = []

  for (const year of sourceStatistic.years) {
    femalePopulations.push({
      [year.year]: year.female_population
    })
    malePopulations.push({
      [year.year]: year.male_population
    })
    totalPopulations.push({
      [year.year]: year.population
    })
    birthRates.push({
      [year.year]: year.crude_birth_rate / 2
    })
  }

  const extensions: fhir.Extension[] = [
    {
      url: 'http://opencrvs.org/specs/id/statistics-male-populations',
      valueString: JSON.stringify(malePopulations)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-female-populations',
      valueString: JSON.stringify(femalePopulations)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-total-populations',
      valueString: JSON.stringify(totalPopulations)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
      valueString: JSON.stringify(birthRates)
    }
  ]
  return extensions
}

export function mergeLocationStatistics(
  id: string,
  name: string,
  statistics: LocationStatistic[]
): LocationStatistic {
  const allUniqueYears = [
    ...new Set(
      statistics.flatMap((statistic) => statistic.years.map(({ year }) => year))
    )
  ]

  return {
    id,
    name,
    years: allUniqueYears.map((year) => {
      const currentYears = statistics
        .flatMap((statistic) => statistic.years)
        .filter((statisticYear) => statisticYear.year === year)

      return {
        year,
        population: round(sumBy(currentYears, 'population'), 3),
        male_population: round(sumBy(currentYears, 'male_population'), 3),
        female_population: round(sumBy(currentYears, 'female_population'), 3),
        crude_birth_rate: round(meanBy(currentYears, 'crude_birth_rate'), 3)
      }
    })
  }
}

export async function getLocationByIdentifier(
  identifier: string
): Promise<fhir.Location> {
  const locationSearchResult = await getFromFhir(
    `/Location/?identifier=${identifier}`
  )
  return locationSearchResult?.entry?.[0].resource
}
