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

export interface ISearchParams {
  child: {
    first_names_en?: string
    last_name_en: string
    sex?: 'male' | 'female' | 'unknown'
  }
  father: {
    first_names_en?: string
    last_name_en: string
    nid?: string
  }
  mother: {
    first_names_en?: string
    last_name_en: string
    nid?: string
  }
}

export interface ISearchCriteria {
  applicationLocationId?: string
  status?: string[]
  type?: string[]
  trackingId?: string
  contactNumber?: string
  name?: string
  specificName?: string
  registrationNumber?: string
  sort?: string
  size?: number
  from?: number
  createdBy?: string
}

export interface IAuthHeader {
  Authorization: string
}

export function createSearchCriteria(params: ISearchParams): ISearchCriteria {
  const searchCriteria: ISearchCriteria = {}
  if (params.child.first_names_en) {
    searchCriteria.name = params.child.first_names_en
    searchCriteria.specificName = 'CHILD'
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
