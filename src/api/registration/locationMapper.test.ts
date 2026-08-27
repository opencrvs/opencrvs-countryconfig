import { describe, expect, it } from 'vitest'
import { deriveEffectiveRegistrationPlaceId } from './locationMapper'

const locations = [
  {
    id: 'TUV-001-001',
    name: 'Funafuti Kaupule',
    partOf: 'Location/TUV-001',
    locationType: 'CRVS_OFFICE'
  },
  {
    id: 'TUV-001-010',
    name: 'Funafuti Office B',
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
    id: 'TUV-002-001',
    name: 'Nanumea Kaupule',
    partOf: 'Location/TUV-002',
    locationType: 'CRVS_OFFICE'
  }
]

describe('deriveEffectiveRegistrationPlaceId', () => {
  it('derives from health facility parent admin area', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'HEALTH_FACILITY',
        'child.birthLocation': 'TUV-001-002'
      },
      locations
    )

    expect(value).toBe('TUV-001-001')
  })

  it('derives from private home administrative area', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.birthLocation.privateHome': {
          administrativeArea: 'TUV-002'
        }
      },
      locations
    )

    expect(value).toBe('TUV-002-001')
  })

  it('derives from other administrative area', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'OTHER',
        'child.birthLocation.other': {
          administrativeArea: 'TUV-001'
        }
      },
      locations
    )

    expect(value).toBe('TUV-001-001')
  })

  it('returns undefined for unknown facility', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'HEALTH_FACILITY',
        'child.birthLocation': 'UNKNOWN'
      },
      locations
    )

    expect(value).toBeUndefined()
  })

  it('returns undefined for missing administrative area', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'OTHER',
        'child.birthLocation.other': {}
      },
      locations
    )

    expect(value).toBeUndefined()
  })

  it('chooses deterministic first office id when multiple offices exist', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.birthLocation.privateHome': {
          administrativeArea: 'TUV-001'
        }
      },
      locations
    )

    expect(value).toBe('TUV-001-001')
  })

  it('returns undefined for an unrecognised placeOfBirth value', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'HOSPITAL',
        'child.birthLocation': 'TUV-001-002'
      },
      locations
    )

    expect(value).toBeUndefined()
  })

  it('returns undefined when birthLocation is not a string for HEALTH_FACILITY', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'HEALTH_FACILITY',
        'child.birthLocation': null
      },
      locations
    )

    expect(value).toBeUndefined()
  })

  it('returns undefined when birthLocation id belongs to a non-health-facility location', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'HEALTH_FACILITY',
        // TUV-001-001 is a CRVS_OFFICE, not a HEALTH_FACILITY
        'child.birthLocation': 'TUV-001-001'
      },
      locations
    )

    expect(value).toBeUndefined()
  })

  it('returns undefined when the admin area has no CRVS offices', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.birthLocation.privateHome': {
          administrativeArea: 'TUV-003'
        }
      },
      locations
    )

    expect(value).toBeUndefined()
  })

  it('returns undefined when administrativeArea is an empty string', () => {
    const value = deriveEffectiveRegistrationPlaceId(
      {
        'child.placeOfBirth': 'OTHER',
        'child.birthLocation.other': {
          administrativeArea: ''
        }
      },
      locations
    )

    expect(value).toBeUndefined()
  })
})
