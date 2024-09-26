/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */

import { Db, MongoClient } from 'mongodb'

export const up = async (db: Db, client: MongoClient) => {
  const isQAEnvironment = process.env.QA_ENV
    ? process.env.QA_ENV === 'true'
    : false

  const isProductionLikeEnvironment =
    process.env.NODE_ENV === 'production' && !isQAEnvironment
  if (isProductionLikeEnvironment) {
    // This is only done once. Previous production was run as a QA environment.
    console.log('Removing "demo" scope from all users.')

    await db
      .collection('users')
      // @ts-ignore
      .updateMany({}, { $pull: { scope: 'demo' } })
  } else {
    console.log(
      'Running "demo"-scope removal migration in non-production environment. Skipping migration task.'
    )
  }
}

export const down = async (db: Db, client: MongoClient) => {
  // Add migration logic for reverting changes made by the up() function
  // This code will be executed when rolling back the migration
  // It should reverse the changes made in the up() function
}
