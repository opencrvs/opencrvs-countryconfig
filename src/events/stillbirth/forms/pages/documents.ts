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
  ConditionalType,
  defineFormPage,
  DocumentMimeType,
  FieldType,
  ImageMimeType,
  PageTypes,
  TranslationConfig
} from '@opencrvs/toolkit/events'

import { createSelectOptions } from '@countryconfig/events/utils'
import { isOtherInformant } from './informant'
import { requireMotherDetails } from './mother'
import { requireFatherDetails } from './father'
import { stillbirthEligible } from './eventDetails'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

const IdDocType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const idDocMessageDescriptors = {
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth certificate',
    description: 'Option for ID document: birth certificate',
    id: 'form.field.label.docTypeBirthCertificate'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for ID document: passport',
    id: 'form.field.label.docTypePassport'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for ID document: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof IdDocType, TranslationConfig>

const idDocOptions = createSelectOptions(IdDocType, idDocMessageDescriptors)

const FoetalDeathCertificateType = {
  MEDICAL_OFFICER_CERTIFICATE: 'MEDICAL_OFFICER_CERTIFICATE',
  STATUTORY_DECLARATION: 'STATUTORY_DECLARATION',
  CORONERS_ORDER: 'CORONERS_ORDER',
  OTHER: 'OTHER'
} as const

const foetalDeathCertificateMessageDescriptors = {
  MEDICAL_OFFICER_CERTIFICATE: {
    defaultMessage: 'Certificate by medical officer',
    description: 'Option for medical certificate - foetal death',
    id: 'event.stillbirth.action.declare.form.section.documents.field.medicalCertificate.option.medicalOfficerCertificate'
  },
  STATUTORY_DECLARATION: {
    defaultMessage: 'Statutory declaration',
    description: 'Option for medical certificate - foetal death',
    id: 'event.stillbirth.action.declare.form.section.documents.field.medicalCertificate.option.statutoryDeclaration'
  },
  CORONERS_ORDER: {
    defaultMessage: "Coroner's order",
    description: 'Option for medical certificate - foetal death',
    id: 'event.stillbirth.action.declare.form.section.documents.field.medicalCertificate.option.coronersOrder'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for medical certificate - foetal death',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof FoetalDeathCertificateType, TranslationConfig>

const foetalDeathCertificateOptions = createSelectOptions(
  FoetalDeathCertificateType,
  foetalDeathCertificateMessageDescriptors
)

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  conditional: stillbirthEligible,
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'event.stillbirth.action.declare.form.section.documents.title'
  },
  fields: [
    {
      id: 'documents.proofOfInformant',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of informant's identity",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.documents.field.proofOfInformant.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idDocOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: isOtherInformant }
      ]
    },
    {
      id: 'documents.proofOfMother',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of mother's identity",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.documents.field.proofOfMother.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idDocOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireMotherDetails }
      ]
    },
    {
      id: 'documents.proofOfFather',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of father's identity",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.documents.field.proofOfFather.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idDocOptions,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: requireFatherDetails }
      ]
    },
    {
      id: 'documents.medicalCertificate',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Medical certificate - foetal death',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.documents.field.medicalCertificate.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: foetalDeathCertificateOptions
    }
  ]
})
