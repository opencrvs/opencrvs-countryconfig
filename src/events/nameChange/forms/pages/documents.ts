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
import { idTypeOptions } from '@countryconfig/events/utils'
import {
  defineFormPage,
  FieldType,
  PageTypes,
  ImageMimeType,
  ConditionalType,
  field,
  and,
  not,
  or,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { createSelectOptions } from '@countryconfig/events/utils'
import { InformantType } from './informant'
import { DEFAULT_FILE_CONFIGURATION } from '@countryconfig/events/fileTypeConfig'

const BirthRecordDocumentType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const ProofOfIdentityDocumentType = {
  PASSPORT: 'PASSPORT',
  DRIVERS_LICENCE: 'DRIVERS_LICENCE',
  OTHER: 'OTHER'
} as const

const ProofOfInformantIdentityDocumentType = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
} as const

const ProofOfParentageDocumentType = {
  STATUTORY_DECLARATION: 'STATUTORY_DECLARATION',
  COURT_ORDER: 'COURT_ORDER',
  OTHER: 'OTHER'
} as const

const NameChangeApplicationDocumentType = {
  SIGNED_DEED_POLL: 'SIGNED_DEED_POLL',
  PERSONAL_STATEMENT: 'PERSONAL_STATEMENT',
  STATUTORY_DECLARATION: 'STATUTORY_DECLARATION',
  COURT_ORDER: 'COURT_ORDER',
  MARRIAGE_CERTIFICATE: 'MARRIAGE_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const birthRecordDocumentTypeMessageDescriptors = {
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth certificate',
    description: 'Option for document type: Birth certificate',
    id: 'form.field.label.documentType.birthCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for document type: Other',
    id: 'form.field.label.documentType.other'
  }
} satisfies Record<keyof typeof BirthRecordDocumentType, TranslationConfig>

const proofOfIdentityDocumentTypeMessageDescriptors = {
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for document type: Passport',
    id: 'form.field.label.documentType.passport'
  },
  DRIVERS_LICENCE: {
    defaultMessage: "Driver's licence",
    description: "Option for document type: Driver's licence",
    id: 'form.field.label.documentType.driversLicence'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for document type: Other',
    id: 'form.field.label.documentType.other'
  }
} satisfies Record<keyof typeof ProofOfIdentityDocumentType, TranslationConfig>

const proofOfInformantIdentityDocumentTypeMessageDescriptors = {
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for document type: Birth Certificate',
    id: 'form.field.label.documentType.birthCertificate'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for document type: Passport',
    id: 'form.field.label.documentType.passport'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for document type: Other',
    id: 'form.field.label.documentType.other'
  }
} satisfies Record<
  keyof typeof ProofOfInformantIdentityDocumentType,
  TranslationConfig
>

const proofOfParentageDocumentTypeMessageDescriptors = {
  STATUTORY_DECLARATION: {
    defaultMessage: 'Statutory declaration',
    description: 'Option for document type: Statutory declaration',
    id: 'form.field.label.documentType.statutoryDeclaration'
  },
  COURT_ORDER: {
    defaultMessage: 'Court order',
    description: 'Option for document type: Court order',
    id: 'form.field.label.documentType.courtOrder'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for document type: Other',
    id: 'form.field.label.documentType.other'
  }
} satisfies Record<keyof typeof ProofOfParentageDocumentType, TranslationConfig>

const nameChangeApplicationDocumentTypeMessageDescriptors = {
  SIGNED_DEED_POLL: {
    defaultMessage: 'Signed deed poll',
    description: 'Option for document type: Signed deed poll',
    id: 'form.field.label.documentType.signedDeedPoll'
  },
  PERSONAL_STATEMENT: {
    defaultMessage: 'Personal statement',
    description: 'Option for document type: Personal statement',
    id: 'form.field.label.documentType.personalStatement'
  },
  STATUTORY_DECLARATION: {
    defaultMessage: 'Statutory declaration',
    description: 'Option for document type: Statutory declaration',
    id: 'form.field.label.documentType.statutoryDeclaration'
  },
  COURT_ORDER: {
    defaultMessage: 'Court order',
    description: 'Option for document type: Court order',
    id: 'form.field.label.documentType.courtOrder'
  },
  MARRIAGE_CERTIFICATE: {
    defaultMessage: 'Marriage certificate',
    description: 'Option for document type: Marriage certificate',
    id: 'form.field.label.documentType.marriageCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for document type: Other',
    id: 'form.field.label.documentType.other'
  }
} satisfies Record<
  keyof typeof NameChangeApplicationDocumentType,
  TranslationConfig
>

const birthRecordDocumentOptions = createSelectOptions(
  BirthRecordDocumentType,
  birthRecordDocumentTypeMessageDescriptors
)

const proofOfIdentityDocumentOptions = createSelectOptions(
  ProofOfIdentityDocumentType,
  proofOfIdentityDocumentTypeMessageDescriptors
)

