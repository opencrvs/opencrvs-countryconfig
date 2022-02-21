import fetch from 'node-fetch'
import { User } from './users'

import { log, RecursiveRequired } from './util'
import { BIRTH_REGISTRATION_FIELDS, DEATH_REGISTRATION_FIELDS } from './declare'
import { Location } from './location'
import { createAddressInput } from './address'
import {
  AddressType,
  AttendantType,
  BirthRegistration,
  BirthRegistrationInput,
  BirthRegPresence,
  BirthType,
  DeathRegistration,
  DeathRegistrationInput,
  EducationType,
  LocationType
} from './gateway'
import { get, omit, set } from 'lodash'
import { sub } from 'date-fns'

// Hospital notifications have a limited set of data in them
// This part amends the missing fields if needed
export async function createBirthRegistrationDetailsForNotification(
  createdAt: Date,
  location: Location,
  declaration: RecursiveRequired<BirthRegistration>
) {
  const MINUTES_15 = 1000 * 60 * 15

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
    presentAtBirthRegistration: BirthRegPresence.BothParents,
    child: {
      name: declaration.child.name,
      gender: declaration.child.gender,
      birthDate: declaration.child.birthDate,
      multipleBirth: declaration.child.multipleBirth,
      _fhirID: declaration.child.id
    },
    birthType: BirthType.Single,
    weightAtBirth: Math.round(2.5 + 2 * Math.random() * 10) / 10,
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
      maritalStatus: declaration.mother.maritalStatus,
      address: createAddressInput(location, AddressType.PrivateHome),
      _fhirID: declaration.mother.id
    },
    _fhirIDMap: declaration._fhirIDMap
  }
}

function IdsToFHIRIds(target: Record<string, any>, keys: string[]) {
  return keys.reduce((memo, key) => {
    const value = get(memo, key)

    if (value === undefined) {
      return memo
    }

    const fhirKey = key
      .split('.')
      .slice(0, -1)
      .concat('_fhirID')
      .join('.')
    return set(set(memo, fhirKey, value), key, undefined)
  }, target)
}

// Cleans unnecessary fields from declaration data to make it an input type
export function createRegistrationDetails(
  createdAt: Date,
  declaration: BirthRegistration | DeathRegistration
) {
  const MINUTES_15 = 1000 * 60 * 15
  // console.log('got', JSON.stringify(declaration))

  const withIdsRemoved = omit(
    IdsToFHIRIds(declaration, [
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

  delete withIdsRemoved.id

  const data = {
    ...withIdsRemoved,
    eventLocation: {
      _fhirID: withIdsRemoved.eventLocation._fhirID
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
  // console.log('made', JSON.stringify(data))

  return data
}

export async function markAsRegistered(
  user: User,
  id: string,
  details: BirthRegistrationInput
) {
  const { token, username } = user

  const requestStart = Date.now()
  const reviewDeclarationRes = await fetch('http://localhost:7070/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `registration-${id}`
    },
    body: JSON.stringify({
      query: `
        mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
          markBirthAsRegistered(id: $id, details: $details) {
            ${BIRTH_REGISTRATION_FIELDS}
        }
      }`,
      variables: {
        id,
        details
      }
    })
  })
  const requestEnd = Date.now()
  const result = await reviewDeclarationRes.json()
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2))
    console.error(JSON.stringify(details))
    throw new Error('Birth declaration was not registered')
  }
  const data = result.data.markBirthAsRegistered as BirthRegistration

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
  const reviewDeclarationRes = await fetch('http://localhost:7070/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `registration-${id}`
    },
    body: JSON.stringify({
      query: `
      mutation submitMutation($id: ID!, $details: DeathRegistrationInput) {
        markDeathAsRegistered(id: $id, details: $details) {
          ${DEATH_REGISTRATION_FIELDS}
        }
      }`,
      variables: {
        id,
        details
      }
    })
  })
  const requestEnd = Date.now()
  const result = await reviewDeclarationRes.json()
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2))
    console.error(JSON.stringify(details))

    throw new Error('Death declaration was not registered')
  }
  const data = result.data.markDeathAsRegistered as DeathRegistration
  log(
    'Declaration',
    data.id,
    'is now reviewed by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )

  return data
}
