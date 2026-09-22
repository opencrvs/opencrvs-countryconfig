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
  ConditionalType,
  field,
  ImageMimeType,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'
import { DEFAULT_FILE_CONFIGURATION } from '@countryconfig/events/fileTypeConfig'

// ------------------------------------------
// FILE CONFIGURATION
// ------------------------------------------

// ------------------------------------------
// DOCUMENT TYPE OPTIONS
// ------------------------------------------

const MarriageRegisterDocType = {
  REGISTER_FORM: 'REGISTER_FORM',
  OTHER: 'OTHER'
} as const

const marriageRegisterDocMessageDescriptors = {
  REGISTER_FORM: {
    defaultMessage: 'Particulars of Marriage for Registration',
    description: 'Option for marriage register form document',
    id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.field.marriageRegisterForm.option.registerForm'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for other document type',
    id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.field.marriageRegisterForm.option.other'
  }
} satisfies Record<keyof typeof MarriageRegisterDocType, TranslationConfig>

const AuthorisationLetterDocType = {
  AUTHORISATION_LETTER: 'AUTHORISATION_LETTER',
  OTHER: 'OTHER'
} as const

const authorisationLetterDocMessageDescriptors = {
  AUTHORISATION_LETTER: {
    defaultMessage: 'Authorisation letter from officiant',
    description: 'Option for authorisation letter document',
    id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.field.authorisationLetter.option.authorisationLetter'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for other document type',
    id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.field.authorisationLetter.option.other'
  }
} satisfies Record<keyof typeof AuthorisationLetterDocType, TranslationConfig>

// Create select options
const marriageRegisterDocOptions = createSelectOptions(
  MarriageRegisterDocType,
  marriageRegisterDocMessageDescriptors
)

const authorisationLetterDocOptions = createSelectOptions(
  AuthorisationLetterDocType,
  authorisationLetterDocMessageDescriptors
)

// ------------------------------------------
// DEFINE PAGE
// ------------------------------------------

export const supportingDocuments = defineFormPage({
  id: 'supportingDocuments',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for supporting documents',
    id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.title'
  },
  fields: [
    // Marriage register form upload
    {
      id: 'supportingDocuments.marriageRegisterForm',
      type: FieldType.FILE_WITH_OPTIONS,
      analytics: true,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Marriage register form',
        description: 'Label for marriage register form upload field',
        id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.field.marriageRegisterForm.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: marriageRegisterDocOptions
    },

    // Authorisation letter upload (Only if informant type is "Someone else")
    {
      id: 'supportingDocuments.authorisationLetter',
      type: FieldType.FILE_WITH_OPTIONS,
      analytics: true,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Authorisation letter to return marriage documents',
        description: 'Label for authorisation letter upload field',
        id: 'event.marriageRegistration.action.declare.form.section.supportingDocuments.field.authorisationLetter.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: authorisationLetterDocOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('informantDetails.informantType').isEqualTo(
            'SOMEONE_ELSE'
          )
        }
      ]
    }
  ]
})
