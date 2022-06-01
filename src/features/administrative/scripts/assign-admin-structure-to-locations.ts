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
  fetchAndComposeLocations,
  getLocationPartOfIds,
  generateLocationResource
} from '@countryconfig/features/administrative/scripts/service'
import chalk from 'chalk'
import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@countryconfig/constants'
import { ILocation } from '@countryconfig/features/utils'

export default async function importAdminStructure() {
  let states: fhir.Location[]
  let districts: fhir.Location[]

  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// IMPORTING LOCATIONS FROM JSON AND SAVING TO FHIR ///////////////////////////'
    )}`
  )

  const rawStates = JSON.parse(
    fs
      .readFileSync(`${ADMIN_STRUCTURE_SOURCE}generated/sourceStates.json`)
      .toString()
  )

  const rawDistricts = JSON.parse(
    fs
      .readFileSync(`${ADMIN_STRUCTURE_SOURCE}generated/sourceDistricts.json`)
      .toString()
  )

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from JSON:')} states. Please wait ....`
    )
    states = await fetchAndComposeLocations(rawStates, 'STATE')
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  try {
    // tslint:disable-next-line:no-console
    console.log(
      `${chalk.yellow('Fetching from JSON:')} districts. Please wait ....`
    )
    districts = await fetchAndComposeLocations(
      getLocationPartOfIds(rawDistricts, states),
      'DISTRICT'
    )
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log(err)
    process.exit(1)
    return
  }

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}generated/states.json`,
    JSON.stringify({ states }, null, 2)
  )

  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}generated/districts.json`,
    JSON.stringify({ districts }, null, 2)
  )

  const fhirLocations: fhir.Location[] = []
  fhirLocations.push(...states)
  fhirLocations.push(...districts)

  const data: ILocation[] = []
  for (const location of fhirLocations) {
    data.push(generateLocationResource(location))
  }
  fs.writeFileSync(
    `${ADMIN_STRUCTURE_SOURCE}generated/locations.json`,
    JSON.stringify({ data }, null, 2)
  )

  return true
}

importAdminStructure()
