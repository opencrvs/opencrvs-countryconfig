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
import { FHIR_URL } from '@countryconfig/constants'
import fetch from 'node-fetch'
import { generateLocationResource } from '@countryconfig/features/administrative/scripts/service'
import { ILocation } from '@countryconfig/features/utils'
import { merge } from 'lodash'

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getLocations(): Promise<ILocationDataResponse> {
  const res = await fetch(`${FHIR_URL}/Location?type=ADMIN_STRUCTURE&_count=0`)
  const locationBundle = await res.json()
  const locations = {
    data: locationBundle.entry.reduce(
      (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
        if (!entry.resource || !entry.resource.id) {
          throw new Error('Resource in entry not valid')
        }

        accumulator[entry.resource.id] = generateLocationResource(
          entry.resource as fhir.Location
        )

        return accumulator
      },
      {}
    )
  }

  return locations
}

const STATISTIC_EXTENSION_URLS = [
  'http://opencrvs.org/specs/id/statistics-male-populations',
  'http://opencrvs.org/specs/id/statistics-female-populations',
  'http://opencrvs.org/specs/id/statistics-total-populations',
  'http://opencrvs.org/specs/id/statistics-male-female-ratios',
  'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
]

type StatisticsExtension = { valueString: string; url: string }

type BundleEntryWithLocation = Omit<fhir.BundleEntry, 'resource'> & {
  resource: fhir.Location
}

export async function getStatistics() {
  const res = await fetch(`${FHIR_URL}/Location?type=ADMIN_STRUCTURE&_count=0`)
  const locationBundle: fhir.Bundle = await res.json()
  if (!locationBundle.entry) {
    throw new Error('Received invalid FHIR location bundle')
  }

  const locations = locationBundle.entry
    .filter((entry: fhir.BundleEntry): entry is BundleEntryWithLocation => {
      if (!entry.resource || !entry.resource.id) {
        throw new Error('Resource in entry not valid')
      }
      return Boolean((entry.resource as fhir.Location | undefined)?.extension)
    })
    .map((entry: BundleEntryWithLocation) => {
      /*
       * This parses the format we store statistics in FHIR into a more API-consumer friendly format
       */

      const statistics = {}

      entry.resource.extension
        ?.filter((ext): ext is StatisticsExtension =>
          STATISTIC_EXTENSION_URLS.includes(ext.url)
        )
        .forEach(item => {
          const values: Array<{ [year: string]: number }> = JSON.parse(
            item.valueString
          )

          statistics[item.url] = merge.apply(null, values)
        })

      return {
        id: entry.resource.id,
        statistics
      }
    })
    .filter(({ statistics }) => Object.keys(statistics).length > 0)

  return locations
}
