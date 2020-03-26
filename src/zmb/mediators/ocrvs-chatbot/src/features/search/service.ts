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
import fetch from 'node-fetch'
import { SEARCH_URL } from '@ocrvs-chatbot-mediator/constants'
import { getEventLocationId } from '@ocrvs-chatbot-mediator/utils/locations'

export interface ISearchParams {
  child: {
    firstName: string
    lastName: string
    gender: string
  }
  mother: {
    firstName: string
    lastName: string
  }
  eventLocation: {
    name: string
  }
}

export interface ISearchCriteria {
  applicationLocationId?: string
  eventLocationId: string
  gender: string
  nameCombinations: INameCombination[]
  status?: string[]
  type: string[]
  trackingId?: string
  contactNumber?: string
  name?: string
  event: string
  registrationNumber?: string
  sort?: string
  size?: number
  from?: number
  createdBy?: string
}

export interface INameCombination {
  name: string
  fields: string
}

export interface IAuthHeader {
  Authorization: string
}

export async function createSearchCriteria(
  authHeader: IAuthHeader,
  params: ISearchParams
): Promise<ISearchCriteria> {
  const eventLocationId = await getEventLocationId(
    authHeader,
    params.eventLocation.name
  )
  const searchCriteria: ISearchCriteria = {
    gender: params.child.gender,
    nameCombinations: [
      {
        name: params.child.firstName,
        fields: 'CHILD_FIRST'
      },
      {
        name: params.child.lastName,
        fields: 'CHILD_FAMILY'
      },
      {
        name: params.mother.firstName,
        fields: 'MOTHER_FIRST'
      },
      {
        name: params.mother.lastName,
        fields: 'MOTHER_FAMILY'
      }
    ],
    eventLocationId,
    event: 'Birth',
    type: ['birth-application']
  }
  return searchCriteria
}

export async function searchRegistrations(
  authHeader: IAuthHeader,
  criteria: ISearchCriteria
): Promise<any> {
  return fetch(`${SEARCH_URL}search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader
    },
    body: JSON.stringify(criteria)
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(
        new Error(`Search request failed: ${error.message}`)
      )
    })
}
