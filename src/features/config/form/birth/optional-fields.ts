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
import { SerializedFormField } from '../types'

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
