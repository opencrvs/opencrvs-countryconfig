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

module.exports = {
  mongodb: {
    url: process.env.USER_MGNT_MONGO_URL || 'mongodb://localhost/user-mgnt',
    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
      useUnifiedTopology: true // removes a deprecating warning when connecting
    }
  },
  migrationsDir: 'src/migrations/user-mgnt',
  changelogCollectionName: 'madagascar-changelog',
  migrationFileExtension: '.ts',
  useFileHash: false,
  moduleSystem: 'commonjs'
}
