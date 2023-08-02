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
import { seperatorDivider } from '../common-optional-fields'

export const getPlaceOfBirthFields = (): SerializedFormField[] => [
  {
    name: 'placeOfBirthTitle',
    type: 'HEADING3',
    label: formMessageDescriptors.placeOfBirthPreview,
    previewGroup: 'placeOfBirth',
    ignoreBottomMargin: true,
    initialValue: '',
    validator: []
  },
  seperatorDivider,
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
        fieldName: 'placeOfBirth',
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
    }
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
