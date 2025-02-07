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

import { FieldConfig, TranslationConfig } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'
import { appendConditionalsToFields, createSelectOptions } from '../utils'
import { PersonType } from './index'

export const AddressType = {
  childResidentialAddress: 'childResidentialAddress',
  childOther: 'childOther'
} as const

export type AddressType = keyof typeof AddressType | PersonType

const UrbanRuralTypes = {
  URBAN: 'URBAN',
  RURAL: 'RURAL'
} as const

const urbanRuralMessageDescriptors = {
  URBAN: {
    defaultMessage: 'Urban',
    id: 'v2.form.field.label.urban',
    description: 'Label for form field checkbox option Urban'
  },
  RURAL: {
    defaultMessage: 'Rural',
    id: 'v2.form.field.label.rural',
    description: 'Label for form field checkbox option Rural'
  }
} satisfies Record<keyof typeof UrbanRuralTypes, TranslationConfig>

const urbanRuralRadioOptions = createSelectOptions(
  UrbanRuralTypes,
  urbanRuralMessageDescriptors
)

export const getAddressFields = (person: AddressType): FieldConfig[] => {
  const prefix = `${person}.address`

  const genericAddressFields: FieldConfig[] = [
    {
      id: `${prefix}.other.state`,
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'State',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.state.label`
      }
    },
    {
      id: `${prefix}.other.district`,
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'District',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.district.label`
      }
    },
    {
      id: `${prefix}.other.town`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'City / Town',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.town.label`
      }
    },
    {
      id: `${prefix}.other.addressLine1`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Address Line 1',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.addressLine1.label`
      }
    },
    {
      id: `${prefix}.other.addressLine2`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Address Line 2',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.addressLine2.label`
      }
    },
    {
      id: `${prefix}.other.addressLine3`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Address Line 3',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.addressLine3.label`
      }
    },
    {
      id: `${prefix}.other.zipCode`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.other.zipCode.label`
      }
    }
  ]

  const urbanAddressFields: FieldConfig[] = [
    {
      id: `${prefix}.town`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Town',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.town.label`
      }
    },

    {
      id: `${prefix}.residentialArea`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Residential Area',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.residentialArea.label`
      }
    },
    {
      id: `${prefix}.street`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Street',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.street.label`
      }
    },
    {
      id: `${prefix}.number`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Number',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.number.label`
      }
    },
    {
      id: `${prefix}.zipCode`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Postcode / Zip',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.zipCode.label`
      }
    }
  ]
  const farajalandAddressFields: FieldConfig[] = [
    {
      id: `${prefix}.province`,
      type: 'LOCATION',
      required: true,
      label: {
        defaultMessage: 'Province',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.address.province.label`
      },
      options: {
        type: 'ADMIN_STRUCTURE'
      }
    },
    {
      id: `${prefix}.district`,
      type: 'LOCATION',
      required: true,
      label: {
        defaultMessage: 'District',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.address.district.label`
      },
      options: {
        partOf: {
          $data: `${prefix}.province`
        },
        type: 'ADMIN_STRUCTURE'
      }
    },
    {
      id: `${prefix}.urbanOrRural`,
      type: 'RADIO_GROUP',
      optionValues: urbanRuralRadioOptions,
      options: {},
      flexDirection: 'row',
      required: false,
      label: {
        defaultMessage: 'Urban or Rural',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.address.urbanOrRural.label`
      },
      hideLabel: true
    },
    ...appendConditionalsToFields({
      inputFields: urbanAddressFields,
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field(`${prefix}.urbanOrRural`)
            .or((field) => field.isUndefined().inArray(['RURAL']))
            .apply()
        }
      ]
    }),
    {
      id: `${prefix}.village`,
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Village',
        description: 'This is the label for the field',
        id: `v2.event.birth.action.declare.form.section.person.field.address.village.label`
      },
      conditionals: [
        {
          type: 'HIDE',
          conditional: field(`${prefix}.urbanOrRural`)
            .or((field) => field.isUndefined().not.inArray(['RURAL']))
            .apply()
        }
      ]
    }
  ]

  return [
    {
      id: `${prefix}.country`,
      type: 'COUNTRY',
      required: true,
      label: {
        defaultMessage: 'Country',
        description: 'This is the label for the field',
        id: `v2.event.action.declare.form.section.person.field.address.country.label`
      }
    },
    ...appendConditionalsToFields({
      inputFields: genericAddressFields,
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field(`${person}.address.country`)
            .or((field) => field.isUndefined().inArray(['FAR']))
            .apply()
        }
      ]
    }),
    ...appendConditionalsToFields({
      inputFields: farajalandAddressFields,
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field(`${person}.address.country`)
            .or((field) => field.isUndefined().not.inArray(['FAR']))
            .apply()
        }
      ]
    })
  ]
}
