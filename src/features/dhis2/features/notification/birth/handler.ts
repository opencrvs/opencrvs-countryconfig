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
  createPersonEntry,
  createBirthEncounterEntry,
  createBundle,
  createTaskEntry,
  createBirthComposition,
  createPresentAtEventObservation,
  getIDFromResponse,
  createBirthWeightObservation,
  createWeightAtBirthObservation,
  createAttendantAtBirthObservation,
  createRelatedPersonEntry
} from '../../fhir/service'

import * as Hapi from '@hapi/hapi'

import {
  postBundle,
  fetchFacilityById,
  fetchLocationById
} from '../../fhir/api'

export interface IBirthNotification {
  dhis2_event: string
  child: {
    first_names?: string
    last_name: string
    weight?: string // in gm
    sex?: 'male' | 'female' | 'unknown'
  }
  father: {
    first_names?: string
    last_name: string
    nid?: string
    dob: string
  }
  mother: {
    first_names?: string
    last_name: string
    dob: string
    nid?: string
  }
  phone_number: string
  date_birth: string
  place_of_birth: string
  created_at: string
  practitioner_primary_office: string
}

export async function birthNotificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const token = request.headers['authorization'].split('Bearer ')[1]

  return {
    compositionId: await sendBirthNotification(
      token,
      request.payload as IBirthNotification
    )
  }
}

async function sendBirthNotification(
  token: string,
  notification: IBirthNotification
) {
  let contactNumber = notification && notification.phone_number
  if (contactNumber) {
    if (contactNumber.startsWith('26')) {
      contactNumber = `+${contactNumber}`
    } else if (
      !contactNumber.startsWith('0') &&
      !contactNumber.startsWith('+260')
    ) {
      contactNumber = `+260${contactNumber}`
    }
  }
  if (!notification.place_of_birth) {
    throw new Error('Could not find any place of birth')
  }

  const placeOfBirthFacilityLocation = await fetchFacilityById(
    notification.place_of_birth,
    token
  )
  if (
    !placeOfBirthFacilityLocation ||
    !placeOfBirthFacilityLocation.partOf?.reference
  ) {
    throw new Error(
      `CANNOT FIND LOCATION FOR BIRTH NOTIFICATION: ${JSON.stringify(
        notification
      )}`
    )
  }

  const location = await fetchLocationById(
    placeOfBirthFacilityLocation.partOf.reference.split('/')[1],
    token
  )
  if (!location) {
    throw new Error(
      `CANNOT FIND LOCATION FOR BIRTH NOTIFICATION: ${JSON.stringify(
        notification
      )}`
    )
  }

  const child = await createPersonEntry(
    null,
    (notification.child.first_names && [notification.child.first_names]) ||
      null,
    notification.child.last_name,
    notification.child.sex || 'unknown',
    null,
    notification.date_birth,
    null,
    location
  )
  const mother = await createPersonEntry(
    notification.mother.nid || null,
    (notification.mother.first_names && [notification.mother.first_names]) ||
      null,
    notification.mother.last_name,
    'female',
    contactNumber,
    notification.mother.dob,
    null,
    location
  )

  const father = await createPersonEntry(
    notification.father.nid || null,
    (notification.father.first_names && [notification.father.first_names]) ||
      null,
    notification.father.last_name,
    'male',
    contactNumber,
    notification.father.dob,
    null,
    location
  )
  const informant = await createRelatedPersonEntry('MOTHER', mother.fullUrl)

  const encounter = createBirthEncounterEntry(
    `Location/${placeOfBirthFacilityLocation.id}`
  )
  let birthWeightObservation
  if (notification && notification.child && notification.child.weight) {
    birthWeightObservation = createBirthWeightObservation(
      encounter.fullUrl,
      Number((Number(notification.child.weight) / 1000).toFixed(1))
    ) // converting gm to kg
  }

  const composition = createBirthComposition(
    child.fullUrl,
    mother.fullUrl,
    father.fullUrl,
    informant.fullUrl,
    encounter.fullUrl,
    new Date(notification.created_at)
  )
  const lastRegOffice = await fetchLocationById(
    notification.practitioner_primary_office,
    token
  )

  if (!lastRegOffice || !lastRegOffice.partOf?.reference) {
    throw new Error(
      `Could not find primary office for ${notification.practitioner_primary_office}`
    )
  }

  const lastRegLocation = await fetchLocationById(
    lastRegOffice?.partOf?.reference.replace('Location/', ''),
    token
  )

  if (!lastRegLocation) {
    throw new Error(`Could not find location for practitioner primary office`)
  }

  // Contact type is always passing MOTHER
  // as based on the type both mother last name and phone number is required
  // TODO: may need to change it based on the available data from dhis2
  const task = await createTaskEntry(
    composition.fullUrl,
    lastRegLocation,
    lastRegOffice,
    'BIRTH',
    'MOTHER',
    contactNumber,
    notification.dhis2_event,
    new Date(notification.created_at)
  )

  const entries: fhir.BundleEntry[] = []
  entries.push(composition)
  entries.push(task)
  entries.push(child)
  entries.push(mother)
  entries.push(informant)
  entries.push(father)
  entries.push(encounter)
  if (birthWeightObservation) {
    entries.push(birthWeightObservation)
  }
  entries.push(createPresentAtEventObservation(encounter.fullUrl, 'MOTHER'))
  entries.push(createWeightAtBirthObservation(encounter.fullUrl))
  entries.push(createAttendantAtBirthObservation(encounter.fullUrl))

  const bundle = createBundle(entries, new Date(notification.created_at))

  const response = await postBundle(bundle, token)

  return getIDFromResponse(response)
}
