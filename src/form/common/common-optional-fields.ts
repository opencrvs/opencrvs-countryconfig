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
import { formMessageDescriptors } from './messages'
import { SerializedFormField, Conditional } from '../types/types'
import { Validator } from '../types/validators'
import { maritalStatusOptions } from './select-options'
import { certificateHandlebars } from '../birth/certificate-handlebars'

const exactDobConditional: Conditional[] = [
  {
    action: 'hide',
    expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
  }
]

export const exactDateOfBirthUnknown = (
  conditionalCase: Conditional[]
): SerializedFormField => ({
  name: 'exactDateOfBirthUnknown',
  type: 'CHECKBOX',
  label: {
    defaultMessage: 'Exact date of birth unknown',
    description: 'Checkbox for exact date of birth unknown',
    id: 'form.field.label.exactDateOfBirthUnknown'
  },
  hideInPreview: true,
  required: false,
  hideHeader: true,
  initialValue: false,
  validator: [],
  conditionals: exactDobConditional.concat(conditionalCase),
  mapping: {
    query: {
      operation: 'booleanTransformer'
    },
    mutation: {
      operation: 'ignoreFieldTransformer'
    }
  }
})

export const getNationalID = (
  fieldName: string,
  conditionals: Conditional[],
  validator: Validator[],
  certificateHandlebar: string
) =>
  ({
    name: fieldName,
    type: 'TEXT',
    label: formMessageDescriptors.iDTypeNationalID,
    required: false,
    initialValue: '',
    validator,
    conditionals,
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'identityToFieldTransformer',
        parameters: ['id', 'NATIONAL_ID']
      },
      mutation: {
        operation: 'fieldToIdentityTransformer',
        parameters: ['id', 'NATIONAL_ID']
      },
      query: {
        operation: 'identityToFieldTransformer',
        parameters: ['id', 'NATIONAL_ID']
      }
    }
  } satisfies SerializedFormField)

export const getAgeOfIndividualInYears = (
  label: MessageDescriptor,
  conditionals: Conditional[]
): SerializedFormField => ({
  name: 'ageOfIndividualInYears',
  type: 'NUMBER',
  label,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'range',
      parameters: [12, 120]
    },
    {
      operation: 'maxLength',
      parameters: [3]
    },
    {
      operation: 'isValidParentsBirthDate',
      parameters: [10, true]
    }
  ],
  conditionals,
  postfix: 'years',
  inputFieldWidth: '78px'
})

export const getMaritalStatus = (
  certificateHandlebar: string,
  conditionals: Conditional[]
): SerializedFormField => ({
  name: 'maritalStatus',
  type: 'SELECT_WITH_OPTIONS',
  label: {
    defaultMessage: 'Marital status',
    description: 'Label for form field: Marital status',
    id: 'form.field.label.maritalStatus'
  },
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'selectTransformer'
    }
  },
  conditionals,
  options: maritalStatusOptions
})

export const registrationEmail: SerializedFormField = {
  name: 'registrationEmail',
  type: 'TEL',
  label: formMessageDescriptors.email,
  required: true, // Email is the configured INFORMANT_NOTIFICATION_DELIVERY_METHOD in Farajaland
  initialValue: '',
  validator: [
    {
      operation: 'emailAddressFormat'
    }
  ],
  conditionals: [],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['registration.contactEmail']
    },
    query: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'contactEmail']
    },
    template: {
      fieldName: certificateHandlebars.contactEmail,
      operation: 'plainInputTransformer'
    }
  }
}

export const registrationPhone: SerializedFormField = {
  name: 'registrationPhone',
  type: 'TEL',
  label: formMessageDescriptors.phoneNumber,
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'phoneNumberFormat'
    }
  ],
  conditionals: [],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: [
        'registration.contactPhoneNumber',
        {
          operation: 'msisdnTransformer',
          parameters: ['registration.contactPhoneNumber']
        }
      ]
    },
    query: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: [
        'registration',
        'contactPhoneNumber',
        {
          operation: 'localPhoneTransformer',
          parameters: ['registration.contactPhoneNumber']
        }
      ]
    },
    template: {
      fieldName: certificateHandlebars.contactPhoneNumber,
      operation: 'selectTransformer'
    }
  }
}

export const divider = (
  name = 'seperator',
  conditionals?: Conditional[]
): SerializedFormField => ({
  name,
  type: 'DIVIDER',
  label: {
    defaultMessage: ' ',
    description: 'empty string',
    id: 'form.field.label.empty'
  },
  initialValue: '',
  ignoreBottomMargin: true,
  validator: [],
  conditionals
})
