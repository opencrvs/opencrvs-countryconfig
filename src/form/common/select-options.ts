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

import { formMessageDescriptors, informantMessageDescriptors } from './messages'
import {
  BIG_NUMBER,
  IDynamicFieldTypeMapper,
  IRadioOption,
  ISelectOption,
  TEXT
} from '../types/types'

// THIS FILE ALLOWS YOU TO CUSTOMISE EVERY DEFAULT SELECT OPTION IN OPENCRVS WHETHER OR NOT THE FIELD IS REQUIRED OR CUSTOM

export const informantTypes = {
  SPOUSE: 'SPOUSE',
  SON: 'SON',
  DAUGHTER: 'DAUGHTER',
  SON_IN_LAW: 'SON_IN_LAW',
  DAUGHTER_IN_LAW: 'DAUGHTER_IN_LAW',
  MOTHER: 'MOTHER',
  FATHER: 'FATHER',
  GRANDSON: 'GRANDSON',
  GRANDDAUGHTER: 'GRANDDAUGHTER',
  OTHER: 'OTHER',
  GROOM: 'GROOM',
  BRIDE: 'BRIDE',
  GRANDFATHER: 'GRANDFATHER',
  GRANDMOTHER: 'GRANDMOTHER',
  BROTHER: 'BROTHER',
  SISTER: 'SISTER',
  OTHER_FAMILY_MEMBER: 'OTHER_FAMILY_MEMBER',
  LEGAL_GUARDIAN: 'LEGAL_GUARDIAN',
  HEAD_OF_GROOM_FAMILY: 'HEAD_OF_GROOM_FAMILY',
  HEAD_OF_BRIDE_FAMILY: 'HEAD_OF_BRIDE_FAMILY'
}

export const identityNumberMapping = {
  NATIONAL_ID: 'NATIONAL_ID',
  BIRTH_REGISTRATION_NUMBER: 'BIRTH_REGISTRATION_NUMBER',
  PASSPORT: 'PASSPORT',
  DEATH_REGISTRATION_NUMBER: 'DEATH_REGISTRATION_NUMBER',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  REFUGEE_NUMBER: 'REFUGEE_NUMBER',
  ALIEN_NUMBER: 'ALIEN_NUMBER',
  OTHER: 'OTHER',
  NO_ID: 'NO_ID',
  SOCIAL_SECURITY_NO: 'SOCIAL_SECURITY_NO'
}

export const identityOptions: ISelectOption[] = [
  {
    value: identityNumberMapping.PASSPORT,
    label: formMessageDescriptors.iDTypePassport
  },
  {
    value: identityNumberMapping.NATIONAL_ID,
    label: formMessageDescriptors.iDTypeNationalID
  },
  {
    value: identityNumberMapping.DRIVING_LICENSE,
    label: formMessageDescriptors.iDTypeDrivingLicense
  },
  {
    value: identityNumberMapping.BIRTH_REGISTRATION_NUMBER,
    label: formMessageDescriptors.iDTypeBRN
  },
  {
    value: identityNumberMapping.REFUGEE_NUMBER,
    label: formMessageDescriptors.iDTypeRefugeeNumber
  },
  {
    value: identityNumberMapping.ALIEN_NUMBER,
    label: formMessageDescriptors.iDTypeAlienNumber
  },
  {
    value: identityNumberMapping.NO_ID,
    label: formMessageDescriptors.iDTypeNoId
  },
  {
    value: identityNumberMapping.OTHER,
    label: formMessageDescriptors.iDTypeOther
  }
]

export const identityTypeMapper: IDynamicFieldTypeMapper = (key: string) => {
  switch (key) {
    case identityNumberMapping.NATIONAL_ID:
      return BIG_NUMBER
    case identityNumberMapping.BIRTH_REGISTRATION_NUMBER:
      return BIG_NUMBER
    case identityNumberMapping.DEATH_REGISTRATION_NUMBER:
      return BIG_NUMBER
    default:
      return TEXT
  }
}

export const deathInformantTypeOptions: ISelectOption[] = [
  {
    value: informantTypes.SPOUSE,
    label: informantMessageDescriptors.SPOUSE
  },
  {
    value: informantTypes.SON,
    label: informantMessageDescriptors.SON
  },
  {
    value: informantTypes.DAUGHTER,
    label: informantMessageDescriptors.DAUGHTER
  },
  {
    value: informantTypes.SON_IN_LAW,
    label: informantMessageDescriptors.SON_IN_LAW
  },
  {
    value: informantTypes.DAUGHTER_IN_LAW,
    label: informantMessageDescriptors.DAUGHTER_IN_LAW
  },
  {
    value: informantTypes.MOTHER,
    label: informantMessageDescriptors.MOTHER
  },
  {
    value: informantTypes.FATHER,
    label: informantMessageDescriptors.FATHER
  },
  {
    value: informantTypes.GRANDSON,
    label: informantMessageDescriptors.GRANDSON
  },
  {
    value: informantTypes.GRANDDAUGHTER,
    label: informantMessageDescriptors.GRANDDAUGHTER
  },
  {
    value: informantTypes.OTHER,
    label: informantMessageDescriptors.OTHER
  }
]

