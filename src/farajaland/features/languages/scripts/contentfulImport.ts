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

import * as fs from 'fs'
import chalk from 'chalk'
import { LANGUAGES_SOURCE } from '@countryconfig/farajaland/constants'
import * as Contentful from 'contentful'
import {
  SUPPORTED_LOCALES,
  SPACE_ID,
  USER_ID
} from '@countryconfig/farajaland/features/languages/scripts/constants'
import { contentfulTemplate } from '@countryconfig/farajaland/features/languages/scripts/contentful-template'
import * as ShortUUID from 'short-uuid'

const space: SpaceSysLink = {
  sys: {
    type: 'Link',
    linkType: 'Space',
    id: SPACE_ID
  }
}

const environment: EnvironmentSysLink = {
  sys: {
    type: 'Link',
    linkType: 'Environment',
    id: 'master'
  }
}

const user: UserSysLink = {
  sys: {
    type: 'Link',
    linkType: 'User',
    id: USER_ID
  }
}

const now: string = `${new Date().toISOString()}`

type Messages = {
  [key: string]: string
}

type Language = {
  lang: string
  displayName: string
  messages: Messages
}

type LanguagesJSON = {
  data: Language[]
}

// Field

type Field = {
  id: string // set to camel case from field id
  name: string // set to dot notated field id
  type: 'Symbol' | 'Text'
  localized: boolean // set to true
  required: boolean // set to false
  validations: []
  disabled: boolean // set to false
  omitted: boolean // set to false
}

// ContentType

type SpaceSysLink = {
  sys: Contentful.SpaceLink
}

type ContentfulUserLink = {
  type: 'Link'
  linkType: 'User'
  id: string
}

type UserSysLink = {
  sys: ContentfulUserLink
}

type ContentTypeSys = {
  space: SpaceSysLink
  id: string // camelCase name of content type contentPage1
  type: 'ContentType'
  createdAt: string
  updatedAt: string
  environment: EnvironmentSysLink
  publishedVersion: number
  publishedAt: string
  firstPublishedAt: string
  createdBy: UserSysLink
  updatedBy: UserSysLink
  publishedCounter: number
  version: number
  publishedBy: UserSysLink
}

export type ContentType = {
  sys: ContentTypeSys
  displayField: string // id camelCase for field you wish to be the default
  name: string
  description: string
  fields: Field[]
}

type ContentfulTypeLink = {
  type: 'Link'
  linkType: 'ContentType'
  id: string // camelCase name of content type contentPage1
}

type ContentTypeSysLink = {
  sys: ContentfulTypeLink
}

type ContentfulEnvironmentSysLink = {
  id: 'master'
  type: 'Link'
  linkType: 'Environment'
}

type EnvironmentSysLink = {
  sys: ContentfulEnvironmentSysLink
}

type EditorInterfaceSys = {
  space: SpaceSysLink
  id: 'default'
  type: 'EditorInterface'
  version: number
  createdAt: string
  createdBy: UserSysLink
  updatedAt: string
  updatedBy: UserSysLink
  contentType: ContentTypeSysLink
  environment: EnvironmentSysLink
}

type ControlSettings = {
  helpText: string // set to the react-intl description
}

type Control = {
  fieldId: string // set to camel case from field id
  settings: ControlSettings
  widgetId: string // set to 'singleLine'
  widgetNamespace: 'builtin'
}

export type EditorInterface = {
  sys: EditorInterfaceSys
  controls: Control[]
}

type EntrySys = {
  space: SpaceSysLink
  id: string
  type: 'Entry'
  createdAt: string
  updatedAt: string
  environment: EnvironmentSysLink
  publishedVersion: number
  publishedAt: string
  firstPublishedAt: string
  createdBy: UserSysLink
  updatedBy: UserSysLink
  publishedCounter: number
  version: number
  publishedBy: UserSysLink
  contentType: ContentTypeSysLink
}

export type Entry = {
  sys: EntrySys
  fields: any // this is basically the content, camelCase id and locales as below
}

