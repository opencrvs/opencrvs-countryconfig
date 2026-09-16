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
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4)

type SeedLocation = {
  id: string
  name: string
  partOf: string
  locationType: string
}

type GenerateRegistrationNumberOptions = {
  eventType?: string
  registrationLocationId?: string
  locations?: SeedLocation[]
  locationPrefix?: string
  issuedAt?: Date
}

const LOCATION_PART_OF_PREFIX = 'Location/'
const DEFAULT_LOCATION_PREFIX = 'TV00'
const DEFAULT_EVENT_CODE = 'GN'
const EVENT_TYPE_MAP: Record<string, string> = {
  birth: 'BR',
  death: 'DR',
  'marriage-notice': 'MN',
  'tennis-club-membership': 'TC'
}
const ADMIN_AREA_PREFIX_MAP: Record<string, string> = {
  'TUV-001': 'TV01',
  'TUV-002': 'TV02',
  'TUV-003': 'TV03',
  'TUV-004': 'TV04',
  'TUV-005': 'TV05',
  'TUV-006': 'TV06',
  'TUV-007': 'TV07',
  'TUV-008': 'TV08',
  'TUV-009': 'TV09'
}

function getEventCode(eventType?: string) {
  if (!eventType) {
    return DEFAULT_EVENT_CODE
  }

  return EVENT_TYPE_MAP[eventType] ?? DEFAULT_EVENT_CODE
}

function getParentLocationId(partOf?: string) {
  if (!partOf?.startsWith(LOCATION_PART_OF_PREFIX)) {
    return undefined
  }

  return partOf.slice(LOCATION_PART_OF_PREFIX.length)
}

function getAdministrativeAreaId(
  registrationLocationId: string,
  locations: SeedLocation[]
) {
  const byId = new Map(locations.map((location) => [location.id, location]))
  let currentLocationId: string | undefined = registrationLocationId
  let depth = 0

  while (currentLocationId && depth < 10) {
    if (ADMIN_AREA_PREFIX_MAP[currentLocationId]) {
      return currentLocationId
    }

    const currentLocation = byId.get(currentLocationId)
    if (!currentLocation) {
      return undefined
    }

    const parentLocationId = getParentLocationId(currentLocation.partOf)
    if (!parentLocationId) {
      return undefined
    }

    if (ADMIN_AREA_PREFIX_MAP[parentLocationId]) {
      return parentLocationId
    }

    currentLocationId = byId.has(parentLocationId) ? parentLocationId : undefined
    depth += 1
  }

  return undefined
}

export function resolveRegistrationLocationPrefix(
  registrationLocationId?: string,
  locations: SeedLocation[] = []
) {
  if (!registrationLocationId || locations.length === 0) {
    return undefined
  }

  const administrativeAreaId = getAdministrativeAreaId(
    registrationLocationId,
    locations
  )

  if (!administrativeAreaId) {
    return undefined
  }

  return ADMIN_AREA_PREFIX_MAP[administrativeAreaId]
}

/**
 * Generates a custom registration number for events. You may edit this function to generate a custom registration number.
 * The returned registration number must be a string.
 *
 * @returns {string} Registration number for the event.
 */
export function generateRegistrationNumber({
  eventType,
  registrationLocationId,
  locations = [],
  locationPrefix,
  issuedAt = new Date()
}: GenerateRegistrationNumberOptions = {}): string {
  const prefix =
    locationPrefix ??
    resolveRegistrationLocationPrefix(registrationLocationId, locations) ??
    DEFAULT_LOCATION_PREFIX

  return `${prefix}${getEventCode(eventType)}${issuedAt.getUTCFullYear()}${nanoid()}`
}
