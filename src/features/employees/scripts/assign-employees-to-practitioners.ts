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
import * as fs from 'fs'
import { EMPLOYEES_SOURCE } from '@countryconfig/constants'
import chalk from 'chalk'
import { internal } from '@hapi/boom'
import { composeAndSavePractitioners } from '@countryconfig/features/employees/scripts/service'

const sourceJSON =
  process.argv[3].toLowerCase() === 'development'
    ? `${EMPLOYEES_SOURCE}generated/test-employees.json`
    : `${EMPLOYEES_SOURCE}generated/prod-employees.json`

export default async function importEmployees() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      `/////////////////////////// MAPPING: ${process.argv[3].toLowerCase()} EMPLOYEES TO PRACTITIONERS, ROLES AND USERS & SAVING TO FHIR ///////////////////////////`
    )}`
  )
  const employees = JSON.parse(fs.readFileSync(sourceJSON).toString())
  try {
    await composeAndSavePractitioners(
      employees,
      process.argv[2],
      process.argv[3].toLowerCase(),
      process.argv[4].toUpperCase()
    )
  } catch (err) {
    return internal(err)
  }
  return true
}

importEmployees()
