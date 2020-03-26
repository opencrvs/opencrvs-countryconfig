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
import { getStage } from '@ocrvs-chatbot/utils/chat'
import {
  ageCheckChat,
  UNKNOWN_MESSAGE
} from '@ocrvs-chatbot/features/agecheck/chat'

describe('getStage', () => {
  it('getStage should return the right stage', () => {
    const stage = {
      id: 'UNKNOWN_MESSAGE',
      response:
        'I\'m sorry. 😞 I dont understand. At any time, you can send "start" to start the service again, or "exit" to log out.'
    }
    expect(getStage(ageCheckChat, UNKNOWN_MESSAGE)).toEqual(stage)
  })
})
