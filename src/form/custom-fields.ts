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

import { SerializedFormField } from './types/types'

// this is a custom field for type: TEXT which is not used in the original form
export const favoriteColor: SerializedFormField = {
  name: 'favoriteColor',
  customQuesstionMappingId:
    'birth.informant.informant-view-group.favoriteColor',
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
      fieldName: 'birthInformantSecondaryName',
      operation: 'questionnaireToTemplateFieldTransformer'
    }
  },
  conditionals: [],
  maxLength: 250
}
