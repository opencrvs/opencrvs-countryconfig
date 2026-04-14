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

const TRANSLATIONS_DIR = 'src/translations'

/**
 * Reads translation data for an application.
 *
 * For the notification service, reads per-language files (e.g. notification-en.csv).
 *
 * For client and login, merges core and country per-language files
 * (e.g. core-en.csv + country-en.csv) so both sets of keys are served together.
 */
export async function getLanguages(
  application: string
): Promise<ILanguageDataResponse> {
  if (application === 'notification') {
    return readPerLanguageFiles('notification')
  }

  return readCoreAndCountryFiles()
}

async function readPerLanguageFiles(
  prefix: string
): Promise<ILanguageDataResponse> {
  const files = existsSync(TRANSLATIONS_DIR)
    ? readdirSync(TRANSLATIONS_DIR)
        .filter((f) => f.startsWith(`${prefix}-`) && f.endsWith('.csv'))
        .map((f) => join(TRANSLATIONS_DIR, f))
    : []

  return Promise.all(
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
}

async function readCoreAndCountryFiles(): Promise<ILanguageDataResponse> {
  const coreFiles = existsSync(TRANSLATIONS_DIR)
    ? readdirSync(TRANSLATIONS_DIR).filter(
        (f) => f.startsWith('core-') && f.endsWith('.csv')
      )
    : []

  return Promise.all(
    coreFiles.map(async (coreFile) => {
      const lang = coreFile.replace('core-', '').replace('.csv', '')
      const messages: IMessageIdentifier = {}

      const coreRows = await readCSVToJSON<CSVRow[]>(
        join(TRANSLATIONS_DIR, coreFile)
      )
      coreRows.forEach((row) => {
        messages[row.id] = row[lang]
      })

      const countryFile = join(TRANSLATIONS_DIR, `country-${lang}.csv`)
      if (existsSync(countryFile)) {
        const countryRows = await readCSVToJSON<CSVRow[]>(countryFile)
        countryRows.forEach((row) => {
          messages[row.id] = row[lang]
        })
      }

      return { lang, messages }
    })
  )
}
