/* eslint-disable no-console */
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

/**
 * One-off script to populate `externalId` for existing locations and administrative
 * areas that were seeded before `externalId` was introduced.
 *
 * Matching strategy: locations are matched by English name to CSV rows.
 *   - Administrative areas: matched using `adminXName_en` columns in administrative-areas.csv
 *   - Facilities/offices:   matched using `name` column in locations.csv
 *
 * Requires a national system admin JWT (has CONFIG_UPDATE_ALL scope which satisfies
 * the locations.set / administrativeAreas.set scope check).
 * The script will prompt for this token interactively.
 *
 * Run after ensuring the core services are up:
 *   yarn populate-ids               (dev — uses devDefault env values)
 *   yarn populate-ids:prod          (prod — all env vars must be set explicitly)
 */

import prompts from 'prompts'
import { createClient } from '@opencrvs/toolkit/api'
import { env } from '@countryconfig/environment'
import {
  HumdataLocation,
  FacilityRow,
  readCSVToJSON
} from '@countryconfig/data-seeding/locations/csv-helpers'

async function populate(token: string): Promise<void> {
  const eventsUrl = new URL('events', env.GATEWAY_URL).toString()
  const client = createClient(eventsUrl, `Bearer ${token}`)

  console.log('Fetching existing locations from core...')
  const [existingAdminAreas, existingLocations] = await Promise.all([
    client.administrativeAreas.list.query(),
    client.locations.list.query()
  ])

  console.log(
    `Found ${existingAdminAreas.length} administrative areas and ${existingLocations.length} locations in DB`
  )

  console.log('Loading CSVs...')
  const [humdataRows, facilityRows] = await Promise.all([
    readCSVToJSON<HumdataLocation[]>(
      './src/data-seeding/locations/source/administrative-areas.csv'
    ),
    readCSVToJSON<FacilityRow[]>(
      './src/data-seeding/locations/source/locations.csv'
    )
  ])

  /*
   * Build a name → externalId map for administrative areas.
   * Matching key: English name (adminXName_en) at each admin level.
   * Each Pcode in the CSV becomes the externalId for the matching DB record.
   */
  const adminAreaPcodeByName = new Map<string, string>()
  for (const row of humdataRows) {
    for (const level of [0, 1, 2, 3, 4] as const) {
      const name = row[`admin${level}Name_en`]
      const pcode = row[`admin${level}Pcode`]
      if (name && pcode && !adminAreaPcodeByName.has(name)) {
        adminAreaPcodeByName.set(name, pcode)
      }
    }
  }

  /*
   * Build a name → externalId map for facilities/offices.
   * Matching key: name column in locations.csv.
   * The CSV `id` field is the Pcode used as externalId.
   */
  const facilityPcodeByName = new Map<string, string>()
  for (const row of facilityRows) {
    if (row.name && row.id) {
      facilityPcodeByName.set(row.name, row.id)
    }
  }

  // Build sets of Pcodes already assigned in DB to avoid unique constraint violations
  // when two DB rows share the same name (e.g. duplicate seedings).
  const usedAdminAreaExternalIds = new Set(
    existingAdminAreas.flatMap((a) => (a.externalId ? [a.externalId] : []))
  )
  const usedLocationExternalIds = new Set(
    existingLocations.flatMap((l) => (l.externalId ? [l.externalId] : []))
  )

  // --- Administrative areas ---
  let adminMatched = 0
  let adminSkipped = 0
  let adminUnmatched = 0
  let adminDuplicate = 0
  const adminAreaUpdates: typeof existingAdminAreas = []

  for (const area of existingAdminAreas) {
    if (area.externalId) {
      adminSkipped++
      continue
    }

    const externalId = adminAreaPcodeByName.get(area.name)

    if (!externalId) {
      console.warn(
        `[UNMATCHED administrative area] name="${area.name}" id=${area.id}`
      )
      adminUnmatched++
      continue
    }

    if (usedAdminAreaExternalIds.has(externalId)) {
      console.warn(
        `[DUPLICATE administrative area] name="${area.name}" id=${area.id} externalId=${externalId} already assigned to another row — skipping`
      )
      adminDuplicate++
      continue
    }

    usedAdminAreaExternalIds.add(externalId)
    adminAreaUpdates.push({ ...area, externalId })
    adminMatched++
  }

  // --- Locations (facilities / offices) ---
  let locMatched = 0
  let locSkipped = 0
  let locUnmatched = 0
  let locDuplicate = 0
  const locationUpdates: typeof existingLocations = []

  for (const loc of existingLocations) {
    if (loc.externalId) {
      locSkipped++
      continue
    }

    const externalId = facilityPcodeByName.get(loc.name)

    if (!externalId) {
      console.warn(
        `[UNMATCHED location] name="${loc.name}" id=${loc.id} type=${loc.locationType}`
      )
      locUnmatched++
      continue
    }

    if (usedLocationExternalIds.has(externalId)) {
      console.warn(
        `[DUPLICATE location] name="${loc.name}" id=${loc.id} externalId=${externalId} already assigned to another row — skipping`
      )
      locDuplicate++
      continue
    }

    usedLocationExternalIds.add(externalId)
    locationUpdates.push({ ...loc, externalId })
    locMatched++
  }

  // --- Write back ---
  if (adminAreaUpdates.length > 0) {
    console.log(`Updating ${adminAreaUpdates.length} administrative areas...`)
    await client.administrativeAreas.set.mutate(adminAreaUpdates)
  }

  if (locationUpdates.length > 0) {
    console.log(`Updating ${locationUpdates.length} locations...`)
    await client.locations.set.mutate(locationUpdates)
  }

  // --- Summary ---
  console.log('\n=== Summary ===')
  console.log(
    `Administrative areas: ${adminMatched} updated, ${adminSkipped} skipped (already had externalId), ${adminUnmatched} unmatched, ${adminDuplicate} duplicate (Pcode already taken by another row)`
  )
  console.log(
    `Locations:            ${locMatched} updated, ${locSkipped} skipped (already had externalId), ${locUnmatched} unmatched, ${locDuplicate} duplicate (Pcode already taken by another row)`
  )

  if (adminUnmatched > 0 || locUnmatched > 0) {
    console.log(
      '\nUnmatched records were not updated. Review the warnings above and ensure the English names in your CSV match the names in the database exactly.'
    )
  }
  if (adminDuplicate > 0 || locDuplicate > 0) {
    console.log(
      '\nDuplicate records were skipped. These are DB rows whose target Pcode is already assigned to another row with the same name — likely caused by duplicate seedings. Safe to ignore unless you expect unique coverage.'
    )
  }
  if (
    adminUnmatched === 0 &&
    locUnmatched === 0 &&
    adminDuplicate === 0 &&
    locDuplicate === 0
  ) {
    console.log('\nAll records successfully updated.')
  }
}

async function main() {
  const { adminToken } = await prompts({
    type: 'password',
    name: 'adminToken',
    message: 'Enter national system admin JWT token'
  })

  if (!adminToken) {
    console.error('No token provided. Exiting.')
    process.exit(1)
  }

  await populate(adminToken)

  console.log('Done.')
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