/*
  Entry .fields looks like this:
  {
    "certificateConfirmCorrect": {
      "bn-BD": "অনুগ্রহ করে নিশ্চিত করুন যে নিবন্ধনটি পর্যালোচনা হয়েছে তার তথ্য সঠিক এবং আপনি মুদ্রণ করতে প্রস্তুত",
      "en-US": "Please confirm that the informant has reviewed that the information on the certificate is correct and that you are ready to print."
    },
    "buttonsChangeLanguage": {
      "bn-BD": "ভাষা পরিবর্তন",
      "en-US": "Change Language"
    }
  }
*/

type LocaleSys = {
  type: 'Locale'
  id: string
  version: number
  space: SpaceSysLink
  environment: EnvironmentSysLink
  createdBy: UserSysLink
  updatedBy: UserSysLink
  createdAt: string
  updatedAt: string
}

export type Locale = {
  name: string
  code: string // alpha locale code e.g. bn-BD
  fallbackCode: string // alpha locale code e.g. en-US
  default: boolean // set one of them to true
  contentManagementApi: boolean // set to true
  contentDeliveryApi: boolean // set to true
  optional: boolean // set to false
  sys: LocaleSys
}

export type SupportedLocaleConfig = {
  id: string
  name: string
  code: string // alpha locale code e.g. bn-BD
  fallbackCode: string // alpha locale code e.g. en-US
}

export interface IContentfulImport {
  contentTypes: ContentType[]
  tags?: any
  editorInterfaces: EditorInterface[]
  entries: Entry[]
  assets?: any
  locales: Locale[]
  webhooks?: any
  roles?: any
}

function camelCase(name: string, delim = '.'): string {
  const list = Array.isArray(name) ? name : name.split(delim)
  return list.reduce(
    (res, cur) => res + cur.charAt(0).toUpperCase() + cur.slice(1)
  )
}

function generateNewContentType(
  id: string,
  name: string,
  fieldName: string,
  longMessages: string[],
  notification?: boolean // notifications already had their keys in camelCase
): ContentType {
  return {
    sys: {
      space,
      id,
      type: 'ContentType',
      createdAt: now,
      updatedAt: now,
      environment,
      publishedVersion: 1,
      publishedAt: now,
      firstPublishedAt: now,
      createdBy: user,
      updatedBy: user,
      publishedCounter: 1,
      version: 1,
      publishedBy: user
    },
    displayField: !notification ? camelCase(fieldName) : fieldName,
    name,
    description: '',
    fields: [
      {
        id: !notification ? camelCase(fieldName) : fieldName,
        name: fieldName,
        type: longMessages.includes(fieldName) ? 'Text' : 'Symbol',
        localized: true,
        required: false,
        validations: [],
        disabled: false,
        omitted: false
      }
    ]
  }
}

function generateEditorInterface(
  id: string,
  fieldName: string,
  fieldDescription: string,
  notification?: boolean
): EditorInterface {
  return {
    sys: {
      space,
      id: 'default',
      type: 'EditorInterface',
      createdAt: now,
      updatedAt: now,
      environment,
      createdBy: user,
      updatedBy: user,
      version: 1,
      contentType: {
        sys: {
          id,
          type: 'Link',
          linkType: 'ContentType'
        }
      }
    },
    controls: [
      {
        fieldId: !notification ? camelCase(fieldName) : fieldName,
        settings: {
          helpText: fieldDescription
        },
        widgetId: 'singleLine',
        widgetNamespace: 'builtin'
      }
    ]
  }
}

function getTranslations(
  fieldName: string,
  locales: SupportedLocaleConfig[],
  languages: Language[]
): { [key: string]: string } {
  let obj = {}
  locales.forEach((supportedLocale: SupportedLocaleConfig, index: number) => {
    const languageBlock = languages.filter(language => {
      return language.lang === supportedLocale.code
    })[0]
    obj[supportedLocale.code] = languageBlock.messages[fieldName]
  })
  return obj
}

function generateContentTypeEntry(
  id: string,
  fieldName: string,
  locales: SupportedLocaleConfig[],
  languages: Language[],
  notification?: boolean
): Entry {
  let fields = {}
  const fieldKey = !notification ? camelCase(fieldName) : fieldName
  fields[fieldKey] = getTranslations(fieldName, locales, languages)

  return {
    sys: {
      space,
      id: ShortUUID().generate(),
      type: 'Entry',
      createdAt: now,
      updatedAt: now,
      environment,
      publishedVersion: 1,
      publishedAt: now,
      firstPublishedAt: now,
      createdBy: user,
      updatedBy: user,
      publishedCounter: 1,
      version: 1,
      publishedBy: user,
      contentType: {
        sys: {
          id,
          type: 'Link',
          linkType: 'ContentType'
        }
      }
    },
    fields
  }
}

