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

import { userCreatedNotificationHandler } from '@countryconfig/api/notification/handler'
import { ReqRefDefaults, ServerRoute } from '@hapi/hapi'

export default function getUserNotificationRoutes(): ServerRoute<ReqRefDefaults>[] {
  return [
    {
      method: 'POST',
      path: '/triggers/user/user-created',
      handler: userCreatedNotificationHandler,
      options: {
        /*
         * In deployed environments, the email path needs to be blocked by Traefik.
         * See `/email`
         */
        auth: false,
        tags: ['api'],
        description: 'Handles notification for user creation'
      }
    }
  ]
}
