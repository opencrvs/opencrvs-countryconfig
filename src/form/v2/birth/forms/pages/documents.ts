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

import { defineFormPage, FieldType } from '@opencrvs/toolkit/events'

export const documents = defineFormPage({
  id: 'documents',
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'v2.form.section.documents.title'
  },
  fields: [
    {
      id: `documents.helper`,
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'The following documents are required',
        description: 'This is the label for the field',
        id: `event.birth.action.declare.form.section.documents.field.helper.label`
      },
      configuration: { styles: { fontVariant: 'reg16' } }
    },
    {
      id: 'documents.proofOfBirth',
      type: FieldType.FILE,
      required: false,
      label: {
        defaultMessage: 'Proof of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfBirth.label'
      }
    },
    {
      id: 'documents.proofOfMother',
      type: FieldType.FILE, // @ToDo File upload with options
      required: false,
      label: {
        defaultMessage: "Proof of mother's ID",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfMother.label'
      }
    },

    {
      id: 'documents.proofOfFather',
      type: FieldType.FILE, // @ToDo File upload with options
      required: false,
      label: {
        defaultMessage: "Proof of father's ID",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfFather.label'
      }
    },

    {
      id: 'documents.proofOther',
      type: FieldType.FILE, // @ToDo File upload with options
      required: false,
      label: {
        defaultMessage: 'Other',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOther.label'
      }
    }
  ]
})
