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
  EventConfig,
  EventDocument,
  EventState,
  getCurrentEventState
} from '@opencrvs/toolkit/events'
import { birthEvent } from '@countryconfig/form/v2/birth'
import { deathEvent } from '@countryconfig/form/v2/death'
import { Event } from '@countryconfig/form/types/types'
import { Kysely, sql } from 'kysely'
import { tennisClubMembershipEvent } from '@countryconfig/form/tennis-club-membership'
import { logger } from '@countryconfig/logger'
import { pickBy } from 'lodash'

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

/**
 * Only analytics fields (`analytics: true`) must be included in `declaration`
 */
function pickAnalyticsFields(
  declaration: EventState,
  eventConfig: EventConfig
) {
  const analyticsFields = eventConfig.declaration.pages.flatMap((page) =>
    page.fields.filter((field) => field.analytics === true)
  )

  return pickBy(declaration, (_, key) =>
    analyticsFields.some((field) => field.id === key)
  )
}

export async function upsertAnalyticsEventActions(
  event: EventDocument,
  eventConfig: EventConfig,
  trx: Kysely<any>
) {
  for (let i = 0; i < event.actions.length; i++) {
    const actionsFromStartToCurrentPoint = event.actions.slice(0, i + 1)
    const action = event.actions[i]

    const actionAtCurrentPoint = getCurrentEventState(
      {
        ...event,
        actions: actionsFromStartToCurrentPoint
      },
      eventConfig
    )

    const actionWithFilteredDeclaration = {
      ...action,
      declaration: pickAnalyticsFields(
        actionAtCurrentPoint.declaration,
        eventConfig
      )
    }

    await trx
      .insertInto('analytics.event_actions')
      .values({
        eventId: event.id,
        actionType: action.type,
        actionId: action.id,
        eventType: event.type,
        trackingId: event.trackingId,
        action: actionWithFilteredDeclaration,
        createdAt: action.createdAt,
        indexedAt: undefined
      })
      .onConflict((oc) =>
        oc.columns(['eventId', 'actionId']).doUpdateSet({
          action: sql`excluded.action`,
          indexedAt: sql`now()`
        })
      )
      .execute()
  }
}

export async function importEvent(event: EventDocument, trx: Kysely<any>) {
  const eventConfig = getEventConfig(event.type)

  if (!eventConfig)
    // Ignoring ${event.type} for analytics
    return

  await upsertAnalyticsEventActions(event, eventConfig, trx)
  logger.info(`Event with id "${event.id}" logged into analytics`)
}

export async function importEvents(events: EventDocument[], trx: Kysely<any>) {
  for (const event of events) {
    await importEvent(event, trx)
  }
}
