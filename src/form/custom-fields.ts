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

import { SerializedFormField } from './types/types'
import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'

// ======================= CUSTOM FIELD CONFIGURATION =======================

// A CUSTOM FIELD CAN BE ADDED TO APPEAR IN ANY SECTION
// DUPLICATE AND RENAME FUNCTIONS LIKE THESE IN ORDER TO USE SIMILAR FIELDS

export function createCustomFieldExample(): SerializedFormField {
  // GIVE THE FIELD A UNIQUE NAME.  IF THE NAME IS ALREADY IN USE, YOU WILL NOTICE AN ERROR ON PAGE LOAD IN DEVELOPMENT
  const fieldName: string = 'favoriteColor'
  // THE fieldId STRING IS A DOT SEPARATED STRING AND IS IMPORTANT TO SET CORRECTLY DEPENDING ON WHERE THE CUSTOM FIELD IS LOCATED
  // THE FORMAT IS event.sectionId.groupId.uniqueFieldName
  const fieldId: string = `birth.child.child-view-group.${fieldName}`
  // IN ORDER TO USE THE VALUE ON A CERTIFICATE
  // THE groupId IS IGNORED AND THE HANDLEBAR WILL LOG IN THE CONSOLE
  // IN THIS EXAMPLE, IT WILL RESOLVE IN CAMELCASE TO "{{birthChildFavouriteColor}}"

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TEXT', // ANY FORM FIELD TYPE IS POSSIBLE. ADD ADDITIONAL PROPS AS REQUIRED.  REFER TO THE form/README.md FILE
    label: {
      id: 'form.customField.label.favoriteColor',
      description: 'A form field that asks for the persons favorite color.',
      defaultMessage: 'What is your favorite color?'
    },
    initialValue: '',
    validator: [], // EDIT VALIDATORS AS YOU SEE FIT
    mapping: getCustomFieldMapping(fieldId), // ALL CUSTOM FIELDS MUST USE THIS MAPPING FUNCTION
    conditionals: [], // EDIT VALIDATORS AS YOU SEE FIT
    maxLength: 250
  }
}
