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

import { MessageDescriptor } from 'react-intl'
import {
  formMessageDescriptors,
  informantMessageDescriptors
} from '../common/messages'
import { Conditional, SerializedFormField } from '../types/types'
import { divider } from '../common/common-optional-fields'
import {
  birthInformantTypeOptions,
  placeOfBirthOptions
} from '../common/select-options'
import { certificateHandlebars } from './certificate-handlebars'
import { getFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import { getEventLocationSelectionMapping } from '@countryconfig/utils/address-utils'

export const informantType: SerializedFormField = {
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.informantsRelationWithChild,
  required: true,
  hideInPreview: false,
  initialValue: '',
  validator: [],
  placeholder: formMessageDescriptors.formSelectPlaceholder,
  mapping: getFieldMapping(
    'informantType',
    certificateHandlebars.informantType
  ),
  options: birthInformantTypeOptions
}

export const getPlaceOfBirthFields = (): SerializedFormField[] => [
  divider('place-of-birth'),
  {
    name: 'placeOfBirth',
    type: 'SELECT_WITH_OPTIONS',
    previewGroup: 'placeOfBirth',
    ignoreFieldLabelOnErrorMessage: true,
    label: formMessageDescriptors.placeOfBirthPreview,
    required: true,
    initialValue: '',
    validator: [],
    placeholder: formMessageDescriptors.formSelectPlaceholder,
    options: placeOfBirthOptions,
    mapping: getEventLocationSelectionMapping('placeOfBirth')
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
    mapping: getEventLocationSelectionMapping(
      'birthLocation',
      certificateHandlebars.placeOfBirth
    )
  }
]
