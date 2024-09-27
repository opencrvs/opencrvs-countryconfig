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
import { NUI_GENERATOR_URL, NUI_API_KEY } from './constants'
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

const generateNUI = async ({ office }: { office: string }): Promise<string> => {
  try {
    const response = await fetch(`${NUI_GENERATOR_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NUI_API_KEY}`
      },
      body: JSON.stringify({
        batchSize: NUI_BATCH_SIZE,
        destinator: office
      })
    })

    const body = await response.json()

    const parsed = generateNUIResponseSchema.parse(body)

    return parsed.theNuis[0]
  } catch (err) {
    console.error(err)
    throw internal()
  }
}

const affectNUI = async (nui: string) => {
  const response = await fetch(`${NUI_GENERATOR_URL}/affect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NUI_API_KEY}`
    },
    body: JSON.stringify({
      nui: [nui]
    })
  })

  const body = await response.json()

  const parsed = affectNUIResponseSchema.parse(body)

  if (parsed.status_code !== 201) {
    console.error(parsed)
    throw internal()
  }
}

export async function NUIHandler(req: Request) {
  const body = req.payload as { office: string }
  try {
    const nui = await generateNUI(body)
    await affectNUI(nui)

    return nui
  } catch (err) {
    err.output.payload.message = 'httpError'
    throw err
  }
}
