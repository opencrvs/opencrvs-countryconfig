import {
  ConditionalType,
  and,
  not,
  field,
  AddressType,
  FieldType
} from '@opencrvs/toolkit/events'

function isInternationalAddress() {
  return and(
    not(field('country').isUndefined()),
    field('addressType').isEqualTo(AddressType.INTERNATIONAL)
  )
}

function isDomesticAddress() {
  return and(
    not(field('country').isUndefined()),
    field('addressType').isEqualTo(AddressType.DOMESTIC)
  )
}

export const defaultStreetAddressConfiguration = [
  {
    id: 'town',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.town.label',
      defaultMessage: 'Town',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'residentialArea',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.residentialArea.label',
      defaultMessage: 'Residential Area',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'street',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.street.label',
      defaultMessage: 'Street',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'number',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.number.label',
      defaultMessage: 'Number',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'zipCode',
    required: false,
    parent: field('country'),
    label: {
      id: 'field.address.postcodeOrZip.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          isDomesticAddress(),
          not(field('district').isUndefined())
        )
      }
    ],
    type: FieldType.TEXT
  },
  {
    id: 'state',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    parent: field('country'),
    required: true,
    label: {
      id: 'field.address.state.label',
      defaultMessage: 'State',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'district2',
    parent: field('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: true,
    label: {
      id: 'field.address.district2.label',
      defaultMessage: 'District',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'cityOrTown',
    parent: field('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.cityOrTown.label',
      defaultMessage: 'City / Town',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine1',
    parent: field('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.addressLine1.label',
      defaultMessage: 'Address Line 1',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine2',
    parent: field('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.addressLine2.label',
      defaultMessage: 'Address Line 2',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'addressLine3',
    parent: field('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.addressLine3.label',
      defaultMessage: 'Address Line 3',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  },
  {
    id: 'postcodeOrZip',
    parent: field('country'),
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: isInternationalAddress()
      }
    ],
    required: false,
    label: {
      id: 'field.address.postcodeOrZip.label',
      defaultMessage: 'Postcode / Zip',
      description: 'This is the label for the field'
    },
    type: FieldType.TEXT
  }
]
