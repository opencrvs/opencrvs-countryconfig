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
  PageTypes
} from '@opencrvs/toolkit/events'

import { emptyMessage } from '@countryconfig/events/utils'

export const icd10 = defineFormPage({
  id: 'icd10',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'ICD-10 mortality coding',
    description: 'Form section title for ICD-10 coding',
    id: 'form.death.icd10.title'
  },
  fields: [
    // ---- Underlying cause ICD-10 code ----
    {
      id: 'icd10.underlyingCauseCode',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'ICD-10 underlying cause of death code',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.icd10.field.underlyingCauseCode.label'
      }
    },
    // ---- Selected cause codes ----
    {
      id: 'icd10.selectedCauseCodes',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'ICD-10 selected cause codes',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.icd10.field.selectedCauseCodes.label'
      }
    },
    // ---- Multiple cause codes ----
    {
      id: 'icd10.multipleCauseCodes',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'ICD-10 multiple cause codes',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.icd10.field.multipleCauseCodes.label'
      }
    },
    // ---- Divider ----
    {
      id: 'icd10.divider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // ---- IRIS notes ----
    {
      id: 'icd10.irisNotes',
      type: FieldType.TEXTAREA,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'IRIS coding output notes',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.icd10.field.irisNotes.label'
      }
    }
  ]
})
