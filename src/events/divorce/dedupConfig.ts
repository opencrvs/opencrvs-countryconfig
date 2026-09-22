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
import { field, and, or, not } from '@opencrvs/toolkit/events/deduplication'

const sameMarriageRegistrationNumber = field(
  'marriageDetails.marriageRegistrationNumber'
).strictMatches()

const similarBrideGivenName = field('marriageDetails.brideName').fuzzyMatches()

const brideDobWithin5Days = field('marriageDetails.brideDob').dateRangeMatches({
  days: 5
})
const brideDobWithin3Years = field('marriageDetails.brideDob').dateRangeMatches(
  { days: 1095 }
)

const similarBridegroomGivenName = field(
  'marriageDetails.bridegroomGivenNames'
).fuzzyMatches()

const bridegroomDobWithin5Days = field(
  'marriageDetails.bridegroomDob'
).dateRangeMatches({
  days: 5
})
const bridegroomDobWithin3Years = field(
  'marriageDetails.bridegroomDob'
).dateRangeMatches({
  days: 1095
})

const brideNameMatches = and(similarBrideGivenName)

const bridegroomNameMatches = and(similarBridegroomGivenName)

const brideDateMatches = or(brideDobWithin5Days, brideDobWithin3Years)

const bridegroomDateMatches = or(
  bridegroomDobWithin5Days,
  bridegroomDobWithin3Years
)

export const dedupConfig = or(
  sameMarriageRegistrationNumber,
  and(
    brideNameMatches,
    bridegroomNameMatches,
    brideDateMatches,
    bridegroomDateMatches
  )
)
