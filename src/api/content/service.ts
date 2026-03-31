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
import { readCSVToJSON } from '@countryconfig/utils'

import { existsSync, readdirSync } from 'fs'
import { join } from 'path'

interface IMessageIdentifier {
  [key: string]: string
}

export interface ILanguage {
  lang: string
  messages: IMessageIdentifier
}

export type ILanguageDataResponse = ILanguage[]

export type CSVRow = { id: string; description: string } & Record<
  string,
  string
>

/**
 * Reads translation data for an application.
 *
 * If per-language files exist (e.g. client-en.csv, client-fr.csv) they are
 * merged together and take precedence over the combined file.  This lets
 * country teams maintain one language per file while the application still
 * receives a single merged response.
 *
 * Falls back to the original combined CSV (e.g. client.csv) when no
 * per-language files are found.
 */
export async function getLanguages(
  application: string
): Promise<ILanguageDataResponse> {
  const translationsDir = 'src/translations'
  const prefix = `${application}-`

  const perLanguageFiles = existsSync(translationsDir)
    ? readdirSync(translationsDir)
        .filter((f) => f.startsWith(prefix) && f.endsWith('.csv'))
        .map((f) => join(translationsDir, f))
    : []

  if (perLanguageFiles.length > 0) {
    return mergePerLanguageFiles(perLanguageFiles)
  }

  const csvData = await readCSVToJSON<CSVRow[]>(
    join(translationsDir, `${application}.csv`)
  )
  const languages = Object.keys(csvData[0]).filter(
    (key) => !['id', 'description'].includes(key)
  )

  return languages.map((lang) => {
    const messages: IMessageIdentifier = {}
    csvData.forEach((row) => {
      messages[row.id] = row[lang]
    })
    return { lang, messages }
  })
}

async function mergePerLanguageFiles(
  files: string[]
): Promise<ILanguageDataResponse> {
  const results = await Promise.all(
    files.map(async (file) => {
      const rows = await readCSVToJSON<CSVRow[]>(file)
      const lang = Object.keys(rows[0]).find(
        (key) => !['id', 'description'].includes(key)
      )
      if (!lang) throw new Error(`No language column found in ${file}`)
      const messages: IMessageIdentifier = {}
      rows.forEach((row) => {
        messages[row.id] = row[lang]
      })
      return { lang, messages }
    })
  )
  return results
}
