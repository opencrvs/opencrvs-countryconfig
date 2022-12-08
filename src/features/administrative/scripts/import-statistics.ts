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
import { getFromFhir, sendToFhir } from '../../utils'
import { getStatistics, LocationStatistic } from './utils'

async function getLocationByIdentifier(
  identifier: string
): Promise<fhir.Location> {
  const locationSearchResult = await getFromFhir(
    `/Location/?identifier=${identifier}`
  )
  const location: fhir.Location =
    locationSearchResult &&
    locationSearchResult.entry &&
    locationSearchResult.entry[0] &&
    locationSearchResult.entry[0].resource
  return location
}

function generateStatisticalExtensions(sourceStatistic: LocationStatistic) {
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

async function addStatisticalData() {
  const statistics = await getStatistics(process.argv[2])
  // eslint-disable-next-line no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// UPDATING LOCATIONS WITH STATISTICAL DATA IN FHIR ///////////////////////////'
    )}`
  )

  for (const statistic of statistics) {
    const location = await getLocationByIdentifier(
      `ADMIN_STRUCTURE_${String(statistic.statisticalID)}`
    ).catch((err) => {
      // eslint-disable-next-line no-console
      console.log("Couldn't fetch locations", err)
      throw err
    })
    if (!location) {
      // eslint-disable-next-line no-console
      console.log(
        `${chalk.red('Warning:')} No location can be found that matches: ${
          statistic.name
        }`
      )
    } else {
      const statisticalExtensions = generateStatisticalExtensions(statistic)

      const statisticsKeys = statisticalExtensions.map(
        (extension) => extension.url
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
      // eslint-disable-next-line no-console
      console.log(`Updating location: ${location.id}`)
      await sendToFhir(location, `/Location/${location.id}`, 'PUT')
    }
  }
}

addStatisticalData()
