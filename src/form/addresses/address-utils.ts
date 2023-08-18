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
import { ADMIN_LEVELS, defaultAddressConfiguration } from '.'
import {
  ISerializedForm,
  SerializedFormField,
  Event,
  Conditional,
  IPreviewGroup,
  EventLocationAddressCases,
  AddressCases,
  AllowedAddressConfigurations,
  AddressSubsections,
  AddressCopyConfigCases,
  IAddressConfiguration
} from '../types/types'
import {
  getAddressFields,
  getPlaceOfEventAddressFields,
  getXAddressSameAsY
} from './address-fields'
import { getPreviewGroups } from '../common/preview-groups'
import { cloneDeep } from 'lodash'

export function getRuralOrUrbanConditionals(
  useCase: string,
  defaultConditionals: Conditional[]
) {
  let customConditionals: Conditional[] = []
  switch (ADMIN_LEVELS) {
    case 1:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        }
      ]
      break
    case 2:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        }
      ]
      break
    case 3:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        }
      ]
      break
    case 4:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel4${sentenceCase(useCase)}`
        }
      ]
      break
  }
  return defaultConditionals.concat(customConditionals)
}

export function getPlaceOfEventConditionals(location: string, useCase: string) {
  switch (location) {
    case 'country':
      return [
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        }
      ]
    case 'state':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel4'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'ruralOrUrban':
      return getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ])
    case 'urban':
      return getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "URBAN"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ])
    case 'rural':
      return getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            useCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${useCase}!="OTHER" && values.${useCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: 'values.ruralOrUrban !== "RURAL"'
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ])
    default:
      throw Error(
        'Supplied event location is unsupported by current conditionals'
      )
  }
}

export function getAddressConditionals(location: string, useCase: string) {
  switch (location) {
    case 'country':
      return [
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('country${sentenceCase(
            useCase
          )}')`
        }
      ]
    case 'state':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel4${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'ruralOrUrban':
      return getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ])
    case 'urban':
      return getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "URBAN"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ])
    case 'rural':
      return getRuralOrUrbanConditionals(useCase, [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `values.ruralOrUrban${sentenceCase(useCase)} !== "RURAL"`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ])
    default:
      throw Error('Supplied location is unsupported by current conditionals')
  }
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

export function getMapping(
  location: string,
  useCase: string,
  fieldName: string,
  locationIndex?: number
) {
  return {
    template:
      useCase in EventLocationAddressCases
        ? locationIndex
          ? {
              fieldName,
              operation: 'eventLocationAddressLineTemplateTransformer',
              parameters: [locationIndex, getAddressLineLocationLevel(location)]
            }
          : {
              fieldName,
              operation: 'eventLocationAddressFHIRPropertyTemplateTransformer',
              parameters: [location]
            }
        : locationIndex
        ? {
            fieldName,
            operation: 'addressLineTemplateTransformer',
            parameters: [useCase, locationIndex, fieldName]
          }
        : {
            fieldName,
            operation: 'addressFHIRPropertyTemplateTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              location
            ]
          },
    mutation:
      useCase in EventLocationAddressCases
        ? {
            operation:
              useCase === EventLocationAddressCases.PLACE_OF_BIRTH
                ? 'birthEventLocationMutationTransformer'
                : useCase === EventLocationAddressCases.PLACE_OF_DEATH
                ? 'deathEventLocationMutationTransformer'
                : 'marriageEventLocationMutationTransformer',
            parameters: [
              { transformedFieldName: location, lineNumber: locationIndex }
            ]
          }
        : locationIndex
        ? {
            operation: 'fieldToAddressLineTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex
            ]
          }
        : {
            operation: 'fieldToAddressFhirPropertyTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              location
            ]
          },
    query:
      useCase in EventLocationAddressCases
        ? {
            operation: 'eventLocationQueryTransformer',
            parameters: [
              { transformedFieldName: location, lineNumber: locationIndex },
              {
                fieldsToIgnoreForLocalAddress: [
                  `internationalDistrict${sentenceCase(useCase)}`,
                  `internationalState${sentenceCase(useCase)}`
                ],
                fieldsToIgnoreForInternationalAddress: [
                  `locationLevel3${sentenceCase(useCase)}`,
                  `locationLevel4${sentenceCase(useCase)}`,
                  `locationLevel5${sentenceCase(useCase)}`,
                  `district${sentenceCase(useCase)}`,
                  `state${sentenceCase(useCase)}`
                ]
              }
            ]
          }
        : locationIndex
        ? {
            operation: 'addressLineToFieldTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex,
              location
            ]
          }
        : {
            operation: 'addressFhirPropertyToFieldTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              location
            ]
          }
  }
}

