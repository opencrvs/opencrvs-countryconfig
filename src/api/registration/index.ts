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
import { generateRegistrationNumber } from './registrationNumber'
import { createClient } from '@opencrvs/toolkit/api'
import { ActionInput } from '@opencrvs/toolkit/events'
import { GATEWAY_URL } from '@countryconfig/constants'
import { v4 as uuidv4 } from 'uuid'

interface ActionConfirmationRequest extends Hapi.Request {
  payload: {
    actionId: string
    event: {
      id: string
    }
    action: ActionInput
  }
}

/* eslint-disable no-unused-vars */

/**
 * Function which is called when an event registration is created.
 * This is an example of a event action confirmation API handler.
 *
 * Event action confirmation APIs are used to accept or rejected a requested action. These kinds of APIs have 3 valid HTTP status codes for the response:
 * - HTTP 200: Accept the action. In this case, the action will be accepted right away.
 * - HTTP 400: Reject the action. In this case, the action will be rejected right away.
 * - HTTP 202: Intercept action, and accept/reject later. In this case the action will end up in 'Requested' state, i.e. waiting for final acception or rejection.
 *             With interception, the action is expected to be accepted or rejected at a later time with the matching `accept` or `reject` API.
 *             With the interception flow, you will need to temporarily store the token, actionId and eventId to use them later when accepting or rejecting the action.
 *
 * @param {ActionConfirmationRequest} request - The request object.
 * @param {Hapi.ResponseToolkit} h - The response toolkit.
 * @returns {Hapi.Response} The response object. Should return HTTP 200, 202 or 400. With HTTP 200, the payload should contain the generated registration number.
 */
export function onRegisterHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string
  const actionId = request.payload.actionId
  const eventId = request.payload.event.id
  const action = request.payload.action

  return h
    .response({ registrationNumber: generateRegistrationNumber() })
    .code(200)
}

/*
 * This is an example of asynchronously accepting.
 * This should only be used when an action is in 'Requested' state, after returning HTTP 202 for the initial notification request.
 */
async function acceptRequestedRegistration(
  token: string,
  eventId: string,
  actionId: string,
  action: ActionInput
) {
  const url = new URL('events', GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  const event = await client.event.actions.register.accept.mutate({
    ...action,
    transactionId: uuidv4(),
    eventId,
    actionId,
    registrationNumber: generateRegistrationNumber()
  })

  return event
}

/*
 * This is an example of asynchronously rejecting.
 * This should only be done when an action is in 'Requested' state, after returning HTTP 202 for the initial notification request.
 */
async function rejectRequestedRegistration(
  token: string,
  eventId: string,
  actionId: string
) {
  const url = new URL('events', GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  const event = await client.event.actions.register.reject.mutate({
    transactionId: uuidv4(),
    eventId,
    actionId
  })

  return event
}
