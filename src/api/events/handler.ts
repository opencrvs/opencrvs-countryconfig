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
import { createHash } from 'crypto'
import * as Hapi from '@hapi/hapi'
import { eventConfigs } from '@countryconfig/events'
import { sendInformantNotification } from '../notification/informantNotification'
import { ActionConfirmationRequest } from '../registration'

/**
 * The configuration is compiled into this service, so hashing it once at
 * startup gives an entity tag that every replica agrees on and that changes
 * exactly when the configuration does, rollbacks included.
 */
const eventConfigsEtag = createHash('sha256')
  .update(JSON.stringify(eventConfigs))
  .digest('base64url')

export function getEventsHandler(_: Hapi.Request, h: Hapi.ResponseToolkit) {
  // 304 when the caller already has this configuration, sparing it the
  // transfer and the parse. Callers without a tag get the full response.
  return (
    h.entity({ etag: eventConfigsEtag }) ?? h.response(eventConfigs).code(200)
  )
}

export async function onCustomActionHandler(
  _: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  return h.response().code(200)
}

/**
 * This catch-all action route will receive event actions with `Content-Type: application/json`
 */
export async function onAnyActionHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string
  const event = request.payload

  await sendInformantNotification({ event, token })

  return h.response().code(200)
}
