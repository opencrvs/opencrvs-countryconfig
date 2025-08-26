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
  ActionStatus,
  ActionType,
  EventDocument
} from '@opencrvs/toolkit/events'
import { UUID } from 'crypto'
import { Kysely, sql } from 'kysely'
import { getClient } from './postgres'
import { v4 as uuidv4 } from 'uuid'
import { omit } from 'lodash'

export type Events = {
  id: string
  transactionId: string
  createdAt: string
  eventType: string
  trackingId: string
  updatedAt: string
}

type NewEvents = {
  transactionId: string
  eventType: string
  trackingId: string
} & {
  id?: string | undefined
  createdAt?: string | undefined
  updatedAt?: string | undefined
}

type UserType = 'system' | 'user'

export type EventActions = {
  status: ActionStatus
  id: string
  createdBy: string
  transactionId: string
  eventId: string
  actionType: ActionType
  declaration: Record<string, any>
  annotation: Record<string, any> | null
  createdByRole: string
  createdByUserType: UserType
  createdBySignature: string | null
  createdAtLocation: string | null
  createdAt: string
  registrationNumber: string | null
  assignedTo: string | null
  originalActionId: string | null
  reasonIsDuplicate: boolean | null
  reasonMessage: string | null
  requestId: string | null
  content: Record<string, any> | null
}

type NewEventActions = {
  status: ActionStatus
  createdBy: string
  transactionId: string
  eventId: string
  actionType: ActionType
  createdByRole: string
  createdByUserType: UserType
} & {
  id?: string | undefined
  declaration?: Record<string, any> | undefined
  annotation?: Record<string, any> | null | undefined
  createdBySignature?: string | null | undefined
  createdAtLocation?: string | null | undefined
  createdAt?: string | undefined
  registrationNumber?: string | null | undefined
  assignedTo?: string | null | undefined
  originalActionId?: string | null | undefined
  reasonIsDuplicate?: boolean | null | undefined
  reasonMessage?: string | null | undefined
  requestId?: string | null | undefined
  content?: Record<string, any> | null | undefined
}

/**
 * Creates a new action in the event_actions table
 * @idempotent with `transactionId, actionType`
 * @returns action id
 */
export async function createActionInTrx(
  action: NewEventActions,
  trx: Kysely<any>
) {
  await trx
    .insertInto('eventActions')
    .values(action)
    .onConflict((oc) => oc.columns(['transactionId', 'actionType']).doNothing())
    .execute()

  return trx
    .selectFrom('eventActions')
    .select('id')
    .where('transactionId', '=', action.transactionId)
    .where('actionType', '=', action.actionType)
    .executeTakeFirstOrThrow()
}

export async function createEventInTrx(event: NewEvents, trx: Kysely<any>) {
  await trx
    .insertInto('events')
    .values(event)
    .onConflict((oc) => oc.columns(['transactionId', 'eventType']).doNothing())
    .executeTakeFirstOrThrow()

  return trx
    .selectFrom('events')
    .select('id')
    .where('transactionId', '=', event.transactionId)
    .where('eventType', '=', event.eventType)
    .executeTakeFirstOrThrow()
}

export const dropNulls = <T extends Record<string, unknown | null>>(
  record: T
) => Object.fromEntries(Object.entries(record).filter(([, v]) => v !== null))

export async function deleteEventByIdInTrx(eventId: string, trx: Kysely<any>) {
  await trx.deleteFrom('eventActions').where('eventId', '=', eventId).execute()
  await trx.deleteFrom('events').where('id', '=', eventId).execute()
}
function toEventDocument(
  { eventType, ...event }: Events,
  actions: EventActions[]
) {
  const notNullActions = actions.map(
    ({ actionType, reasonIsDuplicate, reasonMessage, ...action }) =>
      dropNulls({
        ...action,
        type: actionType,
        reason: (reasonIsDuplicate || reasonMessage) && {
          isDuplicate: reasonIsDuplicate,
          message: reasonMessage
        }
      })
  )

  return EventDocument.parse({
    ...event,
    type: eventType,
    actions: notNullActions
  })
}

export async function getEventByIdInTrx(id: UUID, trx: Kysely<any>) {
  const event = (await trx
    .selectFrom('events')
    .selectAll()
    .where('id', '=', id)
    .executeTakeFirstOrThrow()) as Events

  const actions = (await trx
    .selectFrom('eventActions')
    .selectAll()
    .where('eventId', '=', event.id)
    .orderBy(
      sql`CASE WHEN ${sql.ref('actionType')} = 'CREATE' THEN 0 ELSE 1 END`,
      'asc'
    )
    .orderBy('createdAt', 'asc')
    .execute()) as EventActions[]

  return toEventDocument(event, actions)
}

export const upsertEventWithActions = async (
  event: Events,
  actions: Array<Omit<EventActions, 'eventId'>>
) => {
  const db = getClient()

  return db.transaction().execute(async (trx) => {
    await deleteEventByIdInTrx(event.id, trx)
    const { id: eventId } = await createEventInTrx(event, trx)

    for (const action of actions) {
      await createActionInTrx({ ...action, eventId }, trx)
    }

    return getEventByIdInTrx(eventId, trx)
  })
}

export async function importEvent(eventDocument: EventDocument) {
  const transactionId = uuidv4()
  const { actions, ...event } = eventDocument

  const eventType = event.type
  const eventActions = actions.map(({ type, ...action }) => ({
    ...omit(action, 'type'),
    actionType: type,

    /* eslint-disable @typescript-eslint/no-explicit-any */
    annotation: (action as any).annotation ?? undefined,
    content: (action as any).content ?? undefined,
    declaration: (action as any).declaration ?? undefined,
    reasonIsDuplicate: (action as any).reason?.isDuplicate ?? undefined,
    reasonMessage: (action as any).reason?.message ?? undefined,
    registrationNumber: (action as any).registrationNumber ?? undefined,
    assignedTo: (action as any).assignedTo ?? undefined,
    requestId: (action as any).requestId ?? undefined,
    /* eslint-enable @typescript-eslint/no-explicit-any */
    createdAtLocation: action.createdAtLocation ?? null,
    originalActionId: action.originalActionId ?? null,
    createdBySignature: action.createdBySignature ?? null
  }))

  const createdEvent = await upsertEventWithActions(
    { ...omit(event, 'type'), eventType, transactionId },
    eventActions
  )

  return createdEvent
}
