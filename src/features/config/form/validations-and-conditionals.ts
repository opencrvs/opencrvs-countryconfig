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

// TODO: add in all the validations and conditionals logic and generate a js file client can load

import { MessageDescriptor } from 'react-intl'
import { IFormData, IFormFieldValue, IntegratingSystemType } from './types'
import { sentenceCase } from './address-utils'
import { ADMIN_LEVELS, EventLocationAddressCases } from './addresses'

export interface IConditional {
  description?: string
  action: string
  expression: string
}

export interface IConditionals {
  informantType: IConditional
  iDType: IConditional
  isOfficePreSelected: IConditional
  fathersDetailsExist: IConditional
  primaryAddressSameAsOtherPrimary: IConditional
  countryPrimary: IConditional
  statePrimary: IConditional
  districtPrimary: IConditional
  addressLine4Primary: IConditional
  addressLine3Primary: IConditional
  country: IConditional
  state: IConditional
  district: IConditional
  addressLine4: IConditional
  addressLine3: IConditional
  uploadDocForWhom: IConditional
  motherCollectsCertificate: IConditional
  fatherCollectsCertificate: IConditional
  informantCollectsCertificate: IConditional
  otherPersonCollectsCertificate: IConditional
  birthCertificateCollectorNotVerified: IConditional
  deathCertificateCollectorNotVerified: IConditional
  placeOfBirthHospital: IConditional
  placeOfDeathTypeHeathInstitue: IConditional
  otherBirthEventLocation: IConditional
  isNotCityLocation: IConditional
  isCityLocation: IConditional
  isDefaultCountry: IConditional
  isNotCityLocationPrimary: IConditional
  isDefaultCountryPrimary: IConditional
  isCityLocationPrimary: IConditional
  informantPrimaryAddressSameAsCurrent: IConditional
  iDAvailable: IConditional
  deathPlaceOther: IConditional
  deathPlaceAtPrivateHome: IConditional
  deathPlaceAtOtherLocation: IConditional
  causeOfDeathEstablished: IConditional
  isMarried: IConditional
  identifierIDSelected: IConditional
  fatherContactDetailsRequired: IConditional
  withInTargetDays: IConditional
  between46daysTo5yrs: IConditional
  after5yrs: IConditional
  deceasedNationIdSelected: IConditional
  isRegistrarRoleSelected: IConditional
  certCollectorOther: IConditional
  userAuditReasonSpecified: IConditional
  userAuditReasonOther: IConditional
  isAuditActionDeactivate: IConditional
  isAuditActionReactivate: IConditional
}
export interface IValidationResult {
  message: MessageDescriptor
  props?: { [key: string]: any }
}

export type RangeValidation = (
  min: number,
  max: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type MaxLengthValidation = (
  customisation: number
) => (value: IFormFieldValue) => IValidationResult | undefined

export type Validation = (
  value: IFormFieldValue,
  drafts?: IFormData,
  offlineCountryConfig?: any
) => IValidationResult | undefined

export type ValidationInitializer = (...value: any[]) => Validation

export const isValidChildBirthDate = [
  {
    operation: 'isValidChildBirthDate'
  }
]

export const hideIfNidIntegrationDisabled = [
  {
    action: 'hide',
    expression: `const nationalIdSystem =
    offlineCountryConfig &&
    offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
    !nationalIdSystem ||
    !nationalIdSystem.settings.openIdProviderBaseUrl ||
    !nationalIdSystem.settings.openIdProviderClientId ||
    !nationalIdSystem.settings.openIdProviderClaims;
  `
  }
]

export const motherNationalIDVerfication = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `values.motherNidVerification`
  }
]

export const fatherNationalIDVerfication = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `values.fatherNidVerification`
  }
]