const proofOfInformantIdentityDocumentOptions = createSelectOptions(
  ProofOfInformantIdentityDocumentType,
  proofOfInformantIdentityDocumentTypeMessageDescriptors
)

const proofOfParentageDocumentOptions = createSelectOptions(
  ProofOfParentageDocumentType,
  proofOfParentageDocumentTypeMessageDescriptors
)

const nameChangeApplicationDocumentOptions = createSelectOptions(
  NameChangeApplicationDocumentType,
  nameChangeApplicationDocumentTypeMessageDescriptors
)

// Options without marriage certificate (for subjects not in the 16-21 age range or non-self informants)
const nameChangeApplicationDocumentOptionsWithoutMarriage = createSelectOptions(
  {
    SIGNED_DEED_POLL: NameChangeApplicationDocumentType.SIGNED_DEED_POLL,
    PERSONAL_STATEMENT: NameChangeApplicationDocumentType.PERSONAL_STATEMENT,
    STATUTORY_DECLARATION:
      NameChangeApplicationDocumentType.STATUTORY_DECLARATION,
    COURT_ORDER: NameChangeApplicationDocumentType.COURT_ORDER,
    OTHER: NameChangeApplicationDocumentType.OTHER
  },
  {
    SIGNED_DEED_POLL:
      nameChangeApplicationDocumentTypeMessageDescriptors.SIGNED_DEED_POLL,
    PERSONAL_STATEMENT:
      nameChangeApplicationDocumentTypeMessageDescriptors.PERSONAL_STATEMENT,
    STATUTORY_DECLARATION:
      nameChangeApplicationDocumentTypeMessageDescriptors.STATUTORY_DECLARATION,
    COURT_ORDER:
      nameChangeApplicationDocumentTypeMessageDescriptors.COURT_ORDER,
    OTHER: nameChangeApplicationDocumentTypeMessageDescriptors.OTHER
  }
)

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for documents',
    id: 'event.nameChange.action.declare.form.section.documents.title'
  },
  fields: [
    // F1: Record of original birth entry
    {
      id: 'documents.originalBirthEntry',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Record of original birth entry',
        description: 'Label for uploading record of original birth entry',
        id: 'event.nameChange.action.declare.form.section.documents.field.originalBirthEntry.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: birthRecordDocumentOptions
    },
    // F2: Proof of identity – Person whose name is being changed
    {
      id: 'documents.proofOfSubjectIdentity',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage:
          'Proof of identity – Person whose name is being changed',
        description:
          'Label for uploading proof of identity for person whose name is being changed',
        id: 'event.nameChange.action.declare.form.section.documents.field.proofOfSubjectIdentity.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfIdentityDocumentOptions
    },
    // Proof of informant's identity
    {
      id: 'documents.proofOfInformantIdentity',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: "Proof of informant's identity",
        description: "Label for uploading proof of informant's identity",
        id: 'event.nameChange.action.declare.form.section.documents.field.proofOfInformantIdentity.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfInformantIdentityDocumentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // Proof of parentage or guardianship
    {
      id: 'documents.proofOfParentage',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: 'Proof of parentage or guardianship',
        description: 'Label for uploading proof of parentage or guardianship',
        id: 'event.nameChange.action.declare.form.section.documents.field.proofOfParentage.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfParentageDocumentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('subjects.dob')
                .isAfter()
                .days(21 * 365)
                .inPast()
            ),
            or(
              field('informant.informantType').isEqualTo(
                InformantType.LEGAL_GUARDIAN
              ),
              field('informant.informantType').isEqualTo(InformantType.OTHER)
            )
          )
        }
      ]
    },
    // F2: Name change application (with marriage certificate option for 16-21 year olds who are self-informants)
    {
      id: 'documents.nameChangeApplication',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: 'Name change application',
        description: 'Label for uploading name change application',
        id: 'event.nameChange.action.declare.form.section.documents.field.nameChangeApplication.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: nameChangeApplicationDocumentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('subjects.dob')
              .isBefore()
              .days(16 * 365)
              .inPast(),
            not(
              field('subjects.dob')
                .isBefore()
                .days(21 * 365)
                .inPast()
            ),
            field('informant.informantType').isEqualTo(InformantType.SELF)
          )
        }
      ]
    },
    // F2: Name change application (without marriage certificate option)
    {
      id: 'documents.nameChangeApplication',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: 'Name change application',
        description: 'Label for uploading name change application',
        id: 'event.nameChange.action.declare.form.section.documents.field.nameChangeApplication.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: nameChangeApplicationDocumentOptionsWithoutMarriage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: or(
            not(
              field('subjects.dob')
                .isAfter()
                .days(16 * 365)
                .inPast()
            ),
            field('subjects.dob')
              .isBefore()
              .days(21 * 365)
              .inPast(),
            not(field('informant.informantType').isEqualTo(InformantType.SELF))
          )
        }
      ]
    }
  ]
})
