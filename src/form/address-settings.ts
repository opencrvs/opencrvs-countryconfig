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

// ADMIN_LEVELS must equate to the number of levels of administrative structure provided by your Humdata CSV import
// For example, in Farajaland, we have 2 main administrative levels: State and District.
// Therefore our ADMIN_LEVELS property is 2.
// You can set up to 5 supported administrative levels.

export const ADMIN_LEVELS: Number = 2

// Addresses take up a lot of repeated code in the forms, making the birth.ts, marriage.ts and death.ts files long and difficult to read
// Therefore we apply the addresses dynamically to sections of the form using this configuration constant
// Its possible to show and hide address fields for individuals using conditionals.
// Its also possible to add 2 addresses per individual: PRIMARY_ADDRESS & SECONDARY_ADDRESS depending if the global config setting: secondaryAddressesDisabled is true/false

export enum EventLocationAddressCases {
  PLACE_OF_BIRTH = 'placeOfBirth',
  PLACE_OF_DEATH = 'placeOfDeath',
  PLACE_OF_MARRIAGE = 'placeOfMarriage'
}

export enum AddressCases {
  // the below are UPPER_CASE because they map to GQLAddress type enums
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS'
}
