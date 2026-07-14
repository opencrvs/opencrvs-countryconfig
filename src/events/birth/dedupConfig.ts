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
const similarNamedChild = field('child.name').fuzzyMatches()
const sameNamedChild = field('child.name').strictMatches()

/**
 * Child date-of-birth conditions.
 *
 * For Check 1 (standard), any of the following triggers a DOB match:
 *   • Within 5 days of the existing record
 *   • Same DD/MM but different YYYY within ±3 years (year entry error)
 *   • Different DD/MM within ±3 years (broader data-quality issue)
 * The 3-year window encompasses all three scenarios.
 */
const childDobWithin5Days = field('child.dob').dateRangeMatches({ days: 5 })
const childDobWithin9Months = field('child.dob').dateRangeMatches({ days: 270 })
const childDobWithin3Years = field('child.dob').dateRangeMatches({ days: 1095 })

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

export const dedupConfig = or(
  /**
   * Check 1 – Standard check
   *
   * Catches mistakenly created duplicates, repeat registrations (lost
   * certificate, registration drives, legacy-to-electronic migrations).
   *
   * Rules:
   *   - Similar child given name(s) AND similar child family name
   *   - Child DOB: within 5 days, OR same DD/MM different year ±3 years,
   *     OR different DD/MM within ±3 years
   *   - Similar mother given name(s) AND similar mother family name
   *   - Similar mother DOB OR same mother age
   */
  and(
    similarNamedChild,
    or(childDobWithin5Days, childDobWithin3Years),
    similarNamedMother,
    similarAgedMother
  ),

  /**
   * Check 2 – Same mother, two births within 9 months
   *
   * A woman cannot carry more than one pregnancy to term within 9 months.
   *
   * Rules:
   *   - Similar mother given name(s) AND similar mother family name
   *   - Similar mother DOB OR same mother age
   *   - Child DOBs within 9 months of each other
   */
  and(
    similarNamedMother,
    similarAgedMother,
    childDobWithin9Months
  ),

  /**
   * Check 3 – Child age increase/decrease (age fraud)
   *
   * Fraudulent alteration of the birth year to make a person appear
   * older or younger (e.g., for marriage eligibility or voting).
   *
   * Rules:
   *   - Same child given name(s) AND same child family name (exact match)
   *   - Child DOB within ±3 years
   *   - Similar mother given name(s) AND similar mother family name
   *   - Similar mother DOB OR same mother age
   */
  and(
    sameNamedChild,
    childDobWithin3Years,
    similarNamedMother,
    similarAgedMother
  )
)
