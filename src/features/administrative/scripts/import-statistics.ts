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
import { readCSVToJSON, sendToFhir } from '@countryconfig/features/utils'
import { Location } from '@countryconfig/scripts/validate-source-files'
import { z } from 'zod'
import {
  extractLocationTree,
  extractMaxAdminLevel,
  extractStatisticsMap,
  generateStatisticalExtensions,
  getChildLocations,
  getLocationByIdentifier,
  getStatistics,
  mergeLocationStatistics
} from './utils'

async function addStatisticalData() {
  const stats = await getStatistics(process.argv[2])
  const rawLocations = (await readCSVToJSON(process.argv[3])) as Array<
    z.infer<typeof Location>
  >
  const maxAdminLevel = extractMaxAdminLevel(rawLocations as any)
  const locationMap = extractLocationTree(rawLocations as any, maxAdminLevel)!
  const statisticMap = extractStatisticsMap(stats)

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// UPDATING LOCATIONS WITH STATISTICAL DATA IN FHIR ///////////////////////////'
    )}`
  )

  const alreadyUpdatedLocations: string[] = []

  // adminLevel 0 doesn't need to be added as it's the country level
  // If it needs to be added in the future, amend the condition to be `adminLevel >= 0`
  for (let adminLevel = maxAdminLevel; adminLevel > 0; adminLevel--) {
    for (let i = 0; i < rawLocations.length; i++) {
      const column = `admin${adminLevel}Pcode`
      const location = rawLocations[i][column]!
      const name = rawLocations[i][`admin${adminLevel}Name_en`]!

      if (alreadyUpdatedLocations.includes(location)) {
        continue
      }

      let statisticsForLocation = statisticMap.get(location)
      if (!statisticsForLocation) {
        const children = getChildLocations(location, locationMap)
        const childrenStatistics = children.map(
          (child) => statisticMap.get(child)!
        )

        statisticsForLocation = mergeLocationStatistics(
          location,
          name,
          childrenStatistics
        )

        statisticMap.set(location, statisticsForLocation)
      }

      alreadyUpdatedLocations.push(location)
    }
  }

  for (const [, statistic] of statisticMap) {
    const location = await getLocationByIdentifier(
      `ADMIN_STRUCTURE_${String(statistic.id)}`
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
