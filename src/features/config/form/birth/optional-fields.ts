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
import { Conditional, SerializedFormField } from '../types/types'
import { hideIfInformantMotherOrFather } from './utils'

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
  conditionals: Conditional[],
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
      parameters: [5, true]
    }
  ],
  conditionals: [
    {
      action: 'hide',
      expression: '!window.config.DATE_OF_BIRTH_UNKNOWN || !values.detailsExist'
    },
    ...hideIfInformantMotherOrFather
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
  certificateHandlebar: string
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
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  options: [
    {
      value: 'SINGLE',
      label: {
        defaultMessage: 'Single',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusSingle'
      }
    },
    {
      value: 'MARRIED',
      label: {
        defaultMessage: 'Married',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusMarried'
      }
    },
    {
      value: 'WIDOWED',
      label: {
        defaultMessage: 'Widowed',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusWidowed'
      }
    },
    {
      value: 'DIVORCED',
      label: {
        defaultMessage: 'Divorced',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusDivorced'
      }
    },
    {
      value: 'SEPARATED',
      label: {
        id: 'form.field.label.maritalStatusSeparated',
        defaultMessage: 'Separated',
        description: 'Option for form field: Marital status'
      }
    },
    {
      value: 'NOT_STATED',
      label: {
        defaultMessage: 'Not stated',
        description: 'Option for form field: Marital status',
        id: 'form.field.label.maritalStatusNotStated'
      }
    }
  ]
})
export const multipleBirth: SerializedFormField = {
  name: 'multipleBirth',
  type: 'NUMBER',
  label: {
    defaultMessage: 'No. of previous births',
    description: 'Label for form field: multipleBirth',
    id: 'form.field.label.multipleBirth'
  },
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  required: false,
  initialValue: '',
  validator: [
    {
      operation: 'greaterThanZero'
    },
    {
      operation: 'maxLength',
      parameters: [2]
    }
  ],
  mapping: {
    template: {
      fieldName: 'multipleBirth',
      operation: 'plainInputTransformer'
    }
  }
}

export const getOccupation = (
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'occupation',
  type: 'TEXT',
  label: {
    defaultMessage: 'Occupation',
    description: 'text for occupation form field',
    id: 'form.field.label.occupation'
  },
  required: false,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'plainInputTransformer'
    }
  }
})

export const getEducation = (
  certificateHandlebar: string
): SerializedFormField => ({
  name: 'educationalAttainment',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.educationAttainment,
  required: false,
  initialValue: '',
  validator: [],
  conditionals: [
    {
      action: 'hide',
      expression: '!values.detailsExist'
    }
  ],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: [
    {
      value: 'NO_SCHOOLING',
      label: {
        defaultMessage: 'No schooling',
        description: 'Option for form field: no education',
        id: 'form.field.label.educationAttainmentNone'
      }
    },
    {
      value: 'PRIMARY_ISCED_1',
      label: {
        defaultMessage: 'Primary',
        description: 'Option for form field: ISCED1 education',
        id: 'form.field.label.educationAttainmentISCED1'
      }
    },
    {
      value: 'POST_SECONDARY_ISCED_4',
      label: {
        defaultMessage: 'Secondary',
        description: 'Option for form field: ISCED4 education',
        id: 'form.field.label.educationAttainmentISCED4'
      }
    },
    {
      value: 'FIRST_STAGE_TERTIARY_ISCED_5',
      label: {
        defaultMessage: 'Tertiary',
        description: 'Option for form field: ISCED5 education',
        id: 'form.field.label.educationAttainmentISCED5'
      }
    }
  ],
  mapping: {
    template: {
      fieldName: certificateHandlebar,
      operation: 'selectTransformer'
    }
  }
})
