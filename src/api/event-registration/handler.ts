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
import { logger } from '@countryconfig/logger'
import { CONFIRM_REGISTRATION_URL } from '@countryconfig/constants'
import { createUniqueRegistrationNumberFromBundle } from '@countryconfig/api/event-registration/service'
import { badImplementation } from '@hapi/boom'

export async function eventRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // This synchronous API exists as it is the final step before legal registration of an event.

  // Some countries desire to create multiple identifiers for citizens at the point of registration using external systems.
  // Some countries wish to integrate with another legacy system just before registration.  A synchronous 3rd party system can be integrated at this point.
  // Some countries wish to customise the registration number format.  The registration number can be created at this point.

  // Some countries use sequential numbering for registration numbers.  While it is possible to create
  // that functionality here, we strongly discourage that approach and advise our unique alphanumeric ID format using the Tracking ID.
  // The reason is, under times of high traffic, it is likely that sequential number generation can
  // slow the performance of the service.  In a such a case a queue must be implemented here.
  try {
    const bundle = request.payload as fhir.Bundle

    const webHookResponse = await createUniqueRegistrationNumberFromBundle(
      bundle
    )

    fetch(CONFIRM_REGISTRATION_URL, {
      method: 'POST',
      body: JSON.stringify(webHookResponse),
      headers: request.headers
    })
  } catch (err) {
    // IF ANY ERROR OCCURS IN THIS API, THE REGISTRATION WILL BE REJECTED AND MUST BE RE-SUBMITTED BY A REGISTRAR ONCE THE ISSUE IS RESOLVED
    logger.error(err)

    const boomError = badImplementation()
    // A MANDATORY BOOM ERROR MSG MUST BE RETURNED AS IT WILL APPEAR AS THE REASON FOR REJECTION
    boomError.output.payload.msg = `Could not generate registration number in country configuration due to error: ${err}`
    throw boomError
  }

  return h.response().code(202)
}
