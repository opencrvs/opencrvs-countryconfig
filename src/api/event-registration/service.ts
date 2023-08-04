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
import {
  getTaskResource,
  getTrackingIdFromTaskResource
} from '@countryconfig/utils'

function generateRegistrationNumber(trackingId: string): string {
  /* adding current year */
  let brn = new Date().getFullYear().toString()

  /* appending tracking id */
  brn = brn.concat(trackingId)

  return brn
}

export async function createUniqueRegistrationNumberFromBundle(
  bundle: fhir.Bundle
) {
  const taskResource = getTaskResource(bundle)

  if (!taskResource || !taskResource.extension) {
    throw new Error(
      'Failed to validate registration: could not find task resource in bundle or task resource had no extensions'
    )
  }

  const trackingId = getTrackingIdFromTaskResource(taskResource)

  return {
    trackingId,
    registrationNumber: generateRegistrationNumber(trackingId)
  }
}
