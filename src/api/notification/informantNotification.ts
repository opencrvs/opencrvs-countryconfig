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
  aggregateActionDeclarations,
  EventDocument,
  getAcceptedActions,
  getPendingAction
} from '@opencrvs/toolkit/events'

export async function sendInformantNotification(event: EventDocument) {
  const declaration = aggregateActionDeclarations(getAcceptedActions(event))
  const pendingAction = getPendingAction(event.actions)

  console.log(JSON.stringify({ declaration, pendingAction }))

  return Promise.resolve(true)
}