export const mothersBirthDateConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: 'values.exactDateOfBirthUnknown'
  },
  {
    action: 'disable',
    expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('motherBirthDate')`
  }
]

export const parentsBirthDateValidators = [
  {
    operation: 'dateFormatIsCorrect',
    parameters: []
  },
  {
    operation: 'dateInPast',
    parameters: []
  },
  {
    operation: 'isValidParentsBirthDate',
    parameters: [5]
  }
]

export function getNationalIDValidators(configCase: string) {
  if (configCase === 'informant') {
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['deceased.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['mother.iD']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['father.iD']
      }
    ]
  } else {
    // mother
    return [
      {
        operation: 'validIDNumber',
        parameters: ['NATIONAL_ID']
      },
      {
        operation: 'duplicateIDNumber',
        parameters: ['father.iD']
      }
    ]
  }
}

export const hideIfNidIntegrationEnabled = [
  {
    action: 'hide',
    expression: `const nationalIdSystem =
          offlineCountryConfig &&
          offlineCountryConfig.systems.find(s => s.integratingSystemType === '${IntegratingSystemType.Mosip}');
          nationalIdSystem &&
          nationalIdSystem.settings.openIdProviderBaseUrl &&
          nationalIdSystem.settings.openIdProhideIfNidIntegrationDisabledviderClientId &&
          nationalIdSystem.settings.openIdProviderClaims;
      `
  }
]

export const detailsExist = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  }
]

export const hideIfInformantMotherOrFather = [
  {
    action: 'hide',
    expression:
      '((values.informantType==="MOTHER") || (values.informantType==="FATHER"))'
  }
]

export const exactDateOfBirthUnknownConditional = [
  {
    action: 'hide',
    expression: '!values.exactDateOfBirthUnknown'
  }
]

export const mothersDetailsExistConditionals = [
  {
    action: 'hide',
    expression: 'draftData?.informant?.informantType==="MOTHER"'
  },
  {
    action: 'hideInPreview',
    expression: 'values.detailsExist'
  }
]

export const FATHER_DETAILS_DONT_EXIST =
  '!draftData?.father.detailsExist || !values.detailsExist'
export const MOTHER_DETAILS_DONT_EXIST =
  '!draftData?.mother.detailsExist || !values.detailsExist'

export const fathersDetailsExistConditionals = [
  {
    action: 'hide',
    expression: 'draftData?.informant?.informantType==="FATHER"'
  },
  {
    action: 'hideInPreview',
    expression: 'values.detailsExist'
  }
]

export const informantBirthDateConditionals = [
  {
    action: 'disable',
    expression: 'values.exactDateOfBirthUnknown'
  },
  {
    action: 'disable',
    expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('informantBirthDate')`
  }
]

export const informantFirstNameConditionals = [
  {
    action: 'disable',
    expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
  },
  {
    action: 'hide',
    expression: '!values.detailsExist'
  }
]

export const informantFamilyNameConditionals = [
  {
    action: 'disable',
    expression: `draftData?.informant?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
  }
]
export const fathersBirthDateConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: 'values.exactDateOfBirthUnknown'
  },
  {
    action: 'disable',
    expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('fatherBirthDate')`
  }
]
export const motherFirstNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
  }
]

export const motherFamilyNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.mother?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
  }
]
export const fatherFirstNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('firstNamesEng')`
  }
]

export const fatherFamilyNameConditionals = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  },
  {
    action: 'disable',
    expression: `draftData?.father?.fieldsModifiedByNidUserInfo?.includes('familyNameEng')`
  }
]

// if mothers details do not exist on other page
export const mothersDetailsDontExistOnOtherPage =
  'draftData && draftData.mother && !draftData.mother.detailsExist'

// if mothers details do not exist
export const mothersDetailsDontExist = '!values.detailsExist'

// if fathers details do not exist
export const fathersDetailsDontExist = '!values.detailsExist'

// if informant is not mother or father
export const informantNotMotherOrFather =
  '((values.informantType==="MOTHER") || (values.informantType==="FATHER"))'

// primary address same as other primary
export const primaryAddressSameAsOtherPrimaryAddress =
  'values.primaryAddressSameAsOtherPrimary'

// secondary addresses are not enabled
export const secondaryAddressesDisabled = 'window.config.ADDRESSES!=2'

export function getPlaceOfEventConditionals(
  location: string,
  configCase: EventLocationAddressCases
) {
  switch (location) {
    case 'state':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: '!values.country'
        },
        {
          action: 'hide',
          expression: '!values.state'
        },
        {
          action: 'hide',
          expression: '!values.district'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel3'
        },
        {
          action: 'hide',
          expression: '!values.locationLevel4'
        },
        {
          action: 'hide',
          expression:
            configCase !== EventLocationAddressCases.PLACE_OF_MARRIAGE
              ? `(values.${configCase}!="OTHER" && values.${configCase}!="PRIVATE_HOME")`
              : ''
        },
        {
          action: 'hide',
          expression: '!isDefaultCountry(values.country)'
        }
      ]
    default:
      throw Error(
        'Supplied event location is unsupported by current conditionals'
      )
  }
}

export function getRuralOrUrbanConditionals(
  useCase: string,
  defaultConditionals: IConditional[]
) {
  let customConditionals: IConditional[] = []
  switch (ADMIN_LEVELS) {
    case 1:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        }
      ]
      break
    case 2:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        }
      ]
      break
    case 3:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        }
      ]
      break
    case 4:
      customConditionals = [
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel4${sentenceCase(useCase)}`
        }
      ]
      break
  }
  return defaultConditionals.concat(customConditionals)
}

export function getAddressConditionals(location: string, useCase: string) {
  switch (location) {
    case 'state':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'district':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel3':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel4':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    case 'locationLevel5':
      return [
        {
          action: 'hide',
          expression: `!values.country${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.state${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.district${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel3${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!values.locationLevel4${sentenceCase(useCase)}`
        },
        {
          action: 'hide',
          expression: `!isDefaultCountry(values.country${sentenceCase(
            useCase
          )})`
        }
      ]
    default:
      throw Error('Supplied location is unsupported by current conditionals')
  }
}
