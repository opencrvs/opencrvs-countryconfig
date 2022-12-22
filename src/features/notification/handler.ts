/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { sendSMS } from './service'

interface INotificationPayload {
  msisdn: string
  message: string
  convertUnicode?: boolean
}

export const notificationScheme = Joi.object({
  msisdn: Joi.string(),
  message: Joi.string(),
  convertUnicode: Joi.boolean()
})

export async function notificationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const { msisdn, message, convertUnicode } =
    request.payload as INotificationPayload
  return sendSMS(msisdn, message, convertUnicode)
}
