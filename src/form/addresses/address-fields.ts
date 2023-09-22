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
  isUseCaseForPlaceOfEvent,
  sentenceCase
} from '../../utils/address-utils'
import {
  urbanRuralRadioOptions,
  yesNoRadioOptions
} from '../common/select-options'
import { ADMIN_LEVELS } from '.'
import { getPlaceOfBirthFields } from '../birth/required-fields'
import { getPlaceOfDeathFields } from '../death/required-fields'

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
// We recommend that you do not edit this function
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
    previewGroup: isUseCaseForPlaceOfEvent(useCase)
      ? useCase
      : `${useCase}Address`,
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
    conditionals: isUseCaseForPlaceOfEvent(useCase)
      ? getPlaceOfEventConditionals(
          section,
          location,
          useCase as EventLocationAddressCases
        )
      : getAddressConditionals(section, location, useCase),
    mapping: getMapping(
      section,
      'SELECT_WITH_DYNAMIC_OPTIONS',
      location,
      useCase,
      fieldName,
      locationIndex
    )
  }
}

// Select fields are added for each administrative location level from Humdata
// We recommend that you do not edit this function
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

// Place of birth and death fields require a select option to choose a hospital from health facility databases
// We recommend that you do not edit this function
function getPlaceOfEventFields(useCase: EventLocationAddressCases) {
  switch (useCase) {
    case EventLocationAddressCases.PLACE_OF_BIRTH:
      return [...getPlaceOfBirthFields()]
    case EventLocationAddressCases.PLACE_OF_DEATH:
      return [...getPlaceOfDeathFields()]
    case EventLocationAddressCases.PLACE_OF_MARRIAGE:
      return []
    default:
      return []
  }
}

// The fields that appear whenever an address is rendered

// ====================== WARNING REGARDING ADDRESS CONFIGURATION ======================

// WE HAVE SPENT CONSIDERABLE TIME WORKING IN COLLABORATION WITH INTERNATIONAL STANDARDS COMMITTEES ON INTEROPERABLE ADDRESS FORMAT.
// WE STRONGLY BELIEVE THAT OUR ADDRESS STRUCTURE IS BEST OPTIMISED FOR EVERY POSSIBLE ADDRESS, ANYWHERE IN THE WORLD. (URBAN OR RURAL - STANDARDISED OR UNSTANDARDISED)
// OUR APPROACH TO ADDRESS FORMAT INTEROPERATES WITH OTHER DIGITAL PUBLIC GOODS USING FHIR & OPENID
// OUR RECOMENDATION IS THAT YOU ADOPT THESE ADDRESS FIELDS, OTHERWISE YOU MAY LOSE VALUABLE ANALYTICAL AND INTEROPERABLE FUNCTIONALITY
// WE MARK REQUIRED AND OPTIONAL FIELDS BELOW ACCORDINGLY

// ==================================== END WARNING ====================================
export function getAddressFields(
  section: string,
  addressCase: EventLocationAddressCases | AddressCases
): SerializedFormField[] {
  let useCase = addressCase as string
  let placeOfEventFields: SerializedFormField[] = []
  if (addressCase in AddressCases) {
    useCase = useCase === AddressCases.PRIMARY_ADDRESS ? 'primary' : 'secondary'
  } else {
    placeOfEventFields = getPlaceOfEventFields(
      useCase as EventLocationAddressCases
    )
  }

  return [
    ...placeOfEventFields,
    {
      name: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      type: 'SELECT_WITH_OPTIONS',
      label: {
        defaultMessage: 'Country',
        description: 'Title for the country select',
        id: 'form.field.label.country'
      },
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
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
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'country', useCase)
        : getAddressConditionals(section, 'country', useCase),
      mapping: getMapping(
        section,
        'SELECT_WITH_OPTIONS',
        'country', // Maps form value to FHIR prop. Use empty string for FHIR Address line index
        useCase,
        `country${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    }, // Required
    // Select fields are added for each administrative location level from Humdata
    ...getAdminLevelSelects(section, useCase), // Required
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      validator: [],
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'ruralOrUrban', useCase)
        : getAddressConditionals(section, 'ruralOrUrban', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'urban', useCase)
        : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        section,
        'TEXT',
        'city',
        useCase,
        `city${sentenceCase(useCase)}${sentenceCase(section)}`
      )
    },
    {
      name: `addressLine1UrbanOption${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Residential Area',
        description: 'Title for the address line 1',
        id: 'form.field.label.addressLine1UrbanOption'
      },
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'urban', useCase)
        : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        section,
        'TEXT',
        '',
        useCase,
        `addressLine1UrbanOption${sentenceCase(useCase)}${sentenceCase(
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
        description: 'Title for the address line 2',
        id: 'form.field.label.addressLine2UrbanOption'
      },
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'urban', useCase)
        : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        section,
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
      name: `addressLine3UrbanOption${sentenceCase(useCase)}${sentenceCase(
        section
      )}`,
      type: 'TEXT',
      label: {
        defaultMessage: 'Number',
        description: 'Title for the number field',
        id: 'form.field.label.number'
      },
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'urban', useCase)
        : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        section,
        'TEXT',
        '',
        useCase,
        `addressLine3UrbanOption${sentenceCase(useCase)}${sentenceCase(
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'urban', useCase)
        : getAddressConditionals(section, 'urban', useCase),
      mapping: getMapping(
        section,
        'TEXT',
        'postalCode',
        useCase,
        `postalCode${sentenceCase(useCase)}${sentenceCase(section)}`
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `district${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'rural', useCase)
        : getAddressConditionals(section, 'rural', useCase),
      mapping: getMapping(
        section,
        'TEXT',
        '',
        useCase,
        `addressLine1RuralOption${sentenceCase(useCase)}${sentenceCase(
          section
        )}`,
        4
      )
    },
    // INTERNATIONAL ADDRESSES ARE SUPPLIED BECAUSE INFORMANTS & CITIZENS MAY LIVE ABROAD & REGISTER AN EVENT AT ONE OF YOUR FOREIGN EMBASSIES
    // SOMETIMES THIS IS ALSO REQUIRED FOR DIPLOMATIC REASONS OR FOR MILITARY FORCES
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: true,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
      previewGroup: isUseCaseForPlaceOfEvent(useCase)
        ? useCase
        : `${useCase}Address`,
      required: false,
      initialValue: '',
      validator: [],
      dependency: `country${sentenceCase(useCase)}${sentenceCase(section)}`,
      conditionals: isUseCaseForPlaceOfEvent(useCase)
        ? getPlaceOfEventConditionals(section, 'international', useCase)
        : getAddressConditionals(section, 'international', useCase),
      mapping: getMapping(
        section,
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
