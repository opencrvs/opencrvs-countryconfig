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
import { GATEWAY_URL } from '@countryconfig/constants'
import { URL } from 'url'
import fetch from 'node-fetch'

const GRAPHQL_GATEWAY_URL = new URL('graphql', GATEWAY_URL)

/** Communicates with opencrvs-core's GraphQL gateway */
const post = async <T = any>({
  query,
  variables,
  headers
}: {
  query: string
  variables: Record<string, any>
  headers: Record<string, any>
}) => {
  const response = await fetch(GRAPHQL_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify({
      variables,
      query
    })
  })

  if (!response.ok) {
    throw new Error(`not ok: ${await response.text()}`)
  }

  return response.json() as Promise<{ data: T }>
}

export const confirmRegistration = (
  id: string,
  variables: {
    childIdentifiers?: Array<{ type: string; value: string }>
    registrationNumber: string
  },
  { headers }: { headers: Record<string, any> }
) =>
  post({
    query: /* GraphQL */ `
      mutation confirmRegistration(
        $id: ID!
        $details: ConfirmRegistrationInput!
      ) {
        confirmRegistration(id: $id, details: $details)
      }
    `,
    variables: {
      id,
      details: {
        identifiers: variables.childIdentifiers,
        registrationNumber: variables.registrationNumber
      }
    },
    headers
  })

export const rejectRegistration = (
  id: string,
  { reason, comment }: { reason: string; comment: string },
  { headers }: { headers: Record<string, any> }
) =>
  post({
    query: /* GraphQL */ `
      mutation rejectRegistration(
        $id: ID!
        $details: RejectRegistrationInput!
      ) {
        rejectRegistration(id: $id, details: $details)
      }
    `,
    variables: {
      id,
      details: {
        reason,
        comment
      }
    },
    headers
  })

type GetUser = {
  getUser: {
    primaryOffice: {
      hierarchy: Array<{
        id: string
      }>
    }
  }
}

export const fetchUserLocationHierarchy = async (
  userId: string,
  { headers }: { headers: Record<string, any> }
) => {
  const res = await post<GetUser>({
    query: /* GraphQL */ `
      query fetchUser($userId: String!) {
        getUser(userId: $userId) {
          primaryOffice {
            hierarchy {
              id
            }
          }
        }
      }
    `,
    variables: { userId },
    headers
  })
  return res.data.getUser.primaryOffice.hierarchy.map(({ id }) => id)
}
