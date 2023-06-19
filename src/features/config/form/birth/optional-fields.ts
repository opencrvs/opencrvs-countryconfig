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
import { formMessageDescriptors } from '../formatjs-messages'
import { IConditional, SerializedFormField } from '../types'

export const attendantAtBirth: SerializedFormField = {
  name: 'attendantAtBirth',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.attendantAtBirth,
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: [
    {
      value: 'PHYSICIAN',
      label: formMessageDescriptors.physician
    },
    {
      value: 'NURSE',
      label: formMessageDescriptors.attendantAtBirthNurse
    },
    {
      value: 'MIDWIFE',
      label: formMessageDescriptors.attendantAtBirthMidwife
    },
    {
      value: 'OTHER_PARAMEDICAL_PERSONNEL',
      label: formMessageDescriptors.attendantAtBirthOtherParamedicalPersonnel
    },
    {
      value: 'LAYPERSON',
      label: formMessageDescriptors.attendantAtBirthLayperson
    },
    {
      value: 'TRADITIONAL_BIRTH_ATTENDANT',
      label: formMessageDescriptors.attendantAtBirthTraditionalBirthAttendant
    },
    {
      value: 'NONE',
      label: formMessageDescriptors.attendantAtBirthNone
    }
  ],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: []
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: []
    },
    template: {
      fieldName: 'attendantAtBirth',
      operation: 'selectTransformer'
    }
  }
}

export const birthType: SerializedFormField = {
  name: 'birthType',
  type: 'SELECT_WITH_OPTIONS',
  label: {
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth',
    id: 'form.field.label.birthType'
  },
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: [
    {
      value: 'SINGLE',
      label: formMessageDescriptors.birthTypeSingle
    },
    {
      value: 'TWIN',
      label: formMessageDescriptors.birthTypeTwin
    },
    {
      value: 'TRIPLET',
      label: formMessageDescriptors.birthTypeTriplet
    },
    {
      value: 'QUADRUPLET',
      label: formMessageDescriptors.birthTypeQuadruplet
    },
    {
      value: 'HIGHER_MULTIPLE_DELIVERY',
      label: formMessageDescriptors.birthTypeHigherMultipleDelivery
    }
  ],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: []
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: []
    },
    template: {
      fieldName: 'birthType',
      operation: 'selectTransformer'
    }
  }
}
export const weightAtBirth: SerializedFormField = {
  name: 'weightAtBirth',
  type: 'NUMBER',
  step: 0.01,
  label: formMessageDescriptors.weightAtBirth,
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'range',
      parameters: [0, 6]
    }
  ],
  postfix: 'Kg',
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: []
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: []
    },
    template: {
      fieldName: 'weightAtBirth',
      operation: 'plainInputTransformer'
    }
  },
  inputFieldWidth: '78px'
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
      parameters: ['registration.contactPhoneNumber']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.contactPhoneNumber']
    },
    template: {
      fieldName: 'contactPhoneNumber',
      operation: 'selectTransformer'
    }
  }
}

export const registrationEmail: SerializedFormField = {
  name: 'registrationEmail',
  type: 'TEL',
  label: formMessageDescriptors.email,
  required: false,
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
      parameters: ['registration.email']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['registration.email']
    },
    template: {
      fieldName: 'email',
      operation: 'plainInputTransformer'
    }
  }
}

export const getNIDVerificationButton = (
  fieldName: string,
  conditionals: IConditional[],
  validator: any[]
): SerializedFormField => ({
  name: fieldName,
  type: 'NID_VERIFICATION_BUTTON',
  label: formMessageDescriptors.iDTypeNationalID,
  required: true,
  initialValue: '',
  validator,
  conditionals,
  mapping: {
    mutation: {
      operation: 'nidVerificationFieldToIdentityTransformer'
    },
    query: {
      operation: 'identityToNidVerificationFieldTransformer'
    }
  },
  labelForVerified: formMessageDescriptors.nidVerified,
  labelForUnverified: formMessageDescriptors.nidNotVerified,
  labelForOffline: formMessageDescriptors.nidOffline
})

export const exactDateOfBirthUnknown: SerializedFormField = {
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
  conditionals: [
    {
      action: 'hide',
      expression: '!window.config.DATE_OF_BIRTH_UNKNOWN'
    }
  ],
  mapping: {
    query: {
      operation: 'booleanTransformer'
    },
    mutation: {
      operation: 'ignoreFieldTransformer'
    }
  }
}

export const getAgeOfIndividualInYears = (
  label: MessageDescriptor
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
  conditionals: [
    {
      action: 'hide',
      expression: '!values.exactDateOfBirthUnknown'
    }
  ],
  postfix: 'years',
  inputFieldWidth: '78px'
})
