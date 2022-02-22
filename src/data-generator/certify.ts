import fetch from 'node-fetch'
import { User } from './users'

import { idsToFHIRIds, log } from './util'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  BirthRegistration,
  BirthRegistrationInput,
  DeathRegistration
} from './gateway'
import { cloneDeep, omit } from 'lodash'
import { GATEWAY_HOST } from './constants'

export function createBirthCertificationDetails(
  createdAt: Date,
  declaration: BirthRegistration
) {
  const withIdsRemoved = idsToFHIRIds(
    omit(declaration, ['id', 'eventLocation.id', 'registration.type']),
    ['id', 'mother.id', 'father.id', 'child.id', 'registration.id']
  )

  return {
    ...withIdsRemoved,
    registration: {
      ...withIdsRemoved.registration,
      status: [
        {
          timestamp: createdAt.toISOString()
        }
      ],
      certificates: [
        {
          hasShowedVerifiedDocument: false,
          payments: [
            {
              type: 'MANUAL',
              total: 10,
              amount: 10,
              outcome: 'COMPLETED',
              date: createdAt
            }
          ],
          data:
            'data:application/pdf;base64,' +
            readFileSync(join(__dirname, './signature.pdf')).toString('base64'),
          collector: {
            relationship: 'MOTHER'
          }
        }
      ]
    }
  }
}

export function createDeathCertificationDetails(
  createdAt: Date,
  declaration: DeathRegistration
) {
  const withIdsRemoved = idsToFHIRIds(
    omit(declaration, ['id', 'eventLocation.id', 'registration.type']),
    [
      'id',
      'mother.id',
      'father.id',
      'informant.individual.id',
      'informant.id',
      'deceased.id',
      'registration.id'
    ]
  )

  const data = {
    ...withIdsRemoved,
    deceased: {
      ...withIdsRemoved.deceased,
      identifier: withIdsRemoved.deceased.identifier.filter(
        ({ type }: { type: string }) => type != 'DEATH_REGISTRATION_NUMBER'
      )
    },
    registration: {
      ...withIdsRemoved.registration,
      draftId: withIdsRemoved._fhirIDMap.composition,
      certificates: [
        {
          hasShowedVerifiedDocument: false,
          data: 'data:application/pdf;base64,' + '', //readFileSync(join(__dirname, './signature.pdf')).toString('base64'),
          collector: {
            relationship: 'INFORMANT'
          }
        }
      ],
      status: [
        {
          timestamp: createdAt.toISOString(),
          timeLoggedMS: Math.round(9999 * Math.random())
        }
      ]
    }
  }

  return data
}

function withoutCertData(data: BirthRegistrationInput) {
  const details = cloneDeep(data)
  details.registration?.certificates?.forEach(cert => {
    if (cert) {
      cert.data = 'REDACTED'
    }
  })
  return details
}

export async function markAsCertified(
  id: string,
  user: User,
  details: BirthRegistrationInput
) {
  const { token, username } = user

  const requestStart = Date.now()
  console.log(JSON.stringify(withoutCertData(details)))

  const certifyDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `certification-${id}`
    },
    body: JSON.stringify({
      query: `
        mutation submitMutation($id: ID!, $details: BirthRegistrationInput!) {
          markBirthAsCertified(id: $id, details: $details)
        }`,
      variables: {
        id: id,
        details
      }
    })
  })
  const requestEnd = Date.now()
  const result = await certifyDeclarationRes.json()
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2))

    console.error(JSON.stringify(withoutCertData(details)))
    throw new Error('Birth declaration could not be certified')
  }

  log(
    'Birth declaration',
    result.data.markBirthAsCertified,
    'is now certified by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )

  return result.data.markBirthAsCertified
}

export async function markDeathAsCertified(
  id: string,
  user: User,
  details: BirthRegistrationInput
) {
  const { token, username } = user

  const requestStart = Date.now()

  const certifyDeclarationRes = await fetch(GATEWAY_HOST, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `death-certification-${id}`
    },
    body: JSON.stringify({
      query: `
        mutation submitMutation($id: ID!, $details: DeathRegistrationInput!) {
          markDeathAsCertified(id: $id, details: $details)
        }`,
      variables: {
        id,
        details
      }
    })
  })
  const requestEnd = Date.now()
  const result = await certifyDeclarationRes.json()
  if (result.errors) {
    console.error(JSON.stringify(result.errors, null, 2))
    details.registration?.certificates?.forEach(cert => {
      if (cert?.data) {
        cert.data = 'REDACTED'
      }
    })
    console.error(JSON.stringify(details))
    throw new Error('Death declaration could not be certified')
  }

  log(
    'Death declaration',
    result.data.markDeathAsCertified,
    'is now certified by',
    username,
    `(took ${requestEnd - requestStart}ms)`
  )

  return result.data.markDeathAsCertified
}
