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
import { logger } from '@countryconfig/logger'
import { createUniqueRegistrationNumberFromBundle } from '@countryconfig/api/event-registration/service'
import { badImplementation } from '@hapi/boom'
import {
  confirmRegistration
  // rejectRegistration
} from '@countryconfig/utils/gateway-api'

export async function eventRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  // This synchronous API exists as it is the final step before legal registration of an event.

  // Some countries desire to create multiple identifiers for citizens at the point of birth registration using external systems.
  // Some countries wish to integrate with another legacy system just before registration.  A synchronous 3rd party system can be integrated at this point.
  // Some countries wish to customise the registration number format.  The registration number can be created at this point.

  // Some countries use sequential numbering for registration numbers.  While it is possible to create
  // that functionality here, we strongly discourage that approach and advise our unique alphanumeric ID format using the Tracking ID.
  // The reason is, under times of high traffic, it is likely that sequential number generation can
  // slow the performance of the service.  In a such a case a queue must be implemented here.
  try {
    const bundle = request.payload as fhir.Bundle

    const eventRegistrationIdentifiersResponse =
      createUniqueRegistrationNumberFromBundle(bundle)

    await confirmRegistration(
      eventRegistrationIdentifiersResponse.compositionId,
      eventRegistrationIdentifiersResponse,
      {
        headers: request.headers
      }
    )
  } catch (err) {
    // If the confirm registration endpoint throws an error, the registration will be retried through country-config
    // If you don't want the registration to retry, you can call `rejectRegistration` from here and return 202 Accepted

    // await confirmRegistration(
    //   eventRegistrationIdentifiersResponse.compositionId,
    //   {
    //     reason: 'other', // Refer to the GraphQL schema for other options
    //     comment: 'The comment that will be visible on audit log.'
    //   },
    //   { headers: request.headers }
    // )

    logger.error(err)

    const boomError = badImplementation()
    // A MANDATORY BOOM ERROR MSG MUST BE RETURNED AS IT WILL APPEAR AS THE REASON FOR REJECTION
    boomError.output.payload.msg = `Could not generate registration number in country configuration due to error: ${err}`
    throw boomError
  }

  return h.response().code(202)
}