export const birthInformantTypeOptions: ISelectOption[] = [
  {
    value: informantTypes.MOTHER,
    label: informantMessageDescriptors.MOTHER
  },
  {
    value: informantTypes.FATHER,
    label: informantMessageDescriptors.FATHER
  },
  {
    value: informantTypes.GRANDFATHER,
    label: informantMessageDescriptors.GRANDFATHER
  },
  {
    value: informantTypes.GRANDMOTHER,
    label: informantMessageDescriptors.GRANDMOTHER
  },
  {
    value: informantTypes.BROTHER,
    label: informantMessageDescriptors.BROTHER
  },
  {
    value: informantTypes.SISTER,
    label: informantMessageDescriptors.SISTER
  },
  {
    value: informantTypes.OTHER_FAMILY_MEMBER,
    label: informantMessageDescriptors.OTHER_FAMILY_MEMBER
  },
  {
    value: informantTypes.LEGAL_GUARDIAN,
    label: informantMessageDescriptors.LEGAL_GUARDIAN
  },
  {
    value: informantTypes.OTHER,
    label: informantMessageDescriptors.OTHER
  }
]

export const getMarriageInformantTypeOptions: ISelectOption[] = [
  {
    value: informantTypes.GROOM,
    label: informantMessageDescriptors.GROOM
  },
  {
    value: informantTypes.BRIDE,
    label: informantMessageDescriptors.BRIDE
  },
  {
    value: informantTypes.HEAD_OF_GROOM_FAMILY,
    label: formMessageDescriptors.headOfGroomFamily
  },
  {
    value: informantTypes.HEAD_OF_BRIDE_FAMILY,
    label: formMessageDescriptors.headOfBrideFamily
  },
  {
    value: informantTypes.OTHER,
    label: informantMessageDescriptors.OTHER
  }
]

export const witnessRelationshipOptions: ISelectOption[] = [
  {
    value: informantTypes.HEAD_OF_GROOM_FAMILY,
    label: formMessageDescriptors.headOfGroomFamily
  },
  {
    value: informantTypes.HEAD_OF_BRIDE_FAMILY,
    label: formMessageDescriptors.headOfBrideFamily
  },
  {
    value: informantTypes.OTHER,
    label: formMessageDescriptors.other
  }
]

export const genderOptions: ISelectOption[] = [
  {
    value: 'male',
    label: formMessageDescriptors.sexMale
  },
  {
    value: 'female',
    label: formMessageDescriptors.sexFemale
  },
  {
    value: 'unknown',
    label: formMessageDescriptors.sexUnknown
  }
]

export const placeOfBirthOptions: ISelectOption[] = [
  {
    value: 'HEALTH_FACILITY',
    label: formMessageDescriptors.healthInstitution
  },
  {
    value: 'PRIVATE_HOME',
    label: formMessageDescriptors.privateHome
  },
  {
    value: 'OTHER',
    label: formMessageDescriptors.otherInstitution
  }
]

export const placeOfDeathOptions: ISelectOption[] = [
  {
    value: 'HEALTH_FACILITY',
    label: formMessageDescriptors.healthInstitution
  },
  {
    value: 'DECEASED_USUAL_RESIDENCE',
    label: formMessageDescriptors.placeOfDeathSameAsPrimary
  },
  {
    value: 'OTHER',
    label: formMessageDescriptors.otherInstitution
  }
]

export const typeOfDeathOptions: ISelectOption[] = [
  {
    value: 'MONOGAMY',
    label: formMessageDescriptors.monogamy
  },
  {
    value: 'POLYGAMY',
    label: formMessageDescriptors.polygamy
  }
]

export const causeOfDeathReportedOptions: ISelectOption[] = [
  {
    value: 'PHYSICIAN',
    label: formMessageDescriptors.physician
  },
  {
    value: 'LAY_REPORTED',
    label: formMessageDescriptors.layReported
  },
  {
    value: 'VERBAL_AUTOPSY',
    label: formMessageDescriptors.verbalAutopsy
  },
  {
    value: 'MEDICALLY_CERTIFIED',
    label: formMessageDescriptors.medicallyCertified
  }
]

export const mannerOfDeathOptions: ISelectOption[] = [
  {
    value: 'NATURAL_CAUSES',
    label: formMessageDescriptors.mannerNatural
  },
  {
    value: 'ACCIDENT',
    label: formMessageDescriptors.mannerAccident
  },
  {
    value: 'SUICIDE',
    label: formMessageDescriptors.mannerSuicide
  },
  {
    value: 'HOMICIDE',
    label: formMessageDescriptors.mannerHomicide
  },
  {
    value: 'MANNER_UNDETERMINED',
    label: formMessageDescriptors.mannerUndetermined
  }
]

