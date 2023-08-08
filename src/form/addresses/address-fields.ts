import { MessageDescriptor } from 'react-intl'
import {
  AddressCases,
  AddressCopyConfigCases,
  AddressSubsections,
  EventLocationAddressCases,
  FLEX_DIRECTION,
  SerializedFormField
} from '../types/types'
import {
  getAddressConditionals,
  getDependency,
  getPlaceOfEventConditionals,
  getRuralOrUrbanConditionals,
  sentenceCase
} from './address-utils'
import {
  urbanRuralRadioOptions,
  yesNoRadioOptions
} from '../common/select-options'
import { ADMIN_LEVELS } from '.'

export const getXAddressSameAsY = (
  xComparisonSection: string,
  yComparisonSection: string,
  label: MessageDescriptor,
  conditionalCase?: string
): SerializedFormField[] => {
  const copyAddressField: SerializedFormField = {
    name: AddressCopyConfigCases.PRIMARY_ADDRESS_SAME_AS_OTHER_PRIMARY,
    type: 'RADIO_GROUP',
    label,
    required: true,
    initialValue: true,
    previewGroup: AddressSubsections.PRIMARY_ADDRESS_SUBSECTION,
    validator: [],
    options: yesNoRadioOptions,
    conditionals: conditionalCase
      ? [
          {
            action: 'hide',
            expression: `${conditionalCase}`
          }
        ]
      : [],
    mapping: {
      mutation: {
        operation: 'copyAddressTransformer',
        parameters: [
          AddressCases.PRIMARY_ADDRESS,
          yComparisonSection,
          AddressCases.PRIMARY_ADDRESS,
          xComparisonSection
        ]
      },
      query: {
        operation: 'sameAddressFieldTransformer',
        parameters: [
          AddressCases.PRIMARY_ADDRESS,
          yComparisonSection,
          AddressCases.PRIMARY_ADDRESS,
          xComparisonSection
        ]
      }
    }
  }
  return [copyAddressField]
}

export function getAddressLocationSelect(
  location: string,
  useCase: string,
  locationIndex?: number
): SerializedFormField {
  return {
    name: `${location}${sentenceCase(useCase)}`,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: '',
      description: `Title for the ${location} select`,
      id: `form.field.label.${location}`
    },
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
    mapping: locationIndex
      ? {
          mutation: {
            operation: 'fieldToAddressLineTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex
            ]
          },
          query: {
            operation: 'addressLineToFieldTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              locationIndex,
              location
            ]
          }
        }
      : {
          mutation: {
            operation: 'fieldToAddressFhirPropertyTransformer',
            parameters: [
              useCase.toUpperCase() === 'PRIMARY'
                ? AddressCases.PRIMARY_ADDRESS
                : AddressCases.SECONDARY_ADDRESS,
              location
            ]
          },
          query: {
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
}

export function getPlaceOfEventLocationSelect(
  location: string,
  configCase: EventLocationAddressCases,
  locationIndex?: number
): SerializedFormField {
  return {
    name: location,
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
        parameters: [
          { transformedFieldName: location, lineNumber: locationIndex }
        ]
      },
      query: {
        operation: 'eventLocationQueryTransformer',
        parameters: [
          { transformedFieldName: location, lineNumber: locationIndex },
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

function getAdminLevelSelects(useCase: string): SerializedFormField[] {
  switch (ADMIN_LEVELS) {
    case 1:
      return [getAddressLocationSelect('state', useCase)]
    case 2:
      return [
        getAddressLocationSelect('state', useCase),
        getAddressLocationSelect('district', useCase)
      ]
    case 3:
      return [
        getAddressLocationSelect('state', useCase),
        getAddressLocationSelect('district', useCase),
        getAddressLocationSelect('locationLevel3', useCase, 10)
      ]
    case 4:
      return [
        getAddressLocationSelect('state', useCase),
        getAddressLocationSelect('district', useCase),
        getAddressLocationSelect('locationLevel3', useCase, 10),
        getAddressLocationSelect('locationLevel4', useCase, 11)
      ]
    case 5:
      return [
        getAddressLocationSelect('state', useCase),
        getAddressLocationSelect('district', useCase),
        getAddressLocationSelect('locationLevel3', useCase, 10),
        getAddressLocationSelect('locationLevel4', useCase, 11),
        getAddressLocationSelect('locationLevel5', useCase, 12)
      ]
    default:
      return [getAddressLocationSelect('state', useCase)]
  }
}

function getPlaceOfEventAdminLevelSelects(
  configCase: EventLocationAddressCases
): SerializedFormField[] {
  switch (ADMIN_LEVELS) {
    case 1:
      return [getPlaceOfEventLocationSelect('state', configCase)]
    case 2:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase)
      ]
    case 3:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10)
      ]
    case 4:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10),
        getPlaceOfEventLocationSelect('locationLevel4', configCase, 11)
      ]
    case 5:
      return [
        getPlaceOfEventLocationSelect('state', configCase),
        getPlaceOfEventLocationSelect('district', configCase),
        getPlaceOfEventLocationSelect('locationLevel3', configCase, 10),
        getPlaceOfEventLocationSelect('locationLevel4', configCase, 11),
        getPlaceOfEventLocationSelect('locationLevel5', configCase, 12)
      ]
    default:
      return [getPlaceOfEventLocationSelect('state', configCase)]
  }
}

