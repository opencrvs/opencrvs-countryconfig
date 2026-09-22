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

import { field, and, or } from '@opencrvs/toolkit/events/deduplication'

// Child (subject of adoption)
const similarChildName = field('child.name').fuzzyMatches()

// Adoption Order
const sameAdoptionNumber = field('adoptionOrder.number').strictMatches()

// Standard deduplication check - all criteria must match
export const dedupConfig = and(similarChildName, sameAdoptionNumber)

