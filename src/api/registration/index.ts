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
import {
  ActionInput,
  ActionType,
  aggregateActionDeclarations,
  deepMerge,
  EventDocument,
  getPendingAction
} from '@opencrvs/toolkit/events'
import { GATEWAY_URL } from '@countryconfig/constants'
import { v4 as uuidv4 } from 'uuid'
import { sendInformantNotification } from '../notification/informantNotification'
import { logger } from '@countryconfig/logger'
import { Event } from '@countryconfig/events/utils'
import { readCSVToJSON } from '@countryconfig/utils'
import { deriveEffectiveRegistrationPlaceId as deriveEffectiveRegistrationPlaceIdFromLocations } from './locationMapper'
import { resolveRegistrationLocationPrefix } from './registrationNumber'

export interface ActionConfirmationRequest extends Hapi.Request {
  payload: EventDocument
}

type SeedLocation = {
  id: string
  name: string
  partOf: string
  locationType: string
}

let locationsCache: SeedLocation[] = []
let locationsCacheReady = false

/* eslint-disable no-unused-vars */

/**
 * Handler for event registration confirmation.
 *
 * This function is called when an event registration is initiated and demonstrates
 * how to implement an action confirmation handler for the REGISTER action type.
 *
 * Action confirmation handlers support three response patterns:
 *
 * - HTTP 200: Immediately accept the action. For registration actions, the response
 *   must include a registrationNumber in the payload: { registrationNumber: "..." }
 *
 * - HTTP 400: Immediately reject the action. The action will be marked as rejected.
 *
 * - HTTP 202: Defer the decision (asynchronous flow). The action enters a 'Requested' state
 *   until it is later explicitly accepted or rejected. When using this approach, you must
 *   store the token, actionId, eventId and action payload to use with the accept/reject API calls later.
 *
 * For registration actions specifically, when accepting asynchronously, you must provide
 * a registration number as shown in the acceptRequestedRegistration example below.
 *
 * @param {ActionConfirmationRequest} request - The request object.
 * @param {Hapi.ResponseToolkit} h - The response toolkit.
 * @returns {Hapi.Response} The response object. Should return HTTP 200, 202 or 400. With HTTP 200, the payload should contain the generated registration number.
 */
export async function onRegisterHandler(
  request: ActionConfirmationRequest,
  h: Hapi.ResponseToolkit
) {
  const token = request.auth.artifacts.token as string
  const event = request.payload
  const eventId = event.id
  const action = getPendingAction(event.actions)
  const registrationLocationId =
    getDeclaredLocationId(event) ?? normalizeLocationId(action?.createdAtLocation)

  await ensureLocationsCache()

  const locationPrefix = resolveRegistrationLocationPrefix(
    registrationLocationId,
    locationsCache
  )

  if (!locationPrefix) {
    logger.warn(
      {
        eventId,
        eventType: event.type,
        registrationLocationId
      },
      'Falling back to default registration number prefix'
    )
  }

  const registrationNumber = generateRegistrationNumber({
    eventType: event.type,
    registrationLocationId,
    locations: locationsCache,
    locationPrefix
  })

  if (event.type === Event.Birth) {
    // Defer acceptance so the declaration patch (effective date/place) can be written atomically.
    acceptBirthRegistration({ token, eventId, action, event, registrationNumber }).catch(
      (err) => logger.error(err)
    )
    return h.response().code(202)
  }

  await sendInformantNotification({ event, token, registrationNumber })

  return h.response({ registrationNumber }).code(200)
}

async function acceptBirthRegistration({
  token,
  eventId,
  action,
  event,
  registrationNumber
}: {
  token: string
  eventId: string
  action: ReturnType<typeof getPendingAction>
  event: EventDocument
  registrationNumber: string
}) {
  const url = new URL('events', GATEWAY_URL).toString()
  const client = createClient(url, `Bearer ${token}`)

  const currentDeclaration = deepMerge(
    aggregateActionDeclarations(event),
    action?.declaration ?? {}
  )
  const existingEffectiveRegistrationDate =
    currentDeclaration['child.effectiveRegistrationDate']
  const existingEffectiveRegistrationPlaceId =
    currentDeclaration['child.effectiveRegistrationPlaceId']
  const derivedEffectiveRegistrationPlaceId =
    await deriveEffectiveRegistrationPlaceIdFromSeedData(currentDeclaration)

  const declarationPatch: Record<string, unknown> = {
    'child.effectiveRegistrationDate':
      existingEffectiveRegistrationDate ??
      new Date().toISOString().split('T')[0]
  }

  const effectiveRegistrationPlaceId =
    derivedEffectiveRegistrationPlaceId ??
    existingEffectiveRegistrationPlaceId ??
    action?.createdAtLocation

  if (effectiveRegistrationPlaceId) {
    declarationPatch['child.effectiveRegistrationPlaceId'] =
      effectiveRegistrationPlaceId
  }

  await client.event.actions.register.accept.mutate({
    type: 'REGISTER' as const,
    transactionId: uuidv4(),
    eventId,
    actionId: action?.id as string,
    registrationNumber,
    declaration: { ...(action?.declaration ?? {}), ...declarationPatch }
  })

  await sendInformantNotification({ event, token, registrationNumber })
}

async function deriveEffectiveRegistrationPlaceIdFromSeedData(
  declaration: Record<string, unknown>
) {
  try {
    await ensureLocationsCache()
    return deriveEffectiveRegistrationPlaceIdFromLocations(
      declaration,
      locationsCache
    )
  } catch (error) {
    logger.warn(
      { error },
      'Could not derive effective registration place from birth location'
    )
    return undefined
  }
}

function getDeclaredLocationId(event: EventDocument) {
  return normalizeLocationId(
    event.actions.find((action) => action.type === ActionType.DECLARE)
      ?.createdAtLocation
  )
}

function normalizeLocationId(locationId: string | null | undefined) {
  return locationId ?? undefined
}

async function ensureLocationsCache() {
  if (locationsCacheReady) {
    return
  }

  locationsCache = await readCSVToJSON<SeedLocation[]>(
    './src/data-seeding/locations/source/locations.csv'
  )

  locationsCacheReady = true
}

/**
 * Example function for asynchronously accepting a registration action.
 *
 * This should only be used when an action is in 'Requested' state (after returning HTTP 202
 * for the initial confirmation request). This function demonstrates how to accept a registration
 * that was previously placed in a pending state.
 *
 * For registration actions specifically, you must provide a registration number when accepting.
 * See the Action Confirmation documentation for more details on asynchronous confirmation flows.
 */
async function acceptRequestedRegistration(
  token: string,
  eventId: string,
  actionId: string,
  action: Extract<ActionInput, { type?: 'REGISTER' }>
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

/**
 * Example function for asynchronously rejecting a registration action.
 *
 * This should only be used when an action is in 'Requested' state (after returning HTTP 202
 * for the initial confirmation request). This function demonstrates how to reject a registration
 * that was previously placed in a pending state.
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
