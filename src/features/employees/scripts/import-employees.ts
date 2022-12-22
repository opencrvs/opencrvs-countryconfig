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
import { internal } from '@hapi/boom'
import { createOpenCRVSEmployees } from '@countryconfig/features/employees/scripts/utils'
import { readCSVToJSON } from '@countryconfig/features/utils'

export default async function importEmployees() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      `/////////////////////////// MAPPING: ${process.argv[3].toLowerCase()} EMPLOYEES TO PRACTITIONERS, ROLES AND USERS & SAVING TO FHIR ///////////////////////////`
    )}`
  )
  const employees: any = await readCSVToJSON(process.argv[2])
  try {
    await createOpenCRVSEmployees(
      employees,
      process.argv[3],
      process.argv[4].toLowerCase(),
      process.argv[5].toUpperCase()
    )
  } catch (err) {
    return internal(err)
  }
  return true
}

importEmployees()
