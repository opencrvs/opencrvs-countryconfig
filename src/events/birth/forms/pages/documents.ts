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

import { createSelectOptions, hasNonHealthNotifierRole } from '@countryconfig/events/utils'
import {
  and,
  ConditionalType,
  defineFormPage,
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  not,
  or,
  PageTypes,
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'
import { requireMotherDetails } from './mother'
import { requireFatherDetails } from './father'
import { InformantType } from './informant'
import {
  BIRTH_DELAYED_REGISTRATION_TARGET_DAYS,
  BIRTH_LATE_REGISTRATION_TARGET_DAYS
} from '@countryconfig/events/utils'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

// --- Notification of birth options ---
const NotificationOfBirthType = {
  BIRTH_NOTIFICATION: 'BIRTH_NOTIFICATION',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const notificationOfBirthMessageDescriptors = {
  BIRTH_NOTIFICATION: {
    defaultMessage: 'Birth notification',
    description: 'Option for notification of birth: birth notification',
    id: 'form.field.label.docTypeNotificationOfBirth'
  },
  MEDICAL_CERTIFICATE: {
    defaultMessage: 'Medical certificate',
    description: 'Option for notification of birth: medical certificate',
    id: 'form.field.label.docTypeMedicalCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for notification of birth: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof NotificationOfBirthType, TranslationConfig>

const notificationOfBirthOptions = createSelectOptions(
  NotificationOfBirthType,
  notificationOfBirthMessageDescriptors
)

// --- ID document options ---
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

// --- Absence evidence options ---
const AbsenceEvidenceType = {
  LETTER_OF_CONSENT: 'LETTER_OF_CONSENT',
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const absenceEvidenceMessageDescriptors = {
  LETTER_OF_CONSENT: {
    defaultMessage: 'Letter of consent',
    description: 'Option for absence evidence: letter of consent',
    id: 'form.field.label.docTypeLetterOfConsent'
  },
  MEDICAL_CERTIFICATE: {
    defaultMessage: 'Medical certificate / letter',
    description: 'Option for absence evidence: medical certificate',
    id: 'form.field.label.docTypeMedicalCertificateLetter'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for absence evidence: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof AbsenceEvidenceType, TranslationConfig>

const absenceEvidenceOptions = createSelectOptions(
  AbsenceEvidenceType,
  absenceEvidenceMessageDescriptors
)

// --- Marriage proof options ---
const MarriageProofType = {
  MARRIAGE_CERTIFICATE: 'MARRIAGE_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const marriageProofMessageDescriptors = {
  MARRIAGE_CERTIFICATE: {
    defaultMessage: 'Marriage certificate',
    description: 'Option for marriage proof: marriage certificate',
    id: 'form.field.label.docTypeMarriageCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for marriage proof: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof MarriageProofType, TranslationConfig>

const marriageProofOptions = createSelectOptions(
  MarriageProofType,
  marriageProofMessageDescriptors
)

// --- Father consent options ---
const FatherConsentType = {
  NOTICE_OF_CONSENT_FATHER: 'NOTICE_OF_CONSENT_FATHER',
  NOTICE_OF_CONSENT_MOTHER: 'NOTICE_OF_CONSENT_MOTHER',
  OTHER: 'OTHER'
} as const

const fatherConsentMessageDescriptors = {
  NOTICE_OF_CONSENT_FATHER: {
    defaultMessage: 'Notice of consent (father)',
    description: 'Option for father consent: notice of consent father',
    id: 'form.field.label.docTypeNoticeOfConsentFather'
  },
  NOTICE_OF_CONSENT_MOTHER: {
    defaultMessage: 'Notice of consent (mother)',
    description: 'Option for father consent: notice of consent mother',
    id: 'form.field.label.docTypeNoticeOfConsentMother'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for father consent: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof FatherConsentType, TranslationConfig>

const fatherConsentOptions = createSelectOptions(
  FatherConsentType,
  fatherConsentMessageDescriptors
)

// --- Delayed registration evidence options ---
const DelayedRegistrationEvidenceType = {
  MEDICAL_CERTIFICATE: 'MEDICAL_CERTIFICATE',
  AFFIDAVIT: 'AFFIDAVIT',
  OTHER: 'OTHER'
} as const

const delayedRegistrationEvidenceMessageDescriptors = {
  MEDICAL_CERTIFICATE: {
    defaultMessage: 'Medical certificate / letter',
    description: 'Option for delayed registration evidence: medical certificate',
    id: 'form.field.label.docTypeMedicalCertificateLetter'
  },
  AFFIDAVIT: {
    defaultMessage: 'Affidavit',
    description: 'Option for delayed registration evidence: affidavit',
    id: 'form.field.label.docTypeAffidavit'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for delayed registration evidence: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<
  keyof typeof DelayedRegistrationEvidenceType,
  TranslationConfig
>

const delayedRegistrationEvidenceOptions = createSelectOptions(
  DelayedRegistrationEvidenceType,
  delayedRegistrationEvidenceMessageDescriptors
)

// --- Late registration options ---
const LateRegistrationType = {
  LATE_REGISTRATION_FORM: 'LATE_REGISTRATION_FORM',
  AFFIDAVIT: 'AFFIDAVIT',
  OTHER: 'OTHER'
} as const

const lateRegistrationMessageDescriptors = {
  LATE_REGISTRATION_FORM: {
    defaultMessage: 'Late registration form',
    description: 'Option for late registration: late registration form',
    id: 'form.field.label.docTypeLateRegistrationForm'
  },
  AFFIDAVIT: {
    defaultMessage: 'Affidavit',
    description: 'Option for late registration: affidavit',
    id: 'form.field.label.docTypeAffidavit'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for late registration: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof LateRegistrationType, TranslationConfig>

const lateRegistrationOptions = createSelectOptions(
  LateRegistrationType,
  lateRegistrationMessageDescriptors
)

// --- Registrar-general authorisation options ---
const RegistrarAuthorisationType = {
  LATE_REGISTRATION_FORM: 'LATE_REGISTRATION_FORM',
  STATUTORY_DECLARATION: 'STATUTORY_DECLARATION',
  COURT_ORDER: 'COURT_ORDER',
  OTHER: 'OTHER'
} as const

const registrarAuthorisationMessageDescriptors = {
  LATE_REGISTRATION_FORM: {
    defaultMessage: 'Late registration form',
    description: 'Option for registrar authorisation: late registration form',
    id: 'form.field.label.docTypeLateRegistrationForm'
  },
  STATUTORY_DECLARATION: {
    defaultMessage: 'Statutory declaration',
    description: 'Option for registrar authorisation: statutory declaration',
    id: 'form.field.label.docTypeStatutoryDeclaration'
  },
  COURT_ORDER: {
    defaultMessage: 'Court order',
    description: 'Option for registrar authorisation: court order',
    id: 'form.field.label.docTypeCourtOrder'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for registrar authorisation: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof RegistrarAuthorisationType, TranslationConfig>

const registrarAuthorisationOptions = createSelectOptions(
  RegistrarAuthorisationType,
  registrarAuthorisationMessageDescriptors
)

// --- Name change proof options ---
const NameChangeProofType = {
  DEED_POLL: 'DEED_POLL',
  NATIVE_ADOPTION_FORM: 'NATIVE_ADOPTION_FORM',
  OTHER: 'OTHER'
} as const

const nameChangeProofMessageDescriptors = {
  DEED_POLL: {
    defaultMessage: 'Deed poll',
    description: 'Option for name change proof: deed poll',
    id: 'form.field.label.docTypeDeedPoll'
  },
  NATIVE_ADOPTION_FORM: {
    defaultMessage: 'Native adoption form',
    description: 'Option for name change proof: native adoption form',
    id: 'form.field.label.docTypeNativeAdoptionForm'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for name change proof: other',
    id: 'form.field.label.docTypeOther'
  }
} satisfies Record<keyof typeof NameChangeProofType, TranslationConfig>

const nameChangeProofOptions = createSelectOptions(
  NameChangeProofType,
  nameChangeProofMessageDescriptors
)

// Mother is in the record but is NOT the informant (i.e., not Mother or Mother and Father)
const motherIncludedButNotInformant = and(
  requireMotherDetails,
  not(
    or(
      field('informant.relation').isEqualTo(InformantType.MOTHER_AND_FATHER),
      field('informant.relation').isEqualTo(InformantType.MOTHER)
    )
  )
)

// Father is in the record but is NOT the informant
const fatherIncludedButNotInformant = and(
  requireFatherDetails,
  not(
    or(
      field('informant.relation').isEqualTo(InformantType.MOTHER_AND_FATHER),
      field('informant.relation').isEqualTo(InformantType.FATHER)
    )
  )
)

const parentsAreMarried = and(
  requireMotherDetails,
  field('mother.maritalStatus').isEqualTo('MARRIED')
)

const fatherIncludedAndParentsNotMarried = and(
  requireFatherDetails,
  not(field('mother.maritalStatus').isEqualTo('MARRIED'))
)

const isDelayedRegistration = and(
  field('child.dob').isBefore().now(),
  not(
    field('child.dob')
      .isAfter()
      .days(BIRTH_DELAYED_REGISTRATION_TARGET_DAYS)
      .inPast()
  ),
  field('child.dob')
    .isAfter()
    .days(BIRTH_LATE_REGISTRATION_TARGET_DAYS)
    .inPast()
)

const isLateRegistration = and(
  field('child.dob').isBefore().now(),
  not(
    field('child.dob')
      .isAfter()
      .days(BIRTH_LATE_REGISTRATION_TARGET_DAYS)
      .inPast()
  )
)

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'form.section.documents.title'
  },
  conditional: hasNonHealthNotifierRole,
  fields: [
    {
      id: 'documents.proofOfBirth',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Notification of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfBirth.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: notificationOfBirthOptions
    },
    {
      id: 'documents.proofOfMother',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of mother's identity",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfMother.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idDocOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
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
        id: 'event.birth.action.declare.form.section.documents.field.proofOfFather.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idDocOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'documents.proofOfInformant',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of informant's identity",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfInformant.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idDocOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              field('informant.relation').isEqualTo(
                InformantType.MOTHER_AND_FATHER
              ),
              field('informant.relation').isEqualTo(InformantType.MOTHER),
              field('informant.relation').isEqualTo(InformantType.FATHER)
            )
          )
        }
      ]
    },
    {
      id: 'documents.absenceOfMother',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Supporting evidence of mother's absence",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.absenceOfMother.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: absenceEvidenceOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: motherIncludedButNotInformant
        }
      ]
    },
    {
      id: 'documents.absenceOfFather',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Supporting evidence of father's absence",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.absenceOfFather.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: absenceEvidenceOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: fatherIncludedButNotInformant
        }
      ]
    },
    {
      id: 'documents.proofOfMarriage',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of parent's marriage",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfMarriage.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: marriageProofOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: parentsAreMarried
        }
      ]
    },
    {
      id: 'documents.consentToAsertainFather',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Consent to ascertain father of child',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.consentToAsertainFather.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: fatherConsentOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: fatherIncludedAndParentsNotMarried
        }
      ]
    },
    {
      id: 'documents.delayedRegistrationEvidence',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Supporting evidence for delayed registration',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.delayedRegistrationEvidence.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: delayedRegistrationEvidenceOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isDelayedRegistration
        }
      ]
    },
    {
      id: 'documents.lateRegistration',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Late registration (after 12 months)',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.lateRegistration.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: lateRegistrationOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: isLateRegistration
        }
      ]
    },
    {
      id: 'documents.registrarAuthorisation',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Registrar-general authorisation',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.registrarAuthorisation.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: registrarAuthorisationOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: or(
            field('informant.relation').isEqualTo(InformantType.LEGAL_GUARDIAN),
            isLateRegistration
          )
        }
      ]
    },
    {
      id: 'documents.proofOfNameChange',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Proof of name change',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.documents.field.proofOfNameChange.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: nameChangeProofOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.nameChangedAfterRegistration').isEqualTo(
            true
          )
        }
      ]
    }
  ]
})

