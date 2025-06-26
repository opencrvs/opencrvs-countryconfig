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

import { createSelectOptions } from '@countryconfig/form/v2/utils'
import {
  defineFormPage,
  FieldType,
  ImageMimeType,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'

const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeBirthCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeOther'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg']
  ]
}

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'v2.form.section.documents.title'
  },
  fields: [
    {
      id: 'documents.helper',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage: 'The following documents are required',
        description: 'The following documents are required',
        id: 'v2.form.field.label.proofOfBirth.fileName'
      },
      configuration: { styles: { fontVariant: 'reg16' } }
    },
    {
      id: 'documents.proofOfDeceased',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: "Proof of deceased's ID",
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.documents.field.proofOfDeceased.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },
    {
      id: 'documents.proofOfInformant',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: "Proof of informant's ID",
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.documents.field.proofOfInformant.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },
    {
      id: 'documents.proofOfDeath',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: 'Proof of death of deceased',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.documents.field.proofOfDeath.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },
    {
      id: 'documents.proofOfCauseOfDeath',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: 'Proof of cause of death',
        description: 'This is the label for the field',
        id: 'v2.event.death.action.declare.form.section.documents.field.proofOfCauseOfDeath.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    }
  ]
})
