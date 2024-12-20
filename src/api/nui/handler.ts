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

import { Request } from '@hapi/hapi'
import { z } from 'zod'
import * as Joi from 'joi'
import {
  NUI_GENERATOR_URL,
  NUI_API_KEY,
  X_ROAD_CLIENT,
  CLIENT_SECRET,
  CLIENT_ID
} from './constants'
import { internal } from '@hapi/boom'

if (!NUI_GENERATOR_URL || !NUI_API_KEY) {
  throw new Error('NUI_GENERATOR_URL and NUI_API_KEY must be set')
}
const NUI_BATCH_SIZE = 1

export const nuiRequestBodySchema = Joi.object({
  office: Joi.string()
})

const generateNUIResponseSchema = z.object({
  theNuis: z.array(z.string()).min(NUI_BATCH_SIZE).max(NUI_BATCH_SIZE),
  status: z.string()
})

const affectNUIResponseSchema = z.object({
  status_code: z.number(),
  status: z.string()
})

const fetchNewToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${NUI_GENERATOR_URL}/systems/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Road-Client': X_ROAD_CLIENT
      },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET
      })
    })

    const body: any = await response.json()

    if (!response.ok) {
      throw new Error(
        `Failed to fetch token: ${body.message || 'Unknown error'}`
      )
    }

    return body.data.accessToken
  } catch (err) {
    console.error('Error fetching new token', err)
    throw internal()
  }
}

export const generateNUI = async ({
  office,
  token
}: {
  office: string
  token?: string
}): Promise<string> => {
  try {
    const response = await fetch(`${NUI_GENERATOR_URL}/v1/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-Road-Client': X_ROAD_CLIENT
      },
      body: JSON.stringify({
        batchSize: NUI_BATCH_SIZE,
        destinator: office
      })
    })

    const body: any = await response.json()

    if (body.statusCode === 401) {
      token = await fetchNewToken()
      return await generateNUI({ office, token })
    }

    if (!response.ok) {
      throw new Error(
        `Failed to generate NUI: ${body.message || 'Unknown error'}`
      )
    }
    const parsed = generateNUIResponseSchema.parse(body)

    return parsed.theNuis[0]
  } catch (err) {
    console.error('Error generating NUI', err)
    throw internal()
  }
}

const affectNUI = async (nui: string, token: string) => {
  const response = await fetch(`${NUI_GENERATOR_URL}/v1/affect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Road-Client': X_ROAD_CLIENT
    },
    body: JSON.stringify({
      nui: [nui]
    })
  })

  const body = await response.json()
  const parsed = affectNUIResponseSchema.parse(body)

  if (![200, 201].includes(parsed.status_code)) {
    console.error(parsed)
    throw internal()
  }
}

export async function NUIHandler(req: Request) {
  const body = req.payload as { office: string }
  try {
    const currentToken = await fetchNewToken()

    const nui = await generateNUI(body)
    await affectNUI(nui, currentToken)

    return nui
  } catch (err) {
    err.output.payload.message = 'httpError'
    throw err
  }
}