export function getPlaceOfEventAddressFields(
  configCase: EventLocationAddressCases
): SerializedFormField[] {
  return [
    {
      name: 'country',
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: configCase,
      required: true,
      initialValue: 'FAR',
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: {
        resource: 'countries'
      },
      conditionals: [
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['country', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'country' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'country' }]
        }
      }
    },
    ...getPlaceOfEventAdminLevelSelects(configCase),
    {
      name: 'ruralOrUrban',
      type: 'RADIO_GROUP',
      label: {
        defaultMessage: ' ',
        description: 'Empty label for form field',
        id: 'form.field.label.emptyLabel'
      },
      options: urbanRuralRadioOptions,
      initialValue: 'URBAN',
      flexDirection: FLEX_DIRECTION.ROW,
      required: false,
      hideValueInPreview: true,
      previewGroup: configCase,
      validator: [],
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]),
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 5 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 5 }]
        }
      }
    },
    {
      name: 'cityUrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
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
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['city', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        }
      }
    },
    {
      name: 'addressLine3UrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
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
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [2, `${configCase}AddressLine3`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 2 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 2 }]
        }
      }
    },
    {
      name: 'addressLine2UrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
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
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [1, `${configCase}AddressLine2`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 1 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 1 }]
        }
      }
    },
    {
      name: 'numberUrbanOption',
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
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
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [0, `${configCase}Number`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 0 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 0 }]
        }
      }
    },
    {
      name: 'postalCode',
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
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
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['postalCode', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        }
      }
    },
    {
      name: 'addressLine5',
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals: getRuralOrUrbanConditionals('', [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
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
      ]),
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [4, `${configCase}AddressLine5`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 4 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 4 }]
        }
      }
    },
    {
      name: 'internationalState',
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      previewGroup: configCase,
      required: true,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['state', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'state' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            { transformedFieldName: 'state' },
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'internationalDistrict',
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      previewGroup: configCase,
      required: true,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressOfflineTransformer',
          parameters: ['district', configCase]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'district' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [
            { transformedFieldName: 'district' },
            {
              fieldsToIgnoreForLocalAddress: [
                'internationalDistrict',
                'internationalState'
              ],
              fieldsToIgnoreForInternationalAddress: ['district', 'state']
            }
          ]
        }
      }
    },
    {
      name: 'internationalCity',
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'city' }]
        }
      }
    },
    {
      name: 'internationalAddressLine1',
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [6, `${configCase}AddressLine1`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 6 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 6 }]
        }
      }
    },
    {
      name: 'internationalAddressLine2',
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [7, `${configCase}AddressLine2`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 7 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 7 }]
        }
      }
    },
    {
      name: 'internationalAddressLine3',
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        template: {
          fieldName: configCase,
          operation: 'eventLocationAddressLineTemplateTransformer',
          parameters: [8, `${configCase}AddressLine3`]
        },
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ lineNumber: 8 }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ lineNumber: 8 }]
        }
      }
    },
    {
      name: 'internationalPostcode',
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: configCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals: [
        {
          action: 'hide',
          expression: 'isDefaultCountry(values.country)'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        }
      ],
      mapping: {
        mutation: {
          operation:
            configCase === EventLocationAddressCases.PLACE_OF_BIRTH
              ? 'birthEventLocationMutationTransformer'
              : configCase === EventLocationAddressCases.PLACE_OF_DEATH
              ? 'deathEventLocationMutationTransformer'
              : 'marriageEventLocationMutationTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        },
        query: {
          operation: 'eventLocationQueryTransformer',
          parameters: [{ transformedFieldName: 'postalCode' }]
        }
      }
    }
  ]
}

