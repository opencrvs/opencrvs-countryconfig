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
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { deathEvent } from '@countryconfig/form/v2/death'
import * as Hapi from '@hapi/hapi'

export function getCustomEventsHandler(
  _: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h
    .response([tennisClubMembershipEvent, birthEvent, deathEvent])
    .code(200)
}

export function onAnyActionHandler(_: Hapi.Request, h: Hapi.ResponseToolkit) {
  // This catch-all event route can receive either legacy FHIR events with `Content-Type: application/fhir+json` or new events with `Content-Type: application/json`
  return h.response().code(200)
}
