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

export const informantType: SerializedFormField = {
  name: 'informantType',
  type: 'SELECT_WITH_OPTIONS',
  label: formMessageDescriptors.informantsRelationWithChild,
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
      fieldName: certificateHandlebars.informantType,
      operation: 'selectTransformer'
    }
  },
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
    mapping: {
      mutation: {
        operation: 'birthEventLocationMutationTransformer',
        parameters: [{}]
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
        fieldName: certificateHandlebars.placeOfBirth,
        operation: 'eventLocationNameQueryOfflineTransformer',
        parameters: ['facilities', 'placeOfBirth']
      },
      mutation: {
        operation: 'birthEventLocationMutationTransformer',
        parameters: [{}]
      },
      query: {
        operation: 'eventLocationIDQueryTransformer',
        parameters: []
      }
    }
  }
]

export const getDetailsExist = (
  label: MessageDescriptor,
  conditionals: Conditional[]
) =>
  ({
    name: 'detailsExist',
    type: 'CHECKBOX',
    label,
    required: true,
    checkedValue: false,
    uncheckedValue: true,
    hideHeader: true,
    initialValue: true,
    validator: [],
    conditionals,
    mapping: {
      query: {
        operation: 'booleanTransformer'
      }
    },
    ignoreBottomMargin: true
  } satisfies SerializedFormField)

export const getReasonNotExisting = (certificateHandlebar: string) =>
  ({
    name: 'reasonNotApplying',
    conditionals: [
      {
        action: 'hide',
        expression: 'values.detailsExist'
      }
    ],
    type: 'TEXT',
    label: formMessageDescriptors.reasonNA,
    validator: [],
    initialValue: '',
    required: true,
    mapping: {
      template: {
        fieldName: certificateHandlebar,
        operation: 'plainInputTransformer'
      }
    }
  } satisfies SerializedFormField)
