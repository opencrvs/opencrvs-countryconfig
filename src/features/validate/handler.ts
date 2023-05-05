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
import * as Hapi from '@hapi/hapi'
import fetch from 'node-fetch'
import * as Pino from 'pino'
import { CONFIRM_REGISTRATION_URL } from '@countryconfig/constants'
import { createWebHookResponseFromBundle } from '@countryconfig/features/validate/service'
import { badImplementation } from '@hapi/boom'

const logger = Pino()

export async function validateRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const bundle = request.payload as fhir.Bundle

    const webHookResponse = await createWebHookResponseFromBundle(bundle)

    fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify(webHookResponse),
      headers: request.headers
    })
  } catch (err) {
    logger.error(err)

    const boomError = badImplementation()
    boomError.output.payload.boomCustromMessage = `Could not generate registration number in country configuration due to error: ${err}`
    throw boomError
  }

  return h.response().code(202)
}
