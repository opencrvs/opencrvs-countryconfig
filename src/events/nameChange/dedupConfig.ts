import { field, or } from '@opencrvs/toolkit/events/deduplication'

// Subject (original identity)
const similarNamedSubject = field('subjects.name').fuzzyMatches()
// const similarSubjectBRN = field('subjects.birthRegistrationNumber').fuzzyMatches() Need to confirm and add BRN in deduplication

export const dedupConfig = or(similarNamedSubject)