function addFieldToContentType(
  contentType: ContentType,
  fieldName: string,
  longMessages: string[],
  notification?: boolean
) {
  contentType.fields.push({
    id: !notification ? camelCase(fieldName) : fieldName,
    name: fieldName,
    type: longMessages.includes(fieldName) ? 'Text' : 'Symbol',
    localized: true,
    required: false,
    validations: [],
    disabled: false,
    omitted: false
  })
}

function addControlToEditorInterface(
  editorInterface: EditorInterface,
  fieldName: string,
  fieldDescription: string,
  notification?: boolean
) {
  editorInterface.controls.push({
    fieldId: !notification ? camelCase(fieldName) : fieldName,
    settings: {
      helpText: fieldDescription
    },
    widgetId: 'singleLine',
    widgetNamespace: 'builtin'
  })
}

function addFieldToContentTypeEntry(
  entry: Entry,
  fieldName: string,
  locales: SupportedLocaleConfig[],
  languages: Language[],
  notification?: boolean
) {
  const fieldKey = !notification ? camelCase(fieldName) : fieldName
  entry.fields[fieldKey] = getTranslations(fieldName, locales, languages)
}

export default async function convertLanguagesToContentful() {
  console.log(
    `${chalk.blueBright(
      `/////////////////////////// CONVERTING LANGUAGES TO CONTENTFUL ///////////////////////////`
    )}`
  )

  const application = process.argv[2]

  // set locales

  SUPPORTED_LOCALES.forEach(
    (supportedLocale: SupportedLocaleConfig, index: number) => {
      contentfulTemplate.locales.push({
        name: supportedLocale.name,
        code: supportedLocale.code,
        fallbackCode: supportedLocale.fallbackCode,
        default: index === 0 ? true : false,
        contentManagementApi: true,
        contentDeliveryApi: true,
        optional: false,
        sys: {
          type: 'Locale',
          id: supportedLocale.id,
          version: 1,
          space,
          environment,
          updatedBy: user,
          createdBy: user,
          createdAt: now,
          updatedAt: now
        }
      })
    }
  )

  // create content

  let sortedKeys: string[] = []
  let longMessages: string[] = []
  let contentfulIds = {}
  let currentContentType: ContentType
  let currentEditorInterface: EditorInterface
  let currentContentTypeEntry: Entry

  try {
    let languages = (await JSON.parse(
      fs.readFileSync(
        `${LANGUAGES_SOURCE}${application}/${application}.json`,
        'utf8'
      )
    )) as LanguagesJSON

    let descriptions = (await JSON.parse(
      fs.readFileSync(
        `${LANGUAGES_SOURCE}${application}/descriptions.json`,
        'utf8'
      )
    )) as LanguagesJSON
    let tempKey: string
    let page: number = 1
    let pageIndex: number = 0

    if (application === 'client') {
      // client has a thousand keys.  We must dynamically create content types and assign content as best we can using the id
      Object.keys(languages.data[0].messages)
        .sort()
        .forEach((key: string, index: number) => {
          if (languages.data[0].messages[key].length > 240) {
            longMessages.push(key)
          }
          if (key.length > 49) {
            console.log(
              `${chalk.redBright(
                `/////////////////////////// KEY TOO LONG FOR CONTENTFUL ///////////////////////////`
              )}`
            )
            console.log(key)
          }
          const strippedLabel = key.split('.')[0]
          if (index === 0) {
            tempKey = strippedLabel
          }
          if (tempKey === strippedLabel) {
            if (!sortedKeys.includes(`${strippedLabel}Page${page}`)) {
              const contentTypeID = `${strippedLabel}Page${page}`
              const contentTypeName = `${strippedLabel} Page ${page}`
              sortedKeys.push(contentTypeID)
              // new content type page
              currentContentType = generateNewContentType(
                contentTypeID,
                contentTypeName,
                key,
                longMessages
              )
              currentEditorInterface = generateEditorInterface(
                contentTypeID,
                key,
                descriptions.data[key]
              )
              currentContentTypeEntry = generateContentTypeEntry(
                contentTypeID,
                key,
                SUPPORTED_LOCALES,
                languages.data
              )
              contentfulIds[camelCase(key)] = key
              contentfulTemplate.contentTypes.push(currentContentType)
              contentfulTemplate.editorInterfaces.push(currentEditorInterface)
              contentfulTemplate.entries.push(currentContentTypeEntry)
            } else {
              // existing content type page
              contentfulIds[camelCase(key)] = key
              addFieldToContentType(currentContentType, key, longMessages)
              addControlToEditorInterface(
                currentEditorInterface,
                key,
                descriptions.data[key]
              )
              addFieldToContentTypeEntry(
                currentContentTypeEntry,
                key,
                SUPPORTED_LOCALES,
                languages.data
              )
            }
            if (pageIndex === 45) {
              // the free contentful plan describes a limit of 50 fields per content type.  In reality the limit is 45
              page++
              pageIndex = 0
            } else {
              pageIndex++
            }
          } else {
            // brand new content type
            tempKey = strippedLabel
            pageIndex = 0
            page = 1
            const contentTypeID = `${strippedLabel}Page${page}`
            const contentTypeName = `${strippedLabel} Page ${page}`
            sortedKeys.push(contentTypeID)
            currentContentType = generateNewContentType(
              contentTypeID,
              contentTypeName,
              key,
              longMessages
            )
            currentEditorInterface = generateEditorInterface(
              contentTypeID,
              key,
              descriptions.data[key]
            )

            currentContentTypeEntry = generateContentTypeEntry(
              contentTypeID,
              key,
              SUPPORTED_LOCALES,
              languages.data
            )
            contentfulIds[camelCase(key)] = key
            contentfulTemplate.contentTypes.push(currentContentType)
            contentfulTemplate.editorInterfaces.push(currentEditorInterface)
            contentfulTemplate.entries.push(currentContentTypeEntry)
          }
        })
    } else {
      // SMS notifications
      Object.keys(languages.data[0].messages).forEach(
        (key: string, index: number) => {
          if (languages.data[0].messages[key].length > 240) {
            longMessages.push(key)
          }
          if (key.length > 49) {
            console.log(
              `${chalk.redBright(
                `/////////////////////////// KEY TOO LONG FOR CONTENTFUL ///////////////////////////`
              )}`
            )
            console.log(key)
          }
          if (index === 0) {
            currentContentType = generateNewContentType(
              'notification',
              'notification',
              key,
              longMessages,
              true
            )
            currentEditorInterface = generateEditorInterface(
              'notification',
              key,
              descriptions.data[key],
              true
            )
            currentContentTypeEntry = generateContentTypeEntry(
              'notification',
              key,
              SUPPORTED_LOCALES,
              languages.data,
              true
            )
            contentfulIds[key] = key
            contentfulTemplate.contentTypes.push(currentContentType)
            contentfulTemplate.editorInterfaces.push(currentEditorInterface)
            contentfulTemplate.entries.push(currentContentTypeEntry)
          } else {
            // existing content type page
            contentfulIds[key] = key
            addFieldToContentType(currentContentType, key, longMessages, true)
            addControlToEditorInterface(
              currentEditorInterface,
              key,
              descriptions.data[key],
              true
            )
            addFieldToContentTypeEntry(
              currentContentTypeEntry,
              key,
              SUPPORTED_LOCALES,
              languages.data,
              true
            )
          }
        }
      )
    }

    fs.writeFile(
      `${LANGUAGES_SOURCE}${application}/contentful-import.json`,
      JSON.stringify(contentfulTemplate),
      err => {
        if (err) return console.log(err)
      }
    )
    fs.writeFile(
      `${LANGUAGES_SOURCE}${application}/contentful-ids.json`, // used when loading content from API
      JSON.stringify(contentfulIds),
      err => {
        if (err) return console.log(err)
      }
    )
  } catch (err) {
    throw new Error('cant find file')
  }

  return true
}

convertLanguagesToContentful()
