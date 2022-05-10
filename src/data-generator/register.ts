import fetch from 'node-fetch'
import { User } from './users'

import { idsToFHIRIds, log } from './util'

import { Location } from './location'
import { createAddressInput } from './address'
import {
  AddressType,
  AttendantType,
  BirthRegistrationInput,
  BirthType,
  DeathRegistrationInput,
  EducationType,
  LocationType,
  RegisterBirthDeclarationMutation,
  RegisterDeathDeclarationMutation
} from './gateway'
import { omit } from 'lodash'
import { sub } from 'date-fns'
import { GATEWAY_HOST } from './constants'
import { MARK_AS_REGISTERED_QUERY, MARK_DEATH_AS_REGISTERED } from './queries'
import { fetchDeathRegistration, fetchRegistration } from './declare'

// Hospital notifications have a limited set of data in them
// This part amends the missing fields if needed
export async function createBirthRegistrationDetailsForNotification(
  createdAt: Date,
  location: Location,
  declaration: Awaited<ReturnType<typeof fetchRegistration>>
) {
  const MINUTES_15 = 1000 * 60 * 15

  if (!declaration.registration) {
    throw new Error(`declaration.registration did not exist for declaration`)
  }

  if (!declaration.child) {
    throw new Error(`declaration.child did not exist for declaration`)
  }

  if (!declaration.child.birthDate) {
    throw new Error(`declaration.child.birthDate did not exist for declaration`)
  }

  if (!declaration.mother) {
    throw new Error(`declaration.mother did not exist for declaration`)
  }

  return {
    createdAt,
    registration: {
      contact: declaration.registration.contact,
      contactPhoneNumber: declaration.registration.contactPhoneNumber,
      contactRelationship: 'Mother',
      _fhirID: declaration.registration.id,
      trackingId: declaration.registration.trackingId,
      status: [
        {
          // This is needed to avoid the following error from Metrics service:
          // Error: No time logged extension found in task, task ID: 93c59687-b3d1-4d58-91c3-6888f1987f2a
          timeLoggedMS: Math.round(MINUTES_15 + MINUTES_15 * Math.random()),
          timestamp: createdAt.toISOString()
        }
      ],
      attachments: [],
      draftId: declaration.id
    },
    child: {
      name: declaration.child.name,
      gender: declaration.child.gender,
      birthDate: declaration.child.birthDate,
      multipleBirth: declaration.child.multipleBirth,
      _fhirID: declaration.child.id
    },
    birthType: BirthType.Single,
    weightAtBirth: Math.round((2.5 + 2 * Math.random()) * 10) / 10,
    attendantAtBirth: AttendantType.Physician,
    eventLocation: {
      address: createAddressInput(location, AddressType.CrvsOffice),
      type: LocationType.CrvsOffice
    },
    mother: {
      nationality: 'FAR',
      identifier: declaration.mother.identifier,
      name: declaration.mother.name,
      occupation: 'Bookkeeper',
      educationalAttainment: EducationType.LowerSecondaryIsced_2,
      dateOfMarriage: sub(new Date(declaration.child.birthDate), { years: 2 })
        .toISOString()
        .split('T')[0],
      birthDate: sub(new Date(declaration.child.birthDate), { years: 20 })
        .toISOString()
        .split('T')[0],
      maritalStatus: declaration.mother.maritalStatus,
      address: createAddressInput(location, AddressType.PrivateHome),
      _fhirID: declaration.mother.id
    },
    _fhirIDMap: declaration._fhirIDMap
  }
}

// Cleans unnecessary fields from declaration data to make it an input type
export function createRegistrationDetails(
  createdAt: Date,
  declaration:
    | Awaited<ReturnType<typeof fetchDeathRegistration>>
    | Awaited<ReturnType<typeof fetchRegistration>>
) {
  const MINUTES_15 = 1000 * 60 * 15

  const withIdsRemoved = omit(
    idsToFHIRIds(declaration, [
      'registration.id',
      'child.id',
      'mother.id',
      'father.id',
      'eventLocation.id',
      'informant.id',
      'informant.individual.id',
      'deceased.id'
    ]),
    ['registration.registrationNumber', 'registration.type']
  )

  if (withIdsRemoved.__typename === 'BirthRegistration') {
    delete withIdsRemoved.history
  }

  delete withIdsRemoved.id

  const data = {
    ...withIdsRemoved,
    eventLocation: {
      _fhirID: withIdsRemoved.eventLocation?._fhirID
    },
    registration: {
      ...withIdsRemoved.registration,
      status: [
        {
          // This is needed to avoid the following error from Metrics service:
          // Error: No time logged extension found in task, task ID: 93c59687-b3d1-4d58-91c3-6888f1987f2a
          timeLoggedMS: Math.round(MINUTES_15 + MINUTES_15 * Math.random()),
          timestamp: createdAt.toISOString()
        }
      ]
    }
  }

  return data
}

export async function markAsRegistered(
  user: User,
  id: string,
  details: BirthRegistrationInput
) {
  const { token, username } = user

  const requestStart = Date.now()
  const reviewDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation-id': `registration-${id}`
    },
    body: JSON.stringify({
      query: MARK_AS_REGISTERED_QUERY,
      variables: {
        id,
        details
      }
    })
  })
  const requestEnd = Date.now()
  const result = (await reviewDeclarationRes.json()) as {
    errors: any[]
    data: RegisterBirthDeclarationMutation
  }
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2))
    console.error(JSON.stringify(details))
    throw new Error('Birth declaration was not registered')
  }

  const data = result.data.markBirthAsRegistered

  log(
    'Declaration',
    data.id,
    'is now reviewed by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )

  return data
}

export async function markDeathAsRegistered(
  user: User,
  id: string,
  details: DeathRegistrationInput
) {
  const { token, username } = user

  const requestStart = Date.now()
  const reviewDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation-id': `registration-${id}`
    },
    body: JSON.stringify({
      query: MARK_DEATH_AS_REGISTERED,
      variables: {
        id,
        details
      }
    })
  })
  const requestEnd = Date.now()
  const result = (await reviewDeclarationRes.json()) as {
    data: RegisterDeathDeclarationMutation
    errors: any[]
  }
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2))
    console.error(JSON.stringify(details))

    throw new Error('Death declaration was not registered')
  }
  const data = result.data.markDeathAsRegistered
  log(
    'Declaration',
    data.id,
    'is now reviewed by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )

  return data
}
