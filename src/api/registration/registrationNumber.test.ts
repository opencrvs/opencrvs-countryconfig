import { describe, expect, it, vi } from 'vitest'

vi.mock('nanoid', () => {
  return {
    customAlphabet: vi.fn(() => vi.fn(() => 'AB12'))
  }
})

import {
  generateRegistrationNumber,
  resolveRegistrationLocationPrefix
} from './registrationNumber'

const locations = [
  {
    id: 'TUV-001-001',
    name: 'Funafuti Kaupule',
    partOf: 'Location/TUV-001',
    locationType: 'CRVS_OFFICE'
  },
  {
    id: 'TUV-001-002',
    name: 'Tekavatoetoe Health Centre',
    partOf: 'Location/TUV-001',
    locationType: 'HEALTH_FACILITY'
  },
  {
    id: 'TUV-009-001',
    name: 'Niulakita Kaupule',
    partOf: 'Location/TUV-009',
    locationType: 'CRVS_OFFICE'
  }
]

describe('resolveRegistrationLocationPrefix', () => {
  it('resolves prefix from a CRVS office location', () => {
    expect(resolveRegistrationLocationPrefix('TUV-001-001', locations)).toBe(
      'TV01'
    )
  })

  it('resolves prefix from a health facility parent administrative area', () => {
    expect(resolveRegistrationLocationPrefix('TUV-001-002', locations)).toBe(
      'TV01'
    )
  })

  it('returns undefined when the location cannot be mapped', () => {
    expect(resolveRegistrationLocationPrefix('UNKNOWN', locations)).toBeUndefined()
  })
})

describe('generateRegistrationNumber', () => {
  it('builds a birth registration number using the location prefix', () => {
    expect(
      generateRegistrationNumber({
        eventType: 'birth',
        registrationLocationId: 'TUV-001-001',
        locations,
        issuedAt: new Date('2026-01-15T00:00:00.000Z')
      })
    ).toBe('TV01BR2026AB12')
  })

  it('builds a death registration number from a facility location', () => {
    expect(
      generateRegistrationNumber({
        eventType: 'death',
        registrationLocationId: 'TUV-001-002',
        locations,
        issuedAt: new Date('2026-01-15T00:00:00.000Z')
      })
    ).toBe('TV01DR2026AB12')
  })

  it('falls back to the default prefix when no location can be resolved', () => {
    expect(
      generateRegistrationNumber({
        eventType: 'tennis-club-membership',
        registrationLocationId: 'UNKNOWN',
        locations,
        issuedAt: new Date('2026-01-15T00:00:00.000Z')
      })
    ).toBe('TV00TC2026AB12')
  })

  it('uses the Marriage Notice event code for the new notice event', () => {
    expect(
      generateRegistrationNumber({
        eventType: 'marriage-notice',
        registrationLocationId: 'TUV-009-001',
        locations,
        issuedAt: new Date('2026-01-15T00:00:00.000Z')
      })
    ).toBe('TV09MN2026AB12')
  })

  it('falls back to the generic event code for unknown events', () => {
    expect(
      generateRegistrationNumber({
        eventType: 'marriage',
        registrationLocationId: 'TUV-009-001',
        locations,
        issuedAt: new Date('2026-01-15T00:00:00.000Z')
      })
    ).toBe('TV09GN2026AB12')
  })
})