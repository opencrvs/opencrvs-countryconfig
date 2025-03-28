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
import { env } from '@countryconfig/environment'
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { logger } from '@countryconfig/logger'
import * as Hapi from '@hapi/hapi'
import { createClient } from '@opencrvs/toolkit/api'
import { EventDocument } from '@opencrvs/toolkit/events'
import uuid from 'uuid'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

function generateRegistrationNumber() {
  return nanoid()
}

export function getCustomEventsHandler(
  _: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response([tennisClubMembershipEvent, birthEvent]).code(200)
}

export function onAnyActionHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // This catch-all event route can receive either legacy FHIR events with `Content-Type: application/fhir+json` or new events with `Content-Type: application/json`
  console.log(request.params.event, request.params.action)
  console.log(request.payload)
  console.log('RES CIHAN2', generateRegistrationNumber())
  console.log('RES CIHAN2', generateRegistrationNumber())
  console.log('RES CIHAN2', generateRegistrationNumber())
  return h.response().code(200)
}

export async function onRegisterHandler(
  _: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // const event = EventDocument.parse(request.payload)
  // const client = createClient(
  //   env.GATEWAY_URL + '/events',
  //   request.headers.authorization
  // )

  // logger.info(`Confirming registration ${event.id}`)
  // await client.event.actions.register.accept.mutate({
  //   transactionId: uuid.v4(),
  //   eventId: event.id,
  //   data: {
  //     status: 'CONFIRMED'
  //   }
  // })
  // logger.info(`Registration ${event.id} confirmed`)

  return h
    .response({ registrationNumber: generateRegistrationNumber() })
    .code(200)
}
