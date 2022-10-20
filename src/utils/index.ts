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
import { callingCountries } from 'country-data'
import { createHash } from 'crypto'
import * as uuid from 'uuid/v4'
import * as csv2json from 'csv2json'
import { createReadStream } from 'fs'

export interface ISaltedHash {
  hash: string
  salt: string
}

export function generateRandomPassword(demoUser?: boolean) {
  if (demoUser) {
    return 'test'
  }

  const length = 6
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  let randomPassword = ''
  for (let i = 0; i < length; i += 1) {
    // tslint:disable-next-line
    randomPassword += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  return randomPassword
}

export function generateHash(content: string, salt: string): string {
  const hash = createHash('sha512')
  hash.update(salt)
  hash.update(content)
  return hash.digest('hex')
}

export function generateSaltedHash(password: string): ISaltedHash {
  const salt = uuid()
  return {
    hash: generateHash(password, salt),
    salt
  }
}

export const convertToMSISDN = (phone: string, countryAlpha3: string) => {
  const countryCode =
    callingCountries[countryAlpha3.toUpperCase()].countryCallingCodes[0]
  if (phone.startsWith(countryCode) || `+${phone}`.startsWith(countryCode)) {
    return phone.startsWith('+') ? phone : `+${phone}`
  }
  return phone.startsWith('0')
    ? `${countryCode}${phone.substring(1)}`
    : `${countryCode}${phone}`
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}
