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
  getMapping,
  getPlaceOfEventConditionals,
  sentenceCase
} from './address-utils'
import {
  urbanRuralRadioOptions,
  yesNoRadioOptions
} from '../common/select-options'
import { ADMIN_LEVELS } from '.'

// A radio group field that allows you to select an address from another section
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

// A select field that uses the loaded administrative location levels from Humdata
export function getAddressLocationSelect(
  section: string,
  location: string,
  useCase: string,
  locationIndex?: number
): SerializedFormField {
  const fieldName = `${location}${sentenceCase(useCase)}${sentenceCase(
    section
  )}`
  return {
    name: fieldName,
    type: 'SELECT_WITH_DYNAMIC_OPTIONS',
    label: {
      defaultMessage: sentenceCase(location),
      description: `Title for the ${location} select`,
      id: `form.field.label.${location}`
    },
    previewGroup:
      useCase in EventLocationAddressCases ? useCase : `${useCase}Address`,
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
      dependency: getDependency(location, useCase, section),
      initialValue: 'agentDefault'
    },
    conditionals:
      useCase in EventLocationAddressCases
        ? getPlaceOfEventConditionals(
            section,
            location,
            useCase as EventLocationAddressCases
          )
        : getAddressConditionals(section, location, useCase),
    mapping: getMapping(
      'SELECT_WITH_DYNAMIC_OPTIONS',
      location,
      useCase,
      fieldName,
      locationIndex
    )
  }
}

// Select fields are added for each administrative location level from Humdata
function getAdminLevelSelects(
  section: string,
  useCase: string
): SerializedFormField[] {
  switch (ADMIN_LEVELS) {
    case 1:
      return [getAddressLocationSelect(section, 'state', useCase)]
    case 2:
      return [
        getAddressLocationSelect(section, 'state', useCase),
        getAddressLocationSelect(section, 'district', useCase)
      ]
    case 3:
      return [
        getAddressLocationSelect(section, 'state', useCase),
        getAddressLocationSelect(section, 'district', useCase),
        getAddressLocationSelect(section, 'locationLevel3', useCase, 10)
      ]
    case 4:
      return [
        getAddressLocationSelect(section, 'state', useCase),
        getAddressLocationSelect(section, 'district', useCase),
        getAddressLocationSelect(section, 'locationLevel3', useCase, 10),
        getAddressLocationSelect(section, 'locationLevel4', useCase, 11)
      ]
    case 5:
      return [
        getAddressLocationSelect(section, 'state', useCase),
        getAddressLocationSelect(section, 'district', useCase),
        getAddressLocationSelect(section, 'locationLevel3', useCase, 10),
        getAddressLocationSelect(section, 'locationLevel4', useCase, 11),
        getAddressLocationSelect(section, 'locationLevel5', useCase, 12)
      ]
    default:
      return [getAddressLocationSelect(section, 'state', useCase)]
  }
}

// The fields that appear whenever an address is rendered
// We do not advise changing address fields
export function getAddressFields(
  section: string,
  addressCase: EventLocationAddressCases | AddressCases
): SerializedFormField[] {
  let useCase = addressCase as string
  if (addressCase in AddressCases) {
    useCase = useCase === AddressCases.PRIMARY_ADDRESS ? 'primary' : 'secondary'
  }
  return [
    {
      name: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: useCase,
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
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'country', useCase)
          : getAddressConditionals(section, 'country', useCase),
      mapping: getMapping(
        'SELECT_WITH_OPTIONS',
        'country', // Maps form value to FHIR prop. Use empty string for FHIR Address line index
        useCase,
        `country${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    },
    // Select fields are added for each administrative location level from Humdata
    ...getAdminLevelSelects(section, useCase),
    {
      name: `ruralOrUrban${sentenceCase(useCase)}${sentenceCase(section)}`,
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
      previewGroup: useCase,
      validator: [],
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'ruralOrUrban', useCase)
          : getAddressConditionals(section, 'ruralOrUrban', useCase),
      mapping: getMapping(
        'RADIO_GROUP',
        '', // No FHIR prop exists for this custom address prop. Use empty string for FHIR Address line index
        useCase,
        `country${sentenceCase(useCase)}${sentenceCase(section)}`,
        5 // The selected index in the FHIR Address line array to store this value
      )
    },
    {
      name: `city${sentenceCase(useCase)}${sentenceCase(section)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Town',
        description: 'Title for the address line 4',
        id: 'form.field.label.cityUrbanOption'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'urban', useCase)
          : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        'TEXT',
        'city',
        useCase,
        `city${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    },
    {
      name: `addressLine3UrbanOption${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 3 option 2',
        id: 'form.field.label.addressLine3UrbanOption'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'urban', useCase)
          : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `addressLine3UrbanOption${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        2
      )
    },
    {
      name: `addressLine2UrbanOption${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Street',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'urban', useCase)
          : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `addressLine2UrbanOption${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        1
      )
    },
    {
      name: `addressLine1UrbanOption${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'urban', useCase)
          : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `addressLine1UrbanOption${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        0
      )
    },
    {
      name: `postalCode${sentenceCase(useCase)}${sentenceCase(section)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'urban', useCase)
          : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        'TEXT',
        'postalCode',
        useCase,
        `postalCode${sentenceCase(useCase)}${sentenceCase(section)}`,
        0
      )
    },
    {
      name: `addressLine1RuralOption${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Village',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine1RuralOption'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'district',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'rural', useCase)
          : getAddressConditionals(section, 'rural', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `addressLine1RuralOption${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        4
      )
    },
    {
      name: `internationalState${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'State',
        description: 'Title for the international state select',
        id: 'form.field.label.internationalState'
      },
      previewGroup: useCase,
      required: true,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        'state',
        useCase,
        `internationalState${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    },
    {
      name: `internationalDistrict${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'District',
        description: 'Title for the international district select',
        id: 'form.field.label.internationalDistrict'
      },
      previewGroup: useCase,
      required: true,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        'district',
        useCase,
        `internationalDistrict${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    },
    {
      name: `internationalCity${sentenceCase(useCase)}${sentenceCase(section)}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'City / Town',
        description: 'Title for the international city select',
        id: 'form.field.label.internationalCity'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        'city',
        useCase,
        `internationalCity${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    },
    {
      name: `internationalAddressLine1${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 1',
        description: 'Title for the international address line 1 select',
        id: 'form.field.label.internationalAddressLine1'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `internationalAddressLine1${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        6
      )
    },
    {
      name: `internationalAddressLine2${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 2',
        description: 'Title for the international address line 2 select',
        id: 'form.field.label.internationalAddressLine2'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `internationalAddressLine2${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        7
      )
    },
    {
      name: `internationalAddressLine3${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Address Line 3',
        description: 'Title for the international address line 3 select',
        id: 'form.field.label.internationalAddressLine3'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        '',
        useCase,
        `internationalAddressLine3${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        8
      )
    },
    {
      name: `internationalPostalCode${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'Title for the international postcode',
        id: 'form.field.label.internationalPostcode'
      },
      previewGroup: useCase,
      required: false,
      initialValue: '',
      validator: [],
      dependency: 'country',
      conditionals:
        useCase in EventLocationAddressCases
          ? getPlaceOfEventConditionals(section, 'international', useCase)
          : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        'TEXT',
        'postalCode',
        useCase,
        `internationalPostalCode${sentenceCase(useCase)}${sentenceCase(
          section
        )}`
      )
    }
  ]
}
