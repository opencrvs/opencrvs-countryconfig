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

import { createCustomFieldHandlebarName } from '@countryconfig/utils'
import { SerializedFormField } from './types/types'

// ======================= CUSTOM FIELD CONFIGURATION =======================

// A CUSTOM FIELD CAN BE ADDED TO APPEAR IN ANY SECTION
// DUPLICATE AND RENAME FUNCTIONS LIKE THESE IN ORDER TO USE SIMILAR FIELDS

export function createCustomFieldExample(): SerializedFormField {
  // THE fieldId STRING IS A DOT SEPARATED STRING AND IS IMPORTANT TO SET CORRECTLY
  // THE FORMAT IS event.sectionId.groupId.uniqueFieldName
  const fieldId: string = 'birth.child.child-view-group.favouriteColor'

  // THE HANDLEBAR IS CREATED BY THIS FUNCTION IN ORDER TO USE THE VALUE ON A CERTIFICATE
  const customFieldCertificateHandlebar =
    createCustomFieldHandlebarName(fieldId)
  console.log(
    'Custom field addded with handlebar: ',
    customFieldCertificateHandlebar
  ) // WILL RESOLVE TO "{{birthChildFavouriteColor}}"

  return {
    name: 'favoriteColor',
    customQuesstionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT',
    label: {
      id: 'form.customField.label.favoriteColor',
      description: 'A form field that asks for the persons favorite color.',
      defaultMessage: 'What is your favorite color?'
    },
    initialValue: '',
    validator: [],
    mapping: {
      mutation: {
        operation: 'customFieldToQuestionnaireTransformer'
      },
      query: {
        operation: 'questionnaireToCustomFieldTransformer'
      },
      template: {
        fieldName: customFieldCertificateHandlebar,
        operation: 'questionnaireToTemplateFieldTransformer'
      }
    },
    conditionals: [],
    maxLength: 250
  }
}
