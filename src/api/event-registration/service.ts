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
    registrationNumber: generateRegistrationNumber(trackingId),
    ...(taskResource.code?.coding?.[0].code === 'BIRTH' && {
      // Some countries desire to create multiple identifiers for citizens at the point of birth registration using external systems.
      // OpenCRVS supports up to 3 additional, custom identifiers that can be created
      childIdentifiers: [
        {
          type: 'BIRTH_CONFIGURABLE_IDENTIFIER_1',
          value: ''
        },
        {
          type: 'BIRTH_CONFIGURABLE_IDENTIFIER_2',
          value: ''
        },
        {
          type: 'BIRTH_CONFIGURABLE_IDENTIFIER_3',
          value: ''
        }
      ]
    })
  }
}
