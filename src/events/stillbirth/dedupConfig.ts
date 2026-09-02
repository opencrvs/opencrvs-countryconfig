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
import { field, and, or } from '@opencrvs/toolkit/events/deduplication'

const similarNamedMother = field('mother.name').fuzzyMatches()

/**
 * Mother's date of birth or age are within ~1 year of each other,
 * cross-matched between DOB and age fields to handle partial data.
 */
const similarAgedMother = or(
  field('mother.dob').dateRangeMatches({ days: 365 }),
  field('mother.age').dateRangeMatches({ days: 365 }),
  field('mother.dob').dateRangeMatches({
    days: 365,
    matchAgainst: 'mother.age'
  }),
  field('mother.age').dateRangeMatches({
    days: 365,
    matchAgainst: 'mother.dob'
  })
)

const dateOfDeliveryWithin5Days = field(
  'eventDetails.dateOfDelivery'
).dateRangeMatches({
  days: 5
})

const dateOfDeliveryWithin3Years = field(
  'eventDetails.dateOfDelivery'
).dateRangeMatches({
  days: 1095
})

/**
 * Standard duplicate check (per Deduplication.csv): same delivery window
 * (within 5 days, or year-shifted entry error within 3 years), and a
 * similarly named mother of a similar date of birth or age.
 */
export const dedupConfig = and(
  or(dateOfDeliveryWithin5Days, dateOfDeliveryWithin3Years),
  similarNamedMother,
  similarAgedMother
)
