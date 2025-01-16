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
import * as Hapi from '@hapi/hapi'
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { EventDocument } from '@opencrvs/toolkit/events'
import { birthEvent } from '@countryconfig/form/v2/birth'

export function getCustomEventsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response([tennisClubMembershipEvent, birthEvent]).code(200)
}

export function onRegisterHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = EventDocument.parse(request.payload)
  console.log(event)
  return h.response().code(200)
}

export function onAnyActionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  console.log(request.params.event, request.params.action)
  const event = EventDocument.parse(request.payload)
  console.log(event)
  return h.response().code(200)
}
