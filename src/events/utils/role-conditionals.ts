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

import { and, or, user } from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

export const hasHealthNotifierRole = or(
  user.hasRole('HEALTH_NOTIFIER'),
  user.hasRole('ISLAND_CLINIC_NOTIFIER')
)

export const hasNonHealthNotifierRole = and(
  not(user.hasRole('HEALTH_NOTIFIER')),
  not(user.hasRole('ISLAND_CLINIC_NOTIFIER'))
)