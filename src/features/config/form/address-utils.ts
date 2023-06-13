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

import { MessageDescriptor } from 'react-intl'
import { ADMIN_LEVELS } from './addresses'
import {
  BirthSection,
  DeathSection,
  IConditional,
  ISerializedForm,
  SerializedFormField
} from './types'
import {
  getAddressConditionals,
  getPlaceOfEventConditionals
} from './validations-and-conditionals'

export enum AddressCases {
  // the below are UPPER_CASE because they map to GQLAddress type enums
  PRIMARY_ADDRESS = 'PRIMARY_ADDRESS',
  SECONDARY_ADDRESS = 'SECONDARY_ADDRESS'
}

export enum EventLocationAddressCases {
  PLACE_OF_BIRTH = 'placeOfBirth',
  PLACE_OF_DEATH = 'placeOfDeath',
  PLACE_OF_MARRIAGE = 'placeOfMarriage'
}

export enum AddressCopyConfigCases {
  PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY = 'primaryAddressSameAsOtherPrimary'
}

export enum AddressSubsections {
  PRIMARY_ADDRESS_SUBSECTION = 'primaryAddress',
  SECONDARY_ADDRESS_SUBSECTION = 'secondaryAddress'
}

export interface IAddressConfiguration {
  precedingFieldId: string
  configurations: AllowedAddressConfigurations[]
}

export type AllowedAddressConfigurations = {
  config:
    | AddressCases
    | AddressSubsections
    | AddressCopyConfigCases
    | EventLocationAddressCases
  label?: MessageDescriptor
  xComparisonSection?: BirthSection | DeathSection
  yComparisonSection?: BirthSection | DeathSection
  conditionalCase?: string
  informant?: boolean
}

export const sentenceCase = (str: string): string =>
  str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })

export function getDependency(location: string, useCase: string) {
  switch (location) {
    case 'state':
      return useCase === 'placeOfBirth' ||
        useCase === 'placeOfDeath' ||
        useCase === 'placeOfMarriage'
        ? 'country'
        : `country${sentenceCase(useCase)}`
    case 'district':
      return useCase === 'placeOfBirth' ||
        useCase === 'placeOfDeath' ||
        useCase === 'placeOfMarriage'
        ? 'state'
        : `state${sentenceCase(useCase)}`
    case 'locationLevel3':
      return useCase === 'placeOfBirth' ||
        useCase === 'placeOfDeath' ||
        useCase === 'placeOfMarriage'
        ? 'district'
        : `district${sentenceCase(useCase)}`
    case 'locationLevel4':
      return useCase === 'placeOfBirth' ||
        useCase === 'placeOfDeath' ||
        useCase === 'placeOfMarriage'
        ? 'locationLevel3'
        : `locationLevel3${sentenceCase(useCase)}`
    case 'locationLevel5':
      return useCase === 'placeOfBirth' ||
        useCase === 'placeOfDeath' ||
        useCase === 'placeOfMarriage'
        ? 'locationLevel4'
        : `locationLevel4${sentenceCase(useCase)}`
    default:
      throw Error('Supplied address dependency is unsupported')
  }
}

