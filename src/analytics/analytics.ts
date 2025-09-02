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

import { EventDocument, getCurrentEventState } from '@opencrvs/toolkit/events'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { deathEvent } from '@countryconfig/form/v2/death'
import { Event } from '@countryconfig/form/types/types'
import { Kysely, sql } from 'kysely'
import { compact as removeNulls } from 'lodash'
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { logger } from '@countryconfig/logger'

interface AnalyticsEvent {
  id: string

  eventType: string
  trackingId: string
  declaration: Record<string, any>
}

export const upsertAnalyticsEvents = async (
  values: Array<AnalyticsEvent>,
  trx: Kysely<any>
) => {
  if (values.length === 0) return []

  return trx
    .insertInto('analytics.events')
    .values(values)
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        declaration: sql`excluded.declaration`,
        updatedAt: sql`now()`
      })
    )
    .execute()
}

/**
 * You can control which events you want to track in analytics by adding them here.
 */
function getEventConfig(eventType: string) {
  if (eventType === Event.V2_BIRTH) {
    return birthEvent
  }

  if (eventType === Event.TENNIS_CLUB_MEMBERSHIP) {
    return tennisClubMembershipEvent
  }

  if (eventType === Event.V2_DEATH) {
    return deathEvent
  }

  return null
}

function addCurrentStateToEvent(event: EventDocument) {
  const eventConfig = getEventConfig(event.type)

  if (!eventConfig) {
    // Ignoring ${event.type} for analytics
    return null
  }

  const declaration = getCurrentEventState(event, eventConfig)

  return {
    id: event.id,
    eventType: event.type,
    trackingId: event.trackingId,
    declaration
  }
}

export function importEvent(event: EventDocument, trx: Kysely<any>) {
  const declaration = addCurrentStateToEvent(event)

  if (!declaration)
    // Ignoring ${event.type} for analytics
    return

  logger.info(`Event with id "${event.id}" logged into analytics`)
  return upsertAnalyticsEvents([declaration], trx)
}

export const importEvents = async (
  events: EventDocument[],
  trx: Kysely<any>
) => {
  const eventsWithCurrentState = events.map(addCurrentStateToEvent)
  return upsertAnalyticsEvents(removeNulls(eventsWithCurrentState), trx)
}
