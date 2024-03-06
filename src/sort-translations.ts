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
import * as fs from 'fs'
import { ILanguage } from './api/content/service'

type Translations = {
  data: ILanguage[]
}

function readFile(path: string): Translations {
  return JSON.parse(fs.readFileSync(path).toString())
}

function sortMessages(path: string) {
  const translations = readFile(path)
  translations.data = translations.data.map((translation) => {
    return {
      ...translation,
      messages: Object.keys(translation.messages)
        .sort()
        .reduce<ILanguage['messages']>((messages, key) => {
          messages[key] = translation.messages[key]
          return messages
        }, {})
    }
  })
  fs.writeFileSync(path, JSON.stringify(translations, null, 2))
}

process.argv.slice(2).forEach((filePath) => sortMessages(filePath))
