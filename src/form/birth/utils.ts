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
import { sentenceCase } from '../address-utils'
import { EventLocationAddressCases, ADMIN_LEVELS } from '../address-settings'
import { Conditional, IntegratingSystemType } from '../types/types'
import { Validator } from '../types/validators'

export const isValidChildBirthDate = [
  {
    operation: 'isValidChildBirthDate'
  }
] satisfies Validator[]

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
] satisfies Validator[]

export const detailsExist = [
  {
    action: 'hide',
    expression: '!values.detailsExist'
  }
]

// if informant is not mother or father
export const informantNotMotherOrFather =
  '((values.informantType==="MOTHER") || (values.informantType==="FATHER") || (!values.informantType))'

export const hideIfInformantMotherOrFather = [
  {
    action: 'hide',
    expression: informantNotMotherOrFather
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
  '(draftData?.father && !draftData?.father.detailsExist) || !values.detailsExist'
export const MOTHER_DETAILS_DONT_EXIST =
  '(draftData?.mother && !draftData?.mother.detailsExist) || !values.detailsExist'

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

// if fathers details do not exist
export const fathersDetailsDontExist = '!values.detailsExist'

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
  defaultConditionals: Conditional[]
) {
  let customConditionals: Conditional[] = []
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
