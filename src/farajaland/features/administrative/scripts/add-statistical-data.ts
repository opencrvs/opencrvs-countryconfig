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
import chalk from 'chalk'
import { getFromFhir } from '../../utils'
import { getStatistics, LocationStatistic } from '../statistics'
import fetch from 'node-fetch'
import { FHIR_URL } from '../../../constants'
async function getLocationsByIdentifier(identifier: string) {
  const locationSearchResult = await getFromFhir(
    `/Location/?identifier=${identifier}&_count=0`
  )

  return (
    (locationSearchResult &&
      locationSearchResult.entry &&
      locationSearchResult.entry.map(
        (locationEntry: fhir.BundleEntry) =>
          locationEntry.resource as fhir.Location
      )) ||
    []
  )
}

function generateStatisticalExtensions(sourceStatistic: LocationStatistic) {
  const malePopulations = []
  const femalePopulations = []
  const totalPopulations = []
  const maleFemaleRatios = []
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
    maleFemaleRatios.push({
      [year.year]: year.male_female_ratio
    })
    birthRates.push({
      [year.year]: year.crude_birth_rate
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
      url: 'http://opencrvs.org/specs/id/statistics-male-female-ratios',
      valueString: JSON.stringify(maleFemaleRatios)
    },
    {
      url: 'http://opencrvs.org/specs/id/statistics-crude-birth-rates',
      valueString: JSON.stringify(birthRates)
    }
  ]
  return extensions
}

export async function matchAndAssignStatisticalData(
  fhirLocations: fhir.Location[],
  statistics: LocationStatistic[]
) {
  const locationsWithStatistics: fhir.Location[] = []

  for (const location of fhirLocations) {
    const matchingStatistics = statistics.find(
      stat => location.name === stat.name
    )
    if (!matchingStatistics) {
      // tslint:disable-next-line:no-console
      console.log(
        `${chalk.red('Warning:')} No statistics can be found that matches: ${
          location.name
        }`
      )
    } else {
      const statisticalExtensions = generateStatisticalExtensions(
        matchingStatistics
      )

      const statisticsKeys = statisticalExtensions.map(
        extension => extension.url
      )

      if (!location.extension) {
        location.extension = []
      }
      location.extension = [
        ...location.extension.filter(
          ({ url }) => !statisticsKeys.includes(url)
        ),
        ...statisticalExtensions
      ]
      locationsWithStatistics.push(location)
    }
  }
  return locationsWithStatistics
}

const sendToFhir = (doc: fhir.Location, suffix: string, method: string) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    body: JSON.stringify(doc),
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response
    })
    .catch(error => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}

async function addStatisticalData() {
  const statistics = await getStatistics()
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// UPDATING LOCATIONS WITH STATISTICAL DATA IN FHIR ///////////////////////////'
    )}`
  )

  const locations = await getLocationsByIdentifier('DISTRICT').catch(err => {
    console.log("Couldn't fetch locations", err)
    throw err
  })

  console.log(locations)

  const stats = {
    districts: await matchAndAssignStatisticalData(locations, statistics)
  }

  for (const location of stats.districts) {
    // tslint:disable-next-line:no-console
    console.log(`Updating location: ${location.id}`)
    await sendToFhir(location, `/Location/${location.id}`, 'PUT')
  }
}

addStatisticalData()