export function getLocationSelect(
  location: string,
  useCase: string,
  locationIndex: number,
  informant: boolean
): SerializedFormField {
  return {
    name: `${location}${sentenceCase(useCase)}`,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: '',
      description: `Title for the ${location} select`,
      id: `form.field.label.${location}`
    },
    customisable: false,
    previewGroup: `${useCase}Address`,
    required: true,
    initialValue: '',
    validator: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    dynamicOptions: {
      resource: 'locations',
      dependency: getDependency(location, useCase),
      initialValue: 'agentDefault'
    },
    conditionals: getAddressConditionals(location, useCase),
    mapping: {
      mutation: informant
        ? {
            operation: 'fieldValueNestingTransformer',
            parameters: [
              'individual',
              {
                operation: 'fieldToAddressTransformer',
                parameters: [
                  useCase.toUpperCase() === 'PRIMARY'
                    ? AddressCases.PRIMARY_ADDRESS
                    : AddressCases.SECONDARY_ADDRESS,
                  locationIndex,
                  location
                ]
              },
              'address'
            ]
          }
        : {
            operation: 'fieldToAddressTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex,
              location
            ]
          },
      query: informant
        ? {
            operation: 'nestedValueToFieldTransformer',
            parameters: [
              'individual',
              {
                operation: 'addressToFieldTransformer',
                parameters: [
                  useCase.toUpperCase() === 'PRIMARY'
                    ? AddressCases.PRIMARY_ADDRESS
                    : AddressCases.SECONDARY_ADDRESS,
                  locationIndex,
                  location
                ]
              }
            ]
          }
        : {
            operation: 'addressToFieldTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex,
              location
            ]
          }
    }
  }
}

export function getPlaceOfEventLocationSelect(
  location: string,
  configCase: EventLocationAddressCases,
  locationIndex: number
): SerializedFormField {
  return {
    name: location,
    customisable: false,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: sentenceCase(location),
      description: `Title for the ${location} select`,
      id: `form.field.label.${location}`
    },
    previewGroup: configCase,
    required: true,
    initialValue: '',
    validator: [],
    placeholder: {
      defaultMessage: 'Select',
      description: 'Placeholder text for a select',
      id: 'form.field.select.placeholder'
    },
    dynamicOptions: {
      resource: 'locations',
      dependency: getDependency(location, configCase),
      initialValue: 'agentDefault'
    },
    conditionals: getPlaceOfEventConditionals(location, configCase),
    mapping: {
      template: {
        fieldName: configCase,
        operation: 'eventLocationAddressOfflineTransformer',
        parameters: [location, configCase]
      },
      mutation: {
        operation:
          configCase === EventLocationAddressCases.PLACE_OF_BIRTH
            ? 'birthEventLocationMutationTransformer'
            : configCase === EventLocationAddressCases.PLACE_OF_DEATH
            ? 'deathEventLocationMutationTransformer'
            : 'marriageEventLocationMutationTransformer',
        parameters: [locationIndex]
      },
      query: {
        operation: 'eventLocationQueryTransformer',
        parameters: [
          locationIndex,
          location,
          {
            fieldsToIgnoreForLocalAddress: [
              'internationalDistrict',
              'internationalState'
            ],
            fieldsToIgnoreForInternationalAddress: [
              'locationLevel3',
              'locationLevel4',
              'locationLevel5',
              'district',
              'state'
            ]
          }
        ]
      }
    }
  }
}

export function getIdentifiersFromFieldId(fieldId: string) {
  const splitIds = fieldId.split('.')
  return {
    event: splitIds[0] as Event,
    sectionId: splitIds[1],
    groupId: splitIds[2],
    fieldName: splitIds[3]
  }
}

export function getSectionIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, sectionId } = getIdentifiersFromFieldId(fieldId)

  const sectionIndex = form.sections.findIndex(({ id }) => id === sectionId)
  return {
    event,
    sectionIndex
  }
}

export function getGroupIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, groupId } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex } = getSectionIdentifiers(fieldId, form)

  const groups = form.sections[sectionIndex].groups

  const groupIndex = groups.findIndex(({ id }) => id === groupId)

  return {
    event,
    sectionIndex,
    groupIndex
  }
}

export function getFieldIdentifiers(fieldId: string, form: ISerializedForm) {
  const { event, fieldName } = getIdentifiersFromFieldId(fieldId)

  const { sectionIndex, groupIndex } = getGroupIdentifiers(fieldId, form)

  const fields = form.sections[sectionIndex].groups[groupIndex].fields

  const fieldIndex = fields.findIndex(({ name }) => name === fieldName)

  return {
    event,
    sectionIndex,
    groupIndex,
    fieldIndex
  }
}
