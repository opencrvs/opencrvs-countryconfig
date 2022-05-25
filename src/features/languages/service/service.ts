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
import { readFile, readFileSync } from 'fs'
import { join } from 'path'
import {
  LANGUAGES_SOURCE,
  CMS,
  CMS_API_KEY,
  CONTENTFUL_SPACE_ID
} from '@countryconfig/constants'
import * as Contentful from 'contentful'

interface IMessageIdentifier {
  [key: string]: string
}

interface IContentfulFields {
  [key: string]: IMessageIdentifier
}

export interface ILanguage {
  lang: string
  displayName: string
  messages: IMessageIdentifier
}

export interface ILanguageDataResponse {
  data: ILanguage[]
}

function formatMessages(
  contentfulEntries: Contentful.EntryCollection<unknown>,
  locale: string,
  contentfulIds: IMessageIdentifier
): IMessageIdentifier {
  let messages = {}
  contentfulEntries.items.forEach(item => {
    const contentfulFields = item.fields as IContentfulFields
    Object.keys(contentfulFields).forEach(key => {
      messages[contentfulIds[key]] = contentfulFields[key][locale]
    })
  })
  return messages
}

function convertContentfulToSupportedFormat(
  contentfulLocales: Contentful.LocaleCollection,
  contentfulEntries: Contentful.EntryCollection<unknown>,
  contentfulIds: IMessageIdentifier
): ILanguageDataResponse {
  const response: ILanguageDataResponse = {
    data: []
  }

  contentfulLocales.items.forEach(locale => {
    const language: ILanguage = {
      lang:
        locale.code === 'en-US'
          ? 'en'
          : locale.code === 'bn-BD'
          ? 'bn'
          : locale.code,
      displayName: locale.name,
      messages: formatMessages(contentfulEntries, locale.code, contentfulIds)
    }
    response.data.push(language)
  })
  return response
}

export async function getLanguages(
  application: string
): Promise<ILanguageDataResponse> {
  if (CMS && CMS === 'contentful' && application === 'client') {
    const contentfulClient = Contentful.createClient({
      space: `${CONTENTFUL_SPACE_ID}`,
      accessToken: `${CMS_API_KEY}`
    })
    try {
      let contentfulLocales: Contentful.LocaleCollection = await contentfulClient
        .getLocales()
        .then(entries => {
          return entries
        })
      let contentfulEntries: Contentful.EntryCollection<unknown> = await contentfulClient
        .getEntries({ limit: 1000, locale: '*' })
        .then(entries => {
          return entries
        })
      const contentfulIds = (await JSON.parse(
        readFileSync(
          join(LANGUAGES_SOURCE, `${application}/contentful-ids.json`),
          'utf8'
        )
      )) as IMessageIdentifier

      const content: ILanguageDataResponse = convertContentfulToSupportedFormat(
        contentfulLocales,
        contentfulEntries,
        contentfulIds
      )
      return content
    } catch (err) {
      throw new Error(
        `Unable to retrieve conentful content: ${JSON.stringify(err)}`
      )
    }
  } else if (CMS && CMS === 'contentful' && application === 'notification') {
    const contentfulClient = Contentful.createClient({
      space: `${CONTENTFUL_SPACE_ID}`,
      accessToken: `${CMS_API_KEY}`
    })
    try {
      let contentfulLocales: Contentful.LocaleCollection = await contentfulClient
        .getLocales()
        .then(entries => {
          return entries
        })
      let contentfulEntries: Contentful.EntryCollection<unknown> = await contentfulClient
        .getEntries({ limit: 1000, locale: '*', content_type: application })
        .then(entries => {
          return entries
        })
      const contentfulIds = (await JSON.parse(
        readFileSync(
          join(LANGUAGES_SOURCE, `${application}/contentful-ids.json`),
          'utf8'
        )
      )) as IMessageIdentifier

      const content: ILanguageDataResponse = convertContentfulToSupportedFormat(
        contentfulLocales,
        contentfulEntries,
        contentfulIds
      )
      return content
    } catch (err) {
      throw new Error(
        `Unable to retrieve conentful content: ${JSON.stringify(err)}`
      )
    }
  } else {
    return new Promise((resolve, reject) => {
      readFile(
        join(LANGUAGES_SOURCE, `${application}/${application}.json`),
        (err, data) => {
          err ? reject(err) : resolve(JSON.parse(data.toString()))
        }
      )
    })
  }
}
