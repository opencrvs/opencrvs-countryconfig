import { and, field, or } from '@opencrvs/toolkit/events/deduplication'

const similarBride = field('bride.name').fuzzyMatches()
const similarBridegroom = field('brideGroom.name').fuzzyMatches()
const brideDobWithinFiveDays = field('bride.dob').dateRangeMatches({ days: 5 })
const brideDobWithinThreeYears = field('bride.dob').dateRangeMatches({ days: 1095 })
const bridegroomDobWithinFiveDays = field('brideGroom.dob').dateRangeMatches({ days: 5 })
const bridegroomDobWithinThreeYears = field('brideGroom.dob').dateRangeMatches({ days: 1095 })
const marriageDateWithinNinetyDays = field('noticeOfIntendedMarriageDetails.dateOfMarriage').dateRangeMatches({ days: 90 })

const standardCheck = and(
  similarBride,
  similarBridegroom,
  or(brideDobWithinFiveDays, brideDobWithinThreeYears),
  or(bridegroomDobWithinFiveDays, bridegroomDobWithinThreeYears)
)

export const dedupConfig = or(
  standardCheck,
  and(
    similarBride,
    similarBridegroom,
    or(brideDobWithinFiveDays, brideDobWithinThreeYears),
    or(bridegroomDobWithinFiveDays, bridegroomDobWithinThreeYears),
    marriageDateWithinNinetyDays
  )
)
