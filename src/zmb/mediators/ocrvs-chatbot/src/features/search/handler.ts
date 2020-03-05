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
import * as Hapi from 'hapi'
import { logger } from '@ocrvs-chatbot-mediator/logger'
import {
  createSearchCriteria,
  ISearchParams,
  searchRegistrations
} from '@ocrvs-chatbot-mediator/features/search/service'

export async function searchHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const searchParams = request.payload as ISearchParams
  const searchCriteria = await createSearchCriteria(
    { Authorization: request.headers.authorization },
    searchParams
  )
  logger.info(
    `Search parameters in chatbot mediator: ${JSON.stringify(searchCriteria)}`
  )
  const searchResults = await searchRegistrations(
    { Authorization: request.headers.authorization },
    searchCriteria
  )
  return h.response({ results: searchResults.hits.hits }).code(201)
}
