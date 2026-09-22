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
import {
  defineFormPage,
  FieldType,
  PageTypes,
  field
} from '@opencrvs/toolkit/events'
import { invalidNameValidatorNameChange } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

export const newName = defineFormPage({
  id: 'newName',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'New name details',
    description: 'Form section title for new name after change',
    id: 'form.nameChange.newName.title'
  },
  fields: [
    // B1: Given name(s)
    {
      id: 'newName.name.firstname',
      type: FieldType.TEXT,
      required: false,

      label: {
        defaultMessage: 'New Given name(s)',
        description: 'Label for new given name(s)',
        id: 'event.nameChange.action.declare.form.section.newName.field.firstname.label'
      },
      validation: [invalidNameValidatorNameChange('newName.name.firstname')],
      configuration: {
        maxLength: MAX_NAME_LENGTH
      }
    },
    // B2: Surname
    {
      id: 'newName.name.surname',
      type: FieldType.TEXT,
      required: false,

      label: {
        defaultMessage: 'New Surname',
        description: 'Label for new surname',
        id: 'event.nameChange.action.declare.form.section.newName.field.surname.label'
      },
      validation: [invalidNameValidatorNameChange('newName.name.surname')],
      configuration: {
        maxLength: MAX_NAME_LENGTH
      }
    },
    // B3: Reason for name change (optional)
    {
      id: 'newName.reason',
      type: FieldType.TEXTAREA,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Reason for name change (optional)',
        description: 'Label for reason for name change',
        id: 'event.nameChange.action.declare.form.section.newName.field.reason.label'
      },
      configuration: {
        rows: 4
      }
    }
  ]
})
