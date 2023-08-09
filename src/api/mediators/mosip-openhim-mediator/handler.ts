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
import { getFromFhir, updateResourceInHearth } from '@countryconfig/utils'
import { hasScope } from '@countryconfig/index'
import { unauthorized } from '@hapi/boom'
import * as Hapi from '@hapi/hapi'

interface IMosipPayload {
  BRN: string
  MOSIP_PSUT_TOKEN_ID?: string
  MOSIP_AID?: string
}

export async function mosipMediatorHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = request.headers['authorization'].split('Bearer ')[1]
  if (hasScope(token, 'nationalId')) {
    const payload = request.payload as IMosipPayload

    if (payload.MOSIP_PSUT_TOKEN_ID) {
      await processPSUT(payload.MOSIP_PSUT_TOKEN_ID, payload.BRN)
    }

    if (payload.MOSIP_AID) {
      await processAID(payload.MOSIP_AID, payload.BRN)
    }
    return h.response().code(200)
  } else {
    throw unauthorized()
  }
}

async function processPSUT(uinToken: string, brn: string): Promise<boolean> {
  // Search Hearth for the patient with a given BRN
  const personBundle: fhir.Bundle = await getFromFhir(
    `/Patient?identifier=${encodeURIComponent(brn)}`
  )
  if (
    personBundle &&
    personBundle.entry?.length &&
    personBundle.entry[0]?.resource
  ) {
    const person: fhir.Patient = personBundle.entry[0]?.resource as fhir.Patient
    let personAlreadyUpdated = false
    if (
      person.identifier?.length &&
      confirmIdentifierExists(
        person.identifier,
        'type',
        'MOSIP_PSUT_TOKEN_ID',
        uinToken
      )
    ) {
      personAlreadyUpdated = true
      return true
    }
    if (
      person.identifier?.length &&
      confirmIdentifierExists(
        person.identifier,
        'type',
        'BIRTH_REGISTRATION_NUMBER',
        brn
      ) &&
      !personAlreadyUpdated
    ) {
      person.identifier.push({
        type: 'MOSIP_PSUT_TOKEN_ID',
        value: uinToken
      } as fhir.CodeableConcept)
      try {
        await updateResourceInHearth(person)
        return true
      } catch (error) {
        throw new Error(`Error for processing ${JSON.stringify(error)}`)
      }
    } else {
      throw new Error('Person cannot be found')
    }
  } else {
    throw new Error('Person cannot be found')
  }
}

async function processAID(aid: string, brn: string): Promise<boolean> {
  // Search Hearth for the registration task with a given BRN
  const taskBundle: fhir.Bundle = await getFromFhir(
    `/Task?identifier=${encodeURIComponent(brn)}`
  )

  if (taskBundle.entry?.length && taskBundle.entry[0]?.resource) {
    const task: fhir.Task = taskBundle.entry[0]?.resource as fhir.Task
    let taskAlreadyUpdated = false
    if (
      task.identifier?.length &&
      confirmIdentifierExists(
        task.identifier,
        'system',
        'http://opencrvs.org/specs/id/mosip-aid',
        aid
      )
    ) {
      taskAlreadyUpdated = true
      return true
    }

    if (
      task.identifier?.length &&
      confirmIdentifierExists(
        task.identifier,
        'system',
        'http://opencrvs.org/specs/id/birth-registration-number',
        brn
      ) &&
      !taskAlreadyUpdated
    ) {
      // update details
      task.identifier.push({
        system: 'http://opencrvs.org/specs/id/mosip-aid',
        value: aid
      } as fhir.CodeableConcept)
      try {
        await updateResourceInHearth(task)
        return true
      } catch (error) {
        throw new Error(`Error for processing ${JSON.stringify(error)}`)
      }
    } else {
      throw new Error('Task cannot be found')
    }
  } else {
    throw new Error('Task cannot be found')
  }
}

function confirmIdentifierExists(
  identifiers: fhir.Identifier[],
  label: 'type' | 'system',
  labelValue: string,
  value: string
): boolean {
  const relevantIdentifier: fhir.Identifier[] = identifiers.filter(
    (identifier: fhir.Identifier) => {
      return identifier[label] === labelValue && identifier.value === value
    }
  )
  return relevantIdentifier.length === 1 ? true : false
}
