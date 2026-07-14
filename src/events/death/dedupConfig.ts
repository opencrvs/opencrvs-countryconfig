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

/**
 * Fuzzy name similarity rules (applied by the toolkit's fuzzyMatches algorithm):
 *
 * Given name(s): at least one submitted given name must match at least one
 * existing given name, using Levenshtein distance scaled by name length:
 *   0–3 chars → 0 edits allowed (exact)
 *   4–6 chars → 1 edit allowed
 *   7+  chars → 2 edits allowed
 *
 * Family name: ALL parts of the submitted family name must match under the
 * same Levenshtein rules.
 */
const similarNamedDeceased = field('deceased.name').fuzzyMatches()
const similarNamedSpouse = field('spouse.name').fuzzyMatches()

/**
 * Date of death conditions.
 *
 * Any of the following triggers a date-of-death match:
 *   • Within 14 days of the existing record
 *   • Same DD/MM but different YYYY within ±3 years (year entry error)
 *   • Different DD/MM within ±3 years (broader data-quality issue)
 * The 3-year window encompasses all three scenarios.
 */
const dateOfDeathWithin14Days = field('eventDetails.date').dateRangeMatches({
  days: 14
})
const dateOfDeathWithin3Years = field('eventDetails.date').dateRangeMatches({
  days: 1095
})

/**
 * Spouse's date of birth or age within ~1 year, cross-matched between
 * DOB and age fields to handle partial data.
 */
const similarAgedSpouse = or(
  field('spouse.dob').dateRangeMatches({ days: 365 }),
  field('spouse.age').dateRangeMatches({ days: 365 }),
  field('spouse.dob').dateRangeMatches({
    days: 365,
    matchAgainst: 'spouse.age'
  }),
  field('spouse.age').dateRangeMatches({
    days: 365,
    matchAgainst: 'spouse.dob'
  })
)

/**
 * ID match conditions — passport number or birth certificate must match
 * for both the deceased and the spouse.
 */
const deceasedIdMatches = or(
  field('deceased.passport').strictMatches(),
  field('deceased.brn').strictMatches()
)

const spouseIdMatches = or(
  field('spouse.passport').strictMatches(),
  field('spouse.brn').strictMatches()
)

/**
 * Check 1 – Standard check
 *
 * Catches mistakenly created duplicates, registration drives (lost
 * certificate, legacy-to-electronic migrations).
 *
 * Rules:
 *   - Similar deceased given name(s) AND similar deceased surname
 *   - Date of death: within 14 days, OR same DD/MM different year ±3 years,
 *     OR different DD/MM within ±3 years
 *   - Similar spouse given name(s) AND similar spouse surname
 *   - Similar spouse DOB OR same spouse age
 *   - Same deceased passport number OR birth certificate
 *   - Same spouse passport number OR birth certificate
 */
export const dedupConfig = and(
  similarNamedDeceased,
  or(dateOfDeathWithin14Days, dateOfDeathWithin3Years),
  similarNamedSpouse,
  similarAgedSpouse,
  deceasedIdMatches,
  spouseIdMatches
)
