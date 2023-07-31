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

// A file just to store the constants until we decide what to do with removing hardcoded options from core

import { formMessageDescriptors } from './formatjs-messages'
import { BIG_NUMBER, IDynamicFieldTypeMapper, TEXT } from './types/types'
import { MessageDescriptor } from 'react-intl'

export const NATIONAL_ID = 'NATIONAL_ID'
export const BIRTH_REGISTRATION_NUMBER = 'BIRTH_REGISTRATION_NUMBER'
export const PASSPORT = 'PASSPORT'
export const DEATH_REGISTRATION_NUMBER = 'DEATH_REGISTRATION_NUMBER'
export const DRIVING_LICENSE = 'DRIVING_LICENSE'
export const REFUGEE_NUMBER = 'REFUGEE_NUMBER'
export const ALIEN_NUMBER = 'ALIEN_NUMBER'
export const OTHER = 'OTHER'
export const NO_ID = 'NO_ID'
export const SOCIAL_SECURITY_NO = 'SOCIAL_SECURITY_NO'

export const deathDocumentForWhomFhirMapping = {
  DECEASED_ID_PROOF: 'DECEASED_ID_PROOF',
  DECEASED_DEATH_PROOF: 'DECEASED_DEATH_PROOF',
  DECEASED_DEATH_CAUSE_PROOF: 'DECEASED_DEATH_CAUSE_PROOF',
  INFORMANT_ID_PROOF: 'INFORMANT_ID_PROOF'
}

export const deathDocumentTypeFhirMapping = {
  HOSPITAL_CERTIFICATE_OF_DEATH: 'HOSPITAL_CERTIFICATE_OF_DEATH',
  ATTESTED_LETTER_OF_DEATH: 'ATTESTED_LETTER_OF_DEATH',
  BURIAL_RECEIPT: 'BURIAL_RECEIPT',
  POLICE_CERTIFICATE_OF_DEATH: 'POLICE_CERTIFICATE_OF_DEATH',
  MEDICALLY_CERTIFIED_CAUSE_OF_DEATH: 'MEDICALLY_CERTIFIED_CAUSE_OF_DEATH',
  VERBAL_AUTOPSY_REPORT: 'VERBAL_AUTOPSY_REPORT',
  CORONERS_REPORT: 'CORONERS_REPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
}

export const birthDocumentForWhomFhirMapping = {
  CHILD: 'CHILD',
  FATHER: 'FATHER',
  MOTHER: 'MOTHER',
  PARENT: 'PARENT',
  OTHER: 'OTHER',
  INFORMANT_ID_PROOF: 'INFORMANT_ID_PROOF',
  LEGAL_GUARDIAN_PROOF: 'LEGAL_GUARDIAN_PROOF'
}

export const birthDocumentTypeFhirMapping = {
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER',
  NOTIFICATION_OF_BIRTH: 'NOTIFICATION_OF_BIRTH',
  PROOF_OF_LEGAL_GUARDIANSHIP: 'PROOF_OF_LEGAL_GUARDIANSHIP',
  PROOF_OF_ASSIGNED_RESPONSIBILITY: 'PROOF_OF_ASSIGNED_RESPONSIBILITY'
}

export const marriageDocumentForWhomFhirMapping = {
  GROOM: 'GROOM',
  BRIDE: 'BRIDE',
  MARRIAGE_NOTICE_PROOF: 'MARRIAGE_NOTICE_PROOF',
  INFORMANT: 'INFORMANT'
}

export const marriageDocumentTypeFhirMapping = {
  MARRIAGE_NOTICE: 'MARRIAGE_NOTICE',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  OTHER: 'OTHER'
}

export const identityOptions = [
  { value: PASSPORT, label: formMessageDescriptors.iDTypePassport },
  { value: NATIONAL_ID, label: formMessageDescriptors.iDTypeNationalID },
  {
    value: DRIVING_LICENSE,
    label: formMessageDescriptors.iDTypeDrivingLicense
  },
  {
    value: BIRTH_REGISTRATION_NUMBER,
    label: formMessageDescriptors.iDTypeBRN
  },
  {
    value: REFUGEE_NUMBER,
    label: formMessageDescriptors.iDTypeRefugeeNumber
  },
  { value: ALIEN_NUMBER, label: formMessageDescriptors.iDTypeAlienNumber },
  { value: NO_ID, label: formMessageDescriptors.iDTypeNoId },
  { value: OTHER, label: formMessageDescriptors.iDTypeOther }
]

export const identityTypeMapper: IDynamicFieldTypeMapper = (key: string) => {
  switch (key) {
    case NATIONAL_ID:
      return BIG_NUMBER
    case BIRTH_REGISTRATION_NUMBER:
      return BIG_NUMBER
    case DEATH_REGISTRATION_NUMBER:
      return BIG_NUMBER
    default:
      return TEXT
  }
}

export function identityHelperTextMapper(
  code: string
): MessageDescriptor | undefined {
  switch (code) {
    case 'NATIONAL_ID':
      return formMessageDescriptors.helperTextNID
    default:
      return undefined
  }
}

export function identityTooltipMapper(code: string): MessageDescriptor {
  switch (code) {
    case 'NATIONAL_ID':
      return formMessageDescriptors.tooltipNationalID
    case 'BIRTH_REGISTRATION_NUMBER':
      return formMessageDescriptors.iDTypeBRN
    default:
      return formMessageDescriptors.iD
  }
}

export function identityNameMapper(code: string): MessageDescriptor {
  switch (code) {
    case 'NATIONAL_ID':
      return formMessageDescriptors.iDTypeNationalID
    case 'PASSPORT':
      return formMessageDescriptors.iDTypePassport
    case 'DRIVING_LICENSE':
      return formMessageDescriptors.iDTypeDrivingLicense
    case 'BIRTH_REGISTRATION_NUMBER':
      return formMessageDescriptors.iDTypeBRN
    case 'DEATH_REGISTRATION_NUMBER':
      return formMessageDescriptors.iDTypeDRN
    case 'REFUGEE_NUMBER':
      return formMessageDescriptors.iDTypeRefugeeNumber
    case 'ALIEN_NUMBER':
      return formMessageDescriptors.iDTypeAlienNumber
    default:
      return formMessageDescriptors.iD
  }
}
