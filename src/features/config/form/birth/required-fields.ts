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

import { formMessageDescriptors } from '../formatjs-messages'
import { IPreviewGroup, SerializedFormField } from '../types'

export const childBirthDate: SerializedFormField = {
  name: 'childBirthDate', // A field with this name MUST exist
  type: 'DATE',
  label: formMessageDescriptors.dateOfBirth,
  required: true,
  initialValue: '',
  validator: [
    {
      operation: 'isValidChildBirthDate'
    }
  ],
  mapping: {
    template: {
      operation: 'dateFormatTransformer',
      fieldName: 'eventDate',
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
}

export const gender: SerializedFormField = {
  name: 'gender', // A field with this name MUST exist
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.sex,
  required: true,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: {
    template: {
      fieldName: 'childGender',
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
}

export const familyNameEng: SerializedFormField = {
  name: 'familyNameEng', // A field with this name MUST exist
  previewGroup: 'childNameInEnglish',
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
      fieldName: 'childFamilyName',
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
}

export const firstNamesEng: SerializedFormField = {
  name: 'firstNamesEng', // A field with this name MUST exist
  previewGroup: 'childNameInEnglish',
  type: 'TEXT',
  label: {
    defaultMessage: 'First name(s)',
    description: 'Label for form field: First names',
    id: 'form.field.label.firstNames'
  },
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
      fieldName: 'childFirstName',
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
}

export const getPlaceOfBirthFields: SerializedFormField[] = [
  {
    name: 'placeOfBirthTitle',
    type: 'SUBSECTION',
    label: formMessageDescriptors.placeOfBirthPreview,
    previewGroup: 'placeOfBirth',
    ignoreBottomMargin: true,
    initialValue: '',
    validator: []
  },
  {
    name: 'placeOfBirth',
    type: 'SELECT_WITH_OPTIONS',
    previewGroup: 'placeOfBirth',
    ignoreFieldLabelOnErrorMessage: true,
    label: formMessageDescriptors.placeOfBirth,
    required: true,
    initialValue: '',
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    options: [
      {
        value: 'HEALTH_FACILITY',
        label: formMessageDescriptors.healthInstitution
      },
      {
        value: 'PRIVATE_HOME',
        label: formMessageDescriptors.privateHome
      },
      {
        value: 'OTHER',
        label: formMessageDescriptors.otherInstitution
      }
    ],
    mapping: {
      mutation: {
        operation: 'birthEventLocationMutationTransformer',
        parameters: []
      },
      query: {
        operation: 'eventLocationTypeQueryTransformer',
        parameters: []
      }
    }
  },
  {
    name: 'birthLocation',
    type: 'LOCATION_SEARCH_INPUT',
    label: formMessageDescriptors.healthInstitution,
    previewGroup: 'placeOfBirth',
    required: true,
    initialValue: '',
    searchableResource: ['facilities'],
    searchableType: ['HEALTH_FACILITY'],
    dynamicOptions: {
      resource: 'facilities'
    },
    validator: [
      {
        operation: 'facilityMustBeSelected'
      }
    ],
    conditionals: [
      {
        action: 'hide',
        expression: '(values.placeOfBirth!="HEALTH_FACILITY")'
      }
    ],
    mapping: {
      template: {
        fieldName: 'placeOfBirth',
        operation: 'eventLocationNameQueryOfflineTransformer',
        parameters: ['facilities', 'placeOfBirth']
      },
      mutation: {
        operation: 'birthEventLocationMutationTransformer',
        parameters: []
      },
      query: {
        operation: 'eventLocationIDQueryTransformer',
        parameters: []
      }
    }
  }
]

export const childNameInEnglish: IPreviewGroup = {
  id: 'childNameInEnglish',
  label: formMessageDescriptors.nameInEnglishPreviewGroup,
  fieldToRedirect: 'familyNameEng',
  delimiter: ' '
}
