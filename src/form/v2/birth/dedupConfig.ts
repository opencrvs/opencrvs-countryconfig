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
import { field as $field } from '@opencrvs/toolkit/events'

const similarNamedChild = field('child.name').fuzzyMatches()
const childDobWithin5Days = field('child.dob').dateRangeMatches({ days: 5 })
const similarNamedMother = field('mother.name').fuzzyMatches()
const similarAgedMother = field('mother.age').dateRangeMatches({
  days: 365,
  matchAgainst: [$field('mother.age'), $field('mother.dob')]
})
const similarDobMother = field('mother.dob').dateRangeMatches({
  days: 365,
  matchAgainst: [$field('mother.dob'), $field('mother.age')]
})

const differentMotherIdTypes = not(field('mother.idType').strictMatches())
const motherIdNotProvided = field('mother.idType').strictMatches({
  value: 'NONE'
})
const motherIdMatchesIfGiven = or(
  differentMotherIdTypes,
  motherIdNotProvided,
  field('mother.nid').strictMatches(),
  field('mother.passport').strictMatches(),
  field('mother.brn').strictMatches()
)

const childDobWithin9Months = field('child.dob').dateRangeMatches({
  days: 270
})
const childDobWithin3Years = field('child.dob').dateRangeMatches({
  days: 1095
})
const exactNamedChild = field('child.name').strictMatches()

export const dedupConfig = or(
  and(
    similarNamedChild,
    childDobWithin5Days,
    similarNamedMother,
    or(similarAgedMother, similarDobMother),
    motherIdMatchesIfGiven
  ),
  and(
    similarNamedMother,
    or(similarAgedMother, similarDobMother),
    motherIdMatchesIfGiven,
    childDobWithin9Months
  ),
  and(
    exactNamedChild,
    childDobWithin3Years,
    similarNamedMother,
    or(similarAgedMother, similarDobMother),
    motherIdMatchesIfGiven
  )
)
