/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { FHIR_URL, OPENHIM_URL } from '@countryconfig/constants'
import fetch from 'node-fetch'

interface IIdentifier {
  system: string
  value: string
}

export async function fetchLocationByIdentifiers(
  identifiers: IIdentifier[],
  querySuffix: string,
  token: string
): Promise<fhir.Location | undefined> {
  const identifierQueryStrings = identifiers.map(
    identifier => `identifier=${identifier.system}|${identifier.value}`
  )

  const res = await fetch(
    `${FHIR_URL}/Location?${identifierQueryStrings.join('&')}&${querySuffix}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/fhir+json'
      }
    }
  )

  if (!res.ok) {
    return undefined
  }

  const bundle: fhir.Bundle = await res.json()

  if (!bundle.entry || !bundle.entry[0] || !bundle.entry[0].resource) {
    return undefined
  }

  return bundle.entry[0].resource as fhir.Location
}

export async function fetchFacilityById(
  id: string,
  token: string
): Promise<fhir.Location | undefined> {
  const res = await fetch(`${FHIR_URL}/Location/${id}?type=HEALTH_FACILITY`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    return undefined
  }

  const bundle = await res.json()

  return bundle
}

export async function postBundle(bundle: fhir.Bundle, token: string) {
  const res = await fetch(OPENHIM_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/fhir+json'
    },
    body: JSON.stringify(bundle)
  })

  if (!res.ok) {
    throw new Error(
      `Error status code received in response, ${res.statusText} ${res.status}`
    )
  }

  return res.json()
}