export const maritalStatusOptions: ISelectOption[] = [
  {
    value: 'SINGLE',
    label: {
      defaultMessage: 'Single',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusSingle'
    }
  },
  {
    value: 'MARRIED',
    label: {
      defaultMessage: 'Married',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusMarried'
    }
  },
  {
    value: 'WIDOWED',
    label: {
      defaultMessage: 'Widowed',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusWidowed'
    }
  },
  {
    value: 'DIVORCED',
    label: {
      defaultMessage: 'Divorced',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusDivorced'
    }
  },
  {
    value: 'SEPARATED',
    label: {
      id: 'form.field.label.maritalStatusSeparated',
      defaultMessage: 'Separated',
      description: 'Option for form field: Marital status'
    }
  },
  {
    value: 'NOT_STATED',
    label: {
      defaultMessage: 'Not stated',
      description: 'Option for form field: Marital status',
      id: 'form.field.label.maritalStatusNotStated'
    }
  }
]

export const typeOfMarriageOptions: ISelectOption[] = [
  {
    value: 'MONOGAMY',
    label: formMessageDescriptors.monogamy
  },
  {
    value: 'POLYGAMY',
    label: formMessageDescriptors.polygamy
  }
]

export const educationalAttainmentOptions: ISelectOption[] = [
  {
    value: 'NO_SCHOOLING',
    label: {
      defaultMessage: 'No schooling',
      description: 'Option for form field: no education',
      id: 'form.field.label.educationAttainmentNone'
    }
  },
  {
    value: 'PRIMARY_ISCED_1',
    label: {
      defaultMessage: 'Primary',
      description: 'Option for form field: ISCED1 education',
      id: 'form.field.label.educationAttainmentISCED1'
    }
  },
  {
    value: 'POST_SECONDARY_ISCED_4',
    label: {
      defaultMessage: 'Secondary',
      description: 'Option for form field: ISCED4 education',
      id: 'form.field.label.educationAttainmentISCED4'
    }
  },
  {
    value: 'FIRST_STAGE_TERTIARY_ISCED_5',
    label: {
      defaultMessage: 'Tertiary',
      description: 'Option for form field: ISCED5 education',
      id: 'form.field.label.educationAttainmentISCED5'
    }
  }
]

export const typeOfBirthOptions: ISelectOption[] = [
  {
    value: 'SINGLE',
    label: formMessageDescriptors.birthTypeSingle
  },
  {
    value: 'TWIN',
    label: formMessageDescriptors.birthTypeTwin
  },
  {
    value: 'TRIPLET',
    label: formMessageDescriptors.birthTypeTriplet
  },
  {
    value: 'QUADRUPLET',
    label: formMessageDescriptors.birthTypeQuadruplet
  },
  {
    value: 'HIGHER_MULTIPLE_DELIVERY',
    label: formMessageDescriptors.birthTypeHigherMultipleDelivery
  }
]

export const attendantAtBirthOptions: ISelectOption[] = [
  {
    value: 'PHYSICIAN',
    label: formMessageDescriptors.physician
  },
  {
    value: 'NURSE',
    label: formMessageDescriptors.attendantAtBirthNurse
  },
  {
    value: 'MIDWIFE',
    label: formMessageDescriptors.attendantAtBirthMidwife
  },
  {
    value: 'OTHER_PARAMEDICAL_PERSONNEL',
    label: formMessageDescriptors.attendantAtBirthOtherParamedicalPersonnel
  },
  {
    value: 'LAYPERSON',
    label: formMessageDescriptors.attendantAtBirthLayperson
  },
  {
    value: 'TRADITIONAL_BIRTH_ATTENDANT',
    label: formMessageDescriptors.attendantAtBirthTraditionalBirthAttendant
  },
  {
    value: 'NONE',
    label: formMessageDescriptors.attendantAtBirthNone
  }
]

export const urbanRuralRadioOptions: IRadioOption[] = [
  {
    label: {
      defaultMessage: 'Urban',
      id: 'form.field.label.urban',
      description: 'Label for form field checkbox option Urban'
    },
    value: 'URBAN'
  },
  {
    label: {
      defaultMessage: 'Rural',
      id: 'form.field.label.rural',
      description: 'Label for form field checkbox option Rural'
    },
    value: 'RURAL'
  }
]

export const yesNoRadioOptions: IRadioOption[] = [
  {
    value: true,
    label: {
      defaultMessage: 'Yes',
      description: 'confirmation label for yes / no radio button',
      id: 'form.field.label.confirm'
    }
  },
  {
    value: false,
    label: {
      defaultMessage: 'No',
      description: 'deny label for yes / no radio button',
      id: 'form.field.label.deny'
    }
  }
]
