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
import {
  getFromFhir,
  updateResourceInHearth
} from '@countryconfig/features/utils'
import { hasScope } from '@countryconfig/index'
import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'

interface IMosipPayload {
  BRN: string
  UINTOKEN: string
  RID: string
}

export async function mosipMediatorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // Adds MOSIP generated VIN and NID to a child that has been registered
  const token = request.headers['authorization'].split('Bearer ')[1]
  if (hasScope(token, 'nationalId')) {
    const payload = request.payload as IMosipPayload
    // Search Hearth for a Person with a given National ID
    const personBundle: fhir.Bundle = await getFromFhir(
      `/Patient?identifier=${encodeURIComponent(payload.BRN)}`
    )
    if (personBundle.entry?.length && personBundle.entry[0]?.resource) {
      const person: fhir.Patient = personBundle.entry[0]
        ?.resource as fhir.Patient
      if (
        person.identifier?.length &&
        person.identifier?.length === 1 &&
        person.identifier[0].type === 'BIRTH_REGISTRATION_NUMBER' &&
        person.identifier[0].value === payload.BRN
      ) {
        // update details
        person.identifier.push({
          type: 'MOSIP_RID',
          value: payload.RID
        } as fhir.CodeableConcept)
        person.identifier.push({
          type: 'MOSIP_UINTOKEN',
          value: payload.UINTOKEN
        } as fhir.CodeableConcept)
        try {
          await updateResourceInHearth(person)
        } catch (error) {
          console.log(`Error for processing ${JSON.stringify(error)}`)
        }
        return h.response().code(200)
      } else {
        throw new Error('Person cannot be found')
      }
    } else {
      throw new Error('Person cannot be found')
    }
  } else {
    throw unauthorized()
  }
}
