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
  Action,
  ActionType,
  EventDocument,
  getCurrentEventState
} from '@opencrvs/toolkit/events'
import { getClient } from './postgres'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { deathEvent } from '@countryconfig/form/v2/death'
import { Event } from '@countryconfig/form/types/types'

export const upsertAnalyticsEvent = async (
  id: string,
  eventType: string,
  trackingId: string,
  declaration: Record<string, any>
) => {
  const client = getClient()
  return client
    .insertInto('analytics.events')
    .values({
      id,
      eventType,
      trackingId,
      declaration
    })
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        declaration,
        updatedAt: new Date()
      })
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}

/**
 * You can control which events you want to track in analytics by adding them here.
 */
function getEventConfig(eventType: string) {
  if (eventType === Event.V2_BIRTH) {
    return birthEvent
  }

  if (eventType === Event.V2_DEATH) {
    return deathEvent
  }

  return null
}

export const importEvent = async (event: EventDocument) => {
  const eventConfig = getEventConfig(event.type)

  if (!eventConfig) {
    // Ignoring ${event.type} for analytics
    return
  }

  const declaration = getCurrentEventState(event, eventConfig)

  return upsertAnalyticsEvent(
    event.id,
    event.type,
    event.trackingId,
    declaration
  )
}
