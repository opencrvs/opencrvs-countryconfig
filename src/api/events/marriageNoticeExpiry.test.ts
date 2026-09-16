import { describe, expect, it } from 'vitest'
import { calculateMarriageNoticeExpiryDate } from './marriageNoticeExpiry'

describe('calculateMarriageNoticeExpiryDate', () => {
  it('adds 90 calendar days', () => {
    expect(calculateMarriageNoticeExpiryDate('2026-01-15')).toBe('2026-04-15')
  })

  it('handles month and year rollover', () => {
    expect(calculateMarriageNoticeExpiryDate('2026-11-15')).toBe('2027-02-13')
  })

  it('returns undefined for absent or invalid dates', () => {
    expect(calculateMarriageNoticeExpiryDate(undefined)).toBeUndefined()
    expect(calculateMarriageNoticeExpiryDate('not-a-date')).toBeUndefined()
  })
})
