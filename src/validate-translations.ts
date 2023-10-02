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
import chalk from 'chalk'
import * as fs from 'fs'
import { join } from 'path'
import { ILanguage } from './api/content/service'

type translationType = {
  data: ILanguage[]
}

function validateMessages(path: string, name: string) {
  let allMessageData

  function readFile(path: string): translationType {
    return JSON.parse(fs.readFileSync(join(__dirname, path)).toString())
  }

  try {
    allMessageData = readFile(path)
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
        `${chalk.bold(
          `There are missing keys in ${name}.json for ${obj.lang}:\n`
        )}`
      )

      missingKeys.forEach((o: any) => {
        console.log(`${chalk.red(`${o}`)}`)
      })
      console.log(`\n`)
    } else {
      console.log(
        `No translations are missing in ${name}.json for ${obj.lang}:\n`
      )
    }
  })

  if (missingKeys.length > 0) {
    return true
  } else return false
}

const clientMissingKeys = validateMessages(
  `./api/content/client/client.json`,
  'client'
)
const loginMissingKeys = validateMessages(
  `./api/content/login/login.json`,
  'login'
)
const notificationMissingKeys = validateMessages(
  `./api/content/notification/notification.json`,
  'notification'
)

if (clientMissingKeys || loginMissingKeys || notificationMissingKeys) {
  process.exit(1)
} else process.exit(0)