export function getAddressFields(
  addressCase: AddressCases
): SerializedFormField[] {
  const useCase =
    addressCase === AddressCases.PRIMARY_ADDRESS ? 'primary' : 'secondary'
  return [
    {
      name: `country${sentenceCase(useCase)}`,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: 'FAR',
      validator: [],
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: {
        resource: 'countries'
      },
      conditionals: [
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('countryPrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `country${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'country']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'country']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'country']
        }
      }
    },
    ...getAdminLevelSelects(useCase),
    {
      name: `ruralOrUrban${sentenceCase(useCase)}`,
      type: 'RADIO_GROUP',
      label: {
        defaultMessage: ' ',
        description: 'Empty label for form field',
        id: 'form.field.label.emptyLabel'
      },
      options: urbanRuralRadioOptions,
      initialValue: 'URBAN',
      flexDirection: FLEX_DIRECTION.ROW,
      previewGroup: `${useCase}Address`,
      hideValueInPreview: true,
      required: false,
      validator: [],
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 5]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 5]
        }
      }
    },
    {
      name: `cityUrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        template: {
          fieldName: `cityUrbanOption${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'city']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'city']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'city']
        }
      }
    },
    {
      name: `addressLine3UrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        template: {
          fieldName: `addressLine3UrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 2, 'addressLine3']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 2]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 2]
        }
      }
    },
    {
      name: `addressLine2UrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        template: {
          fieldName: `addressLine2UrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 1, 'addressLine2']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 1]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 1]
        }
      }
    },
    {
      name: `numberUrbanOption${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        template: {
          fieldName: `numberUrbanOption${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 0, 'number']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 0]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 0]
        }
      }
    },
    {
      name: `postcode${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        template: {
          fieldName: `postcode${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'postalCode']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'postalCode']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'postalCode']
        }
      }
    },
    {
      name: `addressLine5${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine5'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}`,
      conditionals: getRuralOrUrbanConditionals(useCase, [
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
      ]),
      mapping: {
        template: {
          fieldName: `addressLine5${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 4, 'addressLine5']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 4]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 4]
        }
      }
    },
    {
      name: `internationalState${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalStatePrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalState${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'state']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'state']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'state']
        }
      }
    },
    {
      name: `internationalDistrict${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      previewGroup: `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalDistrictPrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalDistrict${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'district']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'district']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'district']
        }
      }
    },
    {
      name: `internationalCity${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalCityPrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalCity${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'city']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'city']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'city']
        }
      }
    },
    {
      name: `internationalAddressLine1${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalAddressLine1Primary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine1${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 6, 'addressLine1']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 6]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 6]
        }
      }
    },
    {
      name: `internationalAddressLine2${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine2${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 7, 'addressLine2']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 7]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 7]
        }
      }
    },
    {
      name: `internationalAddressLine3${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalAddressLine3${sentenceCase(useCase)}`,
          operation: 'addressLineTemplateTransformer',
          parameters: [addressCase, 8, 'addressLine3']
        },
        mutation: {
          operation: 'fieldToAddressLineTransformer',
          parameters: [addressCase, 8]
        },
        query: {
          operation: 'addressLineToFieldTransformer',
          parameters: [addressCase, 8]
        }
      }
    },
    {
      name: `internationalPostcode${sentenceCase(useCase)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}`,
      conditionals: [
        {
          action: 'hide',
          expression: `isDefaultCountry(values.country${sentenceCase(useCase)})`
        },
        {
          action: 'disable',
          expression: `values?.fieldsModifiedByNidUserInfo?.includes('internationalPostcodePrimary')`
        }
      ],
      mapping: {
        template: {
          fieldName: `internationalPostcode${sentenceCase(useCase)}`,
          operation: 'individualAddressTransformer',
          parameters: [addressCase, 'postalCode']
        },
        mutation: {
          operation: 'fieldToAddressFhirPropertyTransformer',
          parameters: [addressCase, 'postalCode']
        },
        query: {
          operation: 'addressFhirPropertyToFieldTransformer',
          parameters: [addressCase, 'postalCode']
        }
      }
    }
  ]
}
