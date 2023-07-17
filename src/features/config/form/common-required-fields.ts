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

import {
  formMessageDescriptors,
  informantMessageDescriptors
} from './formatjs-messages'
import { SerializedFormField, Conditional } from './types/types'

export const getBirthDate = (
  fieldName: string,
  conditionals: Conditional[],
  validator: any[],
  certificateHandlebar: string
): SerializedFormField => ({
  name: fieldName, // A field with this name MUST exist
  type: 'DATE',
  label: formMessageDescriptors.dateOfBirth,
  required: true,
  conditionals,
  initialValue: '',
  validator,
  mapping: {
    template: {
      operation: 'dateFormatTransformer',
      fieldName: certificateHandlebar,
      parameters: ['birthDate', 'en', 'do MMMM yyyy']
    },
    mutation: {
      operation: 'longDateTransformer',
      parameters: ['birthDate']
    },
    query: {
      operation: 'fieldValueTransformer',
      parameters: ['birthDate']
    }
  }
})

export const getGender = (certificateHandlebar: string) =>
  ({
    name: 'gender', // A field with this name MUST exist
    type: 'SELECT_WITH_OPTIONS',
    label: formMessageDescriptors.sex,
    required: true,
    initialValue: '',
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'selectTransformer'
      }
    },
    options: [
      {
        value: 'male',
        label: formMessageDescriptors.sexMale
      },
      {
        value: 'female',
        label: formMessageDescriptors.sexFemale
      },
      {
        value: 'unknown',
        label: formMessageDescriptors.sexUnknown
      }
    ]
  } satisfies SerializedFormField)

export const getFamilyNameField = (
  previewGroup: string,
  conditionals: Conditional[],
  certificateHandlebar: string
) =>
  ({
    name: 'familyNameEng', // A field with this name MUST exist
    previewGroup,
    conditionals,
    type: 'TEXT',
    label: formMessageDescriptors.familyName,
    maxLength: 32,
    required: true,
    initialValue: '',
    validator: [
      {
        operation: 'englishOnlyNameFormat'
      }
    ],
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'nameToFieldTransformer',
        parameters: ['en', 'familyName']
      },
      mutation: {
        operation: 'fieldToNameTransformer',
        parameters: ['en', 'familyName']
      },
      query: {
        operation: 'nameToFieldTransformer',
        parameters: ['en', 'familyName']
      }
    }
  } satisfies SerializedFormField)

export const getFirstNameField = (
  previewGroup: string,
  conditionals: Conditional[],
  certificateHandlebar: string
) =>
  ({
    name: 'firstNamesEng', // A field with this name MUST exist
    previewGroup,
    type: 'TEXT',
    label: {
      defaultMessage: 'First name(s)',
      description: 'Label for form field: First names',
      id: 'form.field.label.firstNames'
    },
    conditionals,
    maxLength: 32,
    required: true,
    initialValue: '',
    validator: [
      {
        operation: 'englishOnlyNameFormat'
      }
    ],
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'nameToFieldTransformer',
        parameters: ['en', 'firstNames']
      },
      mutation: {
        operation: 'fieldToNameTransformer',
        parameters: ['en', 'firstNames']
      },
      query: {
        operation: 'nameToFieldTransformer',
        parameters: ['en', 'firstNames']
      }
    }
  } satisfies SerializedFormField)

export const getNationality = (
  certificateHandlebar: string,
  conditionals: Conditional[]
) =>
  ({
    name: 'nationality',
    type: 'SELECT_WITH_OPTIONS',
    label: formMessageDescriptors.nationality,
    required: true,
    initialValue: 'FAR',
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    options: {
      resource: 'countries'
    },
    conditionals,
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'nationalityTransformer'
      },
      mutation: {
        operation: 'fieldToArrayTransformer'
      },
      query: {
        operation: 'arrayToFieldTransformer'
      }
    }
  } satisfies SerializedFormField)

export const getNationalID = (
  fieldName: string,
  conditionals: Conditional[],
  validator: any[],
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

export const informantType: SerializedFormField = {
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: informantMessageDescriptors.birthInformantTitle,
  required: true,
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    mutation: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'informantType']
    },
    query: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'informantType']
    },
    template: {
      fieldName: 'informantType',
      operation: 'selectTransformer'
    }
  },
  options: [
    {
      value: 'MOTHER',
      label: informantMessageDescriptors.MOTHER
    },
    {
      value: 'FATHER',
      label: informantMessageDescriptors.FATHER
    },
    {
      value: 'GRANDFATHER',
      label: informantMessageDescriptors.GRANDFATHER
    },
    {
      value: 'GRANDMOTHER',
      label: informantMessageDescriptors.GRANDMOTHER
    },
    {
      value: 'BROTHER',
      label: informantMessageDescriptors.BROTHER
    },
    {
      value: 'SISTER',
      label: informantMessageDescriptors.SISTER
    },
    {
      value: 'OTHER_FAMILY_MEMBER',
      label: informantMessageDescriptors.OTHER_FAMILY_MEMBER
    },
    {
      value: 'LEGAL_GUARDIAN',
      label: informantMessageDescriptors.LEGAL_GUARDIAN
    },
    {
      value: 'OTHER',
      label: informantMessageDescriptors.OTHER
    }
  ]
}

export const otherInformantType: SerializedFormField = {
  name: 'otherInformantType',
  type: 'TEXT',
  label: formMessageDescriptors.informantsRelationWithChild,
  placeholder: formMessageDescriptors.relationshipPlaceHolder,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'englishOnlyNameFormat'
    }
  ],
  conditionals: [
    {
      action: 'hide',
      expression: 'values.informantType !== "OTHER"'
    }
  ],
  mapping: {
    mutation: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'otherInformantType']
    },
    query: {
      operation: 'fieldValueSectionExchangeTransformer',
      parameters: ['registration', 'otherInformantType']
    }
  }
}