// this function name is horrible, rename it
export function getAddressLineLocationLevel(location: string) {
  switch (location) {
    case 'locationLevel3':
      return 'locationLevel3'
    case 'locationLevel4':
      return 'locationLevel4'
    case 'locationLevel5':
      return 'locationLevel5'
    default:
      return ''
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

export const getAddressSubsection = (
  previewGroup: AddressSubsections,
  label: MessageDescriptor,
  conditionalCase?: string
): SerializedFormField[] => {
  const fields: SerializedFormField[] = []
  const subsection: SerializedFormField = {
    name: previewGroup,
    type: 'SUBSECTION_HEADER',
    label,
    previewGroup: previewGroup,
    initialValue: '',
    validator: []
  }

  if (conditionalCase) {
    subsection['conditionals'] = [
      {
        action: 'hide',
        expression: `${conditionalCase}`
      }
    ]
  }
  fields.push(subsection)
  return fields
}

function getAddressFieldsByConfiguration(
  configuration: AllowedAddressConfigurations
): SerializedFormField[] {
  switch (configuration.config) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
    case EventLocationAddressCases.PLACE_OF_DEATH:
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
      return getPlaceOfEventAddressFields(configuration.config)
    case AddressCases.PRIMARY_ADDRESS:
      return getAddress(
        AddressCases.PRIMARY_ADDRESS,
        configuration.conditionalCase
      )
    case AddressCases.SECONDARY_ADDRESS:
      return getAddress(
        AddressCases.SECONDARY_ADDRESS,
        configuration.conditionalCase
      )
    case AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY:
      if (
        !configuration.label ||
        !configuration.xComparisonSection ||
        !configuration.yComparisonSection
      ) {
        throw new Error(
          `Invalid address comparison case configuration for: ${configuration.config}`
        )
      }
      return getXAddressSameAsY(
        configuration.xComparisonSection,
        configuration.yComparisonSection,
        configuration.label,
        configuration.conditionalCase
      )
    case AddressSubsections.PRIMARY_ADDRESS_SUBSECTION:
    case AddressSubsections.SECONDARY_ADDRESS_SUBSECTION:
      if (!configuration.label) {
        throw new Error(
          `Invalid address subsection configuration for: ${configuration.config}`
        )
      }
      return getAddressSubsection(
        configuration.config,
        configuration.label,
        configuration.conditionalCase
      )
    default:
      return []
  }
}

export function decorateFormsWithAddresses(
  defaultEventForm: ISerializedForm,
  event: string
): ISerializedForm {
  const newForm = cloneDeep(defaultEventForm)
  defaultAddressConfiguration.forEach(
    ({ precedingFieldId, configurations }: IAddressConfiguration) => {
      if (precedingFieldId.includes(event)) {
        const { sectionIndex, groupIndex, fieldIndex } = getFieldIdentifiers(
          precedingFieldId,
          newForm
        )

        let addressFields: SerializedFormField[] = []
        let previewGroups: IPreviewGroup[] = []
        configurations.forEach((configuration) => {
          addressFields = addressFields.concat(
            getAddressFieldsByConfiguration(configuration)
          )
          previewGroups = previewGroups.concat(getPreviewGroups(configuration))
        })
        newForm.sections[sectionIndex].groups[groupIndex].fields.splice(
          fieldIndex + 1,
          0,
          ...addressFields
        )

        const group = newForm.sections[sectionIndex].groups[groupIndex]
        if (group.previewGroups) {
          group.previewGroups = group.previewGroups.concat(previewGroups)
        } else {
          group.previewGroups = previewGroups
        }
      }
    }
  )

  return newForm
}

export function getAddress(
  addressCase: AddressCases,
  conditionalCase?: string
): SerializedFormField[] {
  const defaultFields: SerializedFormField[] = getAddressFields(addressCase)
  if (conditionalCase) {
    defaultFields.forEach((field) => {
      let conditional
      if (conditionalCase) {
        conditional = {
          action: 'hide',
          expression: `${conditionalCase}`
        }
      }
      if (
        conditional &&
        field.conditionals &&
        field.conditionals.filter(
          (conditional) => conditional.expression === conditionalCase
        ).length === 0
      ) {
        field.conditionals.push(conditional)
      } else if (conditional && !field.conditionals) {
        field.conditionals = [conditional]
      }
    })
  }
  return defaultFields
}
