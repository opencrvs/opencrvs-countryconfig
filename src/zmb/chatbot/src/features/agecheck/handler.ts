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
import * as Hapi from 'hapi'
/* import { internal } from 'boom'
import { TELEGRAM_API_KEY } from '@ocrvs-chatbot/constants'*/

export default async function chatbotHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
): Promise<any> {
  // const payload = request.payload as IAgeCheckPayload
  const result = {}

  /* try {
    result = await chatbotConnect(TELEGRAM_API_KEY)
  } catch (err) {
    throw internal()
  }*/

  return h.response(result).code(201)
}
