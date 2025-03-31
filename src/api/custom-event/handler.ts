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
import * as Hapi from '@hapi/hapi'
import { customAlphabet } from 'nanoid'

export function getCustomEventsHandler(
  _: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  return h.response([tennisClubMembershipEvent, birthEvent]).code(200)
}

export function onAnyActionHandler(_: Hapi.Request, h: Hapi.ResponseToolkit) {
  // This catch-all event route can receive either legacy FHIR events with `Content-Type: application/fhir+json` or new events with `Content-Type: application/json`
  return h.response().code(200)
}

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 12)

/**
 * Generates a custom registration number for events. You may edit this function to generate a custom registration number.
 * @returns {string} Registration number for the event.
 */
function generateRegistrationNumber(): string {
  return nanoid()
}

export function onRegisterHandler(_: Hapi.Request, h: Hapi.ResponseToolkit) {
  return h
    .response({ registrationNumber: generateRegistrationNumber() })
    .code(200)
}
