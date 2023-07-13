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
import { SerializedFormField } from '../types/types'

export const getMarriedLastName: SerializedFormField = {
  name: 'marriedLastNameEng',
  previewGroup: 'marriedLastNameInEnglish',
  type: 'TEXT',
  label: formMessageDescriptors.lastNameAtBirth,
  maxLength: 32,
  initialValue: '',
  required: false,
  validator: [
    {
      operation: 'englishOnlyNameFormat'
    }
  ],
  mapping: {
    template: {
      fieldName: 'marriedLastNameEng',
      operation: 'nameToFieldTransformer',
      parameters: ['en', 'marriedLastName']
    },
    mutation: {
      operation: 'fieldToNameTransformer',
      parameters: ['en', 'marriedLastName']
    },
    query: {
      operation: 'nameToFieldTransformer',
      parameters: ['en', 'marriedLastName']
    }
  }
}

export const getTypeOfMarriage: SerializedFormField = {
  name: 'typeOfMarriage',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.typeOfMarriage,
  required: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  options: [
    {
      value: 'MONOGAMY',
      label: formMessageDescriptors.monogamy
    },
    {
      value: 'POLYGAMY',
      label: formMessageDescriptors.polygamy
    }
  ],
  mapping: {
    mutation: {
      operation: 'sectionFieldToBundleFieldTransformer',
      parameters: ['typeOfMarriage']
    },
    query: {
      operation: 'bundleFieldToSectionFieldTransformer',
      parameters: ['typeOfMarriage']
    },
    template: {
      fieldName: 'typeOfMarriage',
      operation: 'selectTransformer'
    }
  }
}

export const placeOfMarriageSubsection: SerializedFormField = {
  name: 'placeOfMarriageTitle',
  type: 'SUBSECTION',
  label: formMessageDescriptors.placeOfMarriage,
  previewGroup: 'placeOfMarriage',
  ignoreBottomMargin: true,
  initialValue: '',
  validator: []
}
