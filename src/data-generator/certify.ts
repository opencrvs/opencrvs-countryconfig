import fetch from 'node-fetch'
import { User } from './users'

import { log } from './util'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  BirthRegistration,
  BirthRegistrationInput,
  DeathRegistration
} from './gateway'
import { omit } from 'lodash'

export function createBirthCertificationDetails(
  createdAt: Date,
  declaration: BirthRegistration
) {
  const withIdsRemoved = omit(declaration, [])
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
  const withIdsRemoved = omit(declaration, [
    'id',
    'eventLocation.id',
    'mother.id',
    'father.id',
    'informant.individual.id',
    'informant.id',
    'deceased.id',
    'registration.id',
    'registration.type'
  ])

  return {
    ...withIdsRemoved,
    registration: {
      ...withIdsRemoved.registration,
      status: [
        {
          timestamp: createdAt.toISOString(),
          timeLoggedMS: Math.round(9999 * Math.random())
        }
      ]
    }
  }
}

export async function markAsCertified(
  id: string,
  user: User,
  details: BirthRegistrationInput
) {
  const { token, username } = user

  const requestStart = Date.now()

  const certifyDeclarationRes = await fetch('http://localhost:7070/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `registration-${id}`
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
    details.registration?.certificates?.forEach(cert => {
      if (cert) {
        cert.data = 'REDACTED'
      }
    })
    console.error(JSON.stringify(details))
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

  const certifyDeclarationRes = await fetch('http://localhost:7070/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-correlation': `registration-${id}`
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
