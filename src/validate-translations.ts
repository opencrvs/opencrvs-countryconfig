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

async function validateMessages() {
  let allMessageData!: {
    data: Array<{
      lang: string
      displayName: string
      messagess: Record<string, string>
    }>
  }

  try {
    allMessageData = JSON.parse(
      fs
        .readFileSync(join(__dirname, `./api/content/client/client.json`))
        .toString()
    )
  } catch (err) {
    console.log(err)
    process.exit(1)
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

  let missingKey = false
  allTranslationKeysSet.forEach((item: string) => {
    availableTranslations.map(({ lang, messages }) => {
      if (!Object.keys(messages!).includes(item)) {
        missingKey = true
        console.log(`${chalk.white(`${lang}`)} ${chalk.red(
          `translation is missing for this key: `
        )} ${chalk.green(`${item}`)}  
          `)
      }
    })
  })

  if (!missingKey) {
    console.log('No translations are missing')
    process.exit(0)
  } else process.exit(1)
}

validateMessages()
