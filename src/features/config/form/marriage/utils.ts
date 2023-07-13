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
import { Conditional, ISelectOption } from '../types/types'
import { marriageDocumentTypeFhirMapping } from '../options'
import { formMessageDescriptors } from '../formatjs-messages'

export const hideIfInformantBrideOrGroom: Conditional[] = [
  {
    action: 'hide',
    expression:
      '(!values.informantType || values.informantType === "BRIDE" || values.informantType === "GROOM")'
  }
]

export const getInformantConditionalForDocUpload: Conditional[] = [
  {
    action: 'hide',
    expression:
      "(draftData && draftData.informant && draftData.informant.informantType && (draftData.informant.informantType === 'BRIDE' || draftData.informant.informantType === 'GROOM' ))"
  }
]

export const brideOrGroomBirthDateValidators = (spouseType: string) => [
  {
    operation: 'dateFormatIsCorrect',
    parameters: []
  },
  {
    operation: 'dateInPast',
    parameters: []
  },
  {
    operation: 'isValidDateOfBirthForMarriage',
    parameters: [spouseType, 18]
  }
]

export const getDocSelectOptions: ISelectOption[] = [
  {
    value: marriageDocumentTypeFhirMapping.NATIONAL_ID,
    label: formMessageDescriptors.docTypeNID
  },
  {
    value: marriageDocumentTypeFhirMapping.PASSPORT,
    label: formMessageDescriptors.docTypePassport
  },
  {
    value: marriageDocumentTypeFhirMapping.BIRTH_CERTIFICATE,
    label: formMessageDescriptors.docTypeBirthCert
  },
  {
    value: marriageDocumentTypeFhirMapping.OTHER,
    label: formMessageDescriptors.docTypeOther
  }
]
