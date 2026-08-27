type SeedLocation = {
  id: string
  name: string
  partOf: string
  locationType: string
}

const LOCATION_PART_OF_PREFIX = 'Location/'

function getAdministrativeAreaId(addressValue: unknown) {
  if (typeof addressValue !== 'object' || addressValue === null) {
    return undefined
  }

  const administrativeArea = (addressValue as { administrativeArea?: unknown })
    .administrativeArea

  return typeof administrativeArea === 'string' && administrativeArea.length > 0
    ? administrativeArea
    : undefined
}

function buildLocationIndex(locations: SeedLocation[]) {
  const byId = new Map<string, SeedLocation>()
  const crvsOfficeIdsByPartOf = new Map<string, string[]>()

  for (const location of locations) {
    byId.set(location.id, location)

    if (location.locationType !== 'CRVS_OFFICE') {
      continue
    }

    const officeIds = crvsOfficeIdsByPartOf.get(location.partOf) ?? []
    officeIds.push(location.id)
    officeIds.sort((a, b) => a.localeCompare(b))
    crvsOfficeIdsByPartOf.set(location.partOf, officeIds)
  }

  return { byId, crvsOfficeIdsByPartOf }
}

function getFirstCrvsOfficeIdForPartOf(
  partOf: string,
  crvsOfficeIdsByPartOf: Map<string, string[]>
) {
  const crvsOfficeIds = crvsOfficeIdsByPartOf.get(partOf) ?? []

  return crvsOfficeIds[0]
}

export function deriveEffectiveRegistrationPlaceId(
  declaration: Record<string, unknown>,
  locations: SeedLocation[]
) {
  const { byId, crvsOfficeIdsByPartOf } = buildLocationIndex(locations)

  const placeOfBirth = declaration['child.placeOfBirth']

  if (placeOfBirth === 'HEALTH_FACILITY') {
    const facilityId = declaration['child.birthLocation']
    if (typeof facilityId !== 'string') {
      return undefined
    }

    const facility = byId.get(facilityId)
    if (!facility || facility.locationType !== 'HEALTH_FACILITY') {
      return undefined
    }

    return getFirstCrvsOfficeIdForPartOf(facility.partOf, crvsOfficeIdsByPartOf)
  }

  if (placeOfBirth === 'PRIVATE_HOME' || placeOfBirth === 'OTHER') {
    const addressFieldId =
      placeOfBirth === 'PRIVATE_HOME'
        ? 'child.birthLocation.privateHome'
        : 'child.birthLocation.other'
    const addressValue = declaration[addressFieldId]
    const administrativeAreaId = getAdministrativeAreaId(addressValue)

    if (!administrativeAreaId) {
      return undefined
    }

    return getFirstCrvsOfficeIdForPartOf(
      `${LOCATION_PART_OF_PREFIX}${administrativeAreaId}`,
      crvsOfficeIdsByPartOf
    )
  }

  return undefined
}
