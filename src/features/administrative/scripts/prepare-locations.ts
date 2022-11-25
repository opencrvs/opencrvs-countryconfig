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
import * as fs from 'fs'
import { ADMIN_STRUCTURE_SOURCE } from '@countryconfig/constants'
import * as csv2json from 'csv2json'

const locationsJSON = `${ADMIN_STRUCTURE_SOURCE}generated/sourceLocations.json`

export default async function prepSource() {
  fs.createReadStream(`${ADMIN_STRUCTURE_SOURCE}source/farajaland.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(locationsJSON))
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// PREPARING SOURCE JSON FROM LOCATIONS CSV FILES ///////////////////////////'
    )}`
  )

  return true
}

prepSource()
