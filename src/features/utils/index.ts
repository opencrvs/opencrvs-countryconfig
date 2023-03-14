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

import fetch from 'node-fetch'
import { FHIR_URL } from '@countryconfig/constants'
import { callingCountries } from 'country-data'
import { createHash } from 'crypto'
import * as uuid from 'uuid/v4'
import * as csv2json from 'csv2json'
import { createReadStream } from 'fs'

export const GENERATE_TYPE_RN = 'registrationNumber'
export const CHILD_CODE = 'child-details'
export const DECEASED_CODE = 'deceased-details'
export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'

export interface ISaltedHash {
  hash: string
  salt: string
}

export enum EVENT_TYPE {
  BIRTH = 'BIRTH',
  DEATH = 'DEATH'
}

export interface ILocation {
  id?: string
  name?: string
  status?: string
  alias?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
}

type ISupportedType =
  | fhir.Practitioner
  | fhir.PractitionerRole
  | fhir.Location
  | fhir.Patient
  | ICSVLocation

export interface ICSVLocation {
  statisticalID: string
  name: string
  alias: string
  partOf: string
  code: string
  physicalType: string
}

export interface IStatistic {
  [key: string]: string
}

export interface ILocation {
  id?: string
  name?: string
  alias?: string
  address?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
  statistics: Array<{ name: string; year: number; value: number }>
}

export function getTaskResource(
  bundle: fhir.Bundle & fhir.BundleEntry
): fhir.Task | undefined {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0] ||
    !bundle.entry[0].resource
  ) {
    throw new Error('Invalid FHIR bundle found')
  }

  if (bundle.entry[0].resource.resourceType === 'Composition') {
    return getTaskResourceFromFhirBundle(bundle as fhir.Bundle)
  } else if (bundle.entry[0].resource.resourceType === 'Task') {
    return bundle.entry[0].resource as fhir.Task
  } else {
    throw new Error('Unable to find Task Bundle from the provided data')
  }
}

export function getTaskResourceFromFhirBundle(fhirBundle: fhir.Bundle) {
  const taskEntry =
    fhirBundle.entry &&
    fhirBundle.entry.find((entry: fhir.BundleEntry) => {
      if (entry.resource && entry.resource.resourceType === 'Task') {
        return true
      }
      return false
    })

  return taskEntry && (taskEntry.resource as fhir.Task)
}

export function findExtension(
  url: string,
  extensions: fhir.Extension[]
): fhir.Extension | undefined {
  const extension = extensions.find((obj: fhir.Extension) => {
    return obj.url === url
  })
  return extension
}

export function getTrackingIdFromTaskResource(taskResource: fhir.Task) {
  const trackingIdentifier =
    taskResource &&
    taskResource.identifier &&
    taskResource.identifier.find((identifier) => {
      return (
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id` ||
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/death-tracking-id` ||
        identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/marriage-tracking-id`
      )
    })
  if (!trackingIdentifier || !trackingIdentifier.value) {
    throw new Error("Didn't find any identifier for tracking id")
  }
  return trackingIdentifier.value
}

export function getEventDateFromBundle(bundle: fhir.Bundle): string {
  const personInfo =
    getEventType(bundle) === EVENT_TYPE.DEATH
      ? {
          sectionCode: DECEASED_CODE,
          eventDateFieldKey: 'deceasedDateTime'
        }
      : {
          sectionCode: CHILD_CODE,
          eventDateFieldKey: 'birthDate'
        }
  const patient = findPersonEntryFromBundle(personInfo.sectionCode, bundle)
  if (!patient || !patient[personInfo.eventDateFieldKey]) {
    throw new Error('Unable to find event date from given bundle')
  }
  return patient[personInfo.eventDateFieldKey] as string
}

export function getEventType(bundle: fhir.Bundle) {
  if (
    !bundle ||
    bundle.type !== 'document' ||
    !bundle.entry ||
    !bundle.entry[0] ||
    !bundle.entry[0].resource ||
    bundle.entry[0].resource.resourceType !== 'Composition'
  ) {
    throw new Error('Invalid FHIR bundle found')
  }
  const composition = bundle.entry[0].resource as fhir.Composition

  const eventType =
    composition &&
    composition.type &&
    composition.type.coding &&
    composition.type.coding[0].code

  if (eventType === 'death-declaration' || eventType === 'death-notification') {
    return EVENT_TYPE.DEATH
  } else {
    return EVENT_TYPE.BIRTH
  }
}

export function findPersonEntryFromBundle(
  sectionCode: string,
  bundle: fhir.Bundle
): fhir.Patient {
  const composition =
    bundle && bundle.entry && (bundle.entry[0].resource as fhir.Composition)

  const personSectionEntry = getSectionEntryBySectionCode(
    composition,
    sectionCode
  )
  const personEntry =
    bundle.entry &&
    bundle.entry.find((entry) => entry.fullUrl === personSectionEntry.reference)

  if (!personEntry) {
    throw new Error(
      'Patient referenced from composition section not found in FHIR bundle'
    )
  }
  return personEntry.resource as fhir.Patient
}

export function getSectionEntryBySectionCode(
  composition: fhir.Composition | undefined,
  sectionCode: string
): fhir.Reference {
  const personSection =
    composition &&
    composition.section &&
    composition.section.find((section: fhir.CompositionSection) => {
      if (!section.code || !section.code.coding) {
        return false
      }
      return section.code.coding.some((coding) => coding.code === sectionCode)
    })

  if (!personSection || !personSection.entry) {
    throw new Error(
      `Invalid person section found for given code: ${sectionCode}`
    )
  }
  return personSection.entry[0]
}

export const getFromFhir = (suffix: string) => {
  return fetch(`${FHIR_URL}${suffix.startsWith('/') ? '' : '/'}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then((response) => {
      return response.json()
    })
    .catch((error) => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export const sendToFhir = (
  doc: ISupportedType,
  suffix: string,
  method: string
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    body: JSON.stringify(doc),
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then((response) => {
      return response
    })
    .catch((error) => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}

export async function updateResourceInHearth(resource: fhir.ResourceBase) {
  const res = await fetch(
    `${FHIR_URL}/${resource.resourceType}/${resource.id}`,
    {
      method: 'PUT',
      body: JSON.stringify(resource),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `FHIR update to ${resource.resourceType} failed with [${
        res.status
      }] body: ${await res.text()}`
    )
  }

  return res.text()
}

export async function getLocationIDByDescription(description: string) {
  const res = await fetch(
    `${FHIR_URL}/Location?identifier=ADMIN_STRUCTURE_${description}`
  )
  const locationBundle: fhir.Bundle = await res.json()

  if (
    !locationBundle ||
    !locationBundle.entry ||
    !locationBundle.entry[0] ||
    !locationBundle.entry[0].resource
  ) {
    throw new Error('Received invalid FHIR location bundle')
  }

  const location = locationBundle.entry[0].resource as fhir.Location
  return location.id as string
}

export function checkDuplicate(
  propertyName: string,
  inputArray: ISupportedType[]
): boolean {
  const valueArr = inputArray.map((item: ISupportedType) => {
    return item[propertyName]
  })
  const isDuplicate = valueArr.some((item, index) => {
    return valueArr.indexOf(item) !== index
  })

  return isDuplicate
}

export const titleCase = (str: string) => {
  const stringArray = str.toLowerCase().split(' ')
  // tslint:disable-next-line
  for (let i = 0; i < stringArray.length; i++) {
    stringArray[i] =
      stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1)
  }
  return stringArray.join(' ')
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
