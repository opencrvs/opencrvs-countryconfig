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
import chalk from 'chalk'
import * as fs from 'fs'
import { join } from 'path'
import { ILanguage } from './api/content/service'

function validateMessages(path: string, name: string) {
  let allMessageData!: {
    data: Array<{
      lang: string
      displayName: string
      messages: Record<string, string>
    }>
  }

  try {
    allMessageData = JSON.parse(
      fs.readFileSync(join(__dirname, path)).toString()
    )
  } catch (err) {
    console.log(err)
    return false
  }

  const availableTranslations = allMessageData.data.map(
    (d: Partial<ILanguage>) => ({
      lang: d.displayName,
      messages: d.messages
    })
  )

  const allTranslationKeysSet = new Set()

  availableTranslations.forEach((item) => {
    const messageKeys = Object.keys(item.messages!)
    messageKeys.forEach((key) => {
      allTranslationKeysSet.add(key)
    })
  })

  const langAndKeys = []

  langAndKeys.push(
    ...availableTranslations.map(({ lang, messages }) => ({
      lang,
      keys: Object.keys(messages!)
    }))
  )

  function missingKeysFinder(
    originalSet: Iterable<unknown> | null | undefined,
    setToCompare: any
  ) {
    const differenceSet = new Set(originalSet)

    for (const i of setToCompare) {
      differenceSet.delete(i)
    }
    return Array.from(differenceSet)
  }

  let missingKeys: any = []

  langAndKeys.map((obj: any) => {
    const comparableSet = new Set(obj.keys)
    missingKeys = missingKeysFinder(allTranslationKeysSet, comparableSet)

    if (missingKeys.length !== 0) {
      console.log(
        `${chalk.white(
          `There are missing keys for ${name}.json in ${obj.lang}:\n`
        )}`
      )

      missingKeys.forEach((o: any) => {
        console.log(`${chalk.red(`${o}`)}`)
      })
      console.log(`\n`)
    } else {
      console.log(
        `No translations are missing for ${name}.json in ${obj.lang}:\n`
      )
    }
  })

  if (!missingKeys) {
    return true
  } else return false
}

const clientValidation = validateMessages(
  `./api/content/client/client.json`,
  'client'
)
const loginValidation = validateMessages(
  `./api/content/login/login.json`,
  'login'
)
const notificationValidation = validateMessages(
  `./api/content/notification/notification.json`,
  'notification'
)

if (clientValidation || loginValidation || notificationValidation) {
  process.exit(0)
} else process.exit(1)
