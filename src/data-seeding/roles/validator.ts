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
import { TypeOf, z } from 'zod'

export type Role = TypeOf<typeof RoleSchema>[number]

export const RoleSchema = z.array(
  z.object({
    systemRole: z.enum([
      'FIELD_AGENT',
      'REGISTRATION_AGENT',
      'LOCAL_REGISTRAR',
      'LOCAL_SYSTEM_ADMIN',
      'NATIONAL_SYSTEM_ADMIN',
      'PERFORMANCE_MANAGEMENT',
      'NATIONAL_REGISTRAR'
    ]),
    label_en: z.string(),
    label_fr: z.string()
  })
)
