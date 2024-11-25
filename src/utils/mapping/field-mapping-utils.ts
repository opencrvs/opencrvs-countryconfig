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
  IFormFieldMapping,
  ISectionMapping
} from '@countryconfig/form/types/types'
import { createCustomFieldHandlebarName } from '..'

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getCommonSectionMapping(mappingId: string): ISectionMapping {
  switch (mappingId) {
    case 'informant':
      return {
        mutation: {
          operation: 'setInformantSectionTransformer'
        },
        query: {
          operation: 'getInformantSectionTransformer'
        }
      }
    default:
      throw Error(`Mapping not supported for ${mappingId}`)
  }
}

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getFieldMapping(
  mappingId: string,
  certificateHandlebar: string = ''
): IFormFieldMapping {
  switch (mappingId) {
    case 'documents':
      return {
        mutation: {
          operation: 'eventFieldToAttachmentTransformer'
        },
        query: {
          operation: 'eventAttachmentToFieldTransformer'
        }
      }
    case 'birthType':
    case 'attendantAtBirth':
    case 'typeOfMarriage':
    case 'mannerOfDeath':
    case 'causeOfDeathMethod':
      return {
        mutation: {
          operation: 'sectionFieldToBundleFieldTransformer',
          parameters: []
        },
        query: {
          operation: 'bundleFieldToSectionFieldTransformer',
          parameters: []
        },
        template: {
          fieldName: certificateHandlebar,
          operation: 'selectTransformer'
        }
      }
    case 'causeOfDeathEstablished':
    case 'weightAtBirth':
    case 'deathDescription':
      return {
        mutation: {
          operation: 'sectionFieldToBundleFieldTransformer',
          parameters: []
        },
        query: {
          operation: 'bundleFieldToSectionFieldTransformer',
          parameters: []
        },
        template: {
          fieldName: certificateHandlebar,
          operation: 'plainInputTransformer'
        }
      }
    case 'educationalAttainment':
    case 'maritalStatus':
    case 'gender':
      return {
        template: {
          fieldName: certificateHandlebar,
          operation: 'selectTransformer'
        }
      }
    case 'occupation':
    case 'multipleBirth':
    case 'reasonNotApplying':
      return {
        template: {
          fieldName: certificateHandlebar,
          operation: 'plainInputTransformer'
        }
      }
    case 'detailsExist':
      return {
        query: {
          operation: 'booleanTransformer'
        }
      }
    case 'exactDateOfBirthUnknown':
      return {
        query: {
          operation: 'booleanTransformer'
        },
        mutation: {
          operation: 'ignoreFieldTransformer'
        }
      }
    case 'ageOfIndividualInYears':
      return {
        template: {
          operation: 'plainInputTransformer',
          fieldName: certificateHandlebar
        }
      }
    case 'informantType':
      return {
        mutation: {
          operation: 'fieldValueSectionExchangeTransformer',
          parameters: ['registration', mappingId]
        },
        query: {
          operation: 'fieldValueSectionExchangeTransformer',
          parameters: ['registration', mappingId]
        },
        template: {
          fieldName: certificateHandlebar,
          operation: 'fieldValueTransformer',
          parameters: ['relationship']
        }
      }
    case 'otherInformantType':
      return {
        template: {
          fieldName: certificateHandlebar,
          operation: 'fieldValueTransformer',
          parameters: ['otherRelationship']
        },
        mutation: {
          operation: 'fieldValueSectionExchangeTransformer',
          parameters: ['registration', 'otherInformantType']
        },
        query: {
          operation: 'fieldValueSectionExchangeTransformer',
          parameters: ['registration', 'otherInformantType']
        }
      }
    case 'nationalId':
      return {
        template: {
          fieldName: certificateHandlebar,
          operation: 'identityToFieldTransformer',
          parameters: ['id', 'NATIONAL_ID']
        },
        mutation: {
          operation: 'fieldToIdentityTransformer',
          parameters: ['id', 'NATIONAL_ID']
        },
        query: {
          operation: 'identityToFieldTransformer',
          parameters: ['id', 'NATIONAL_ID']
        }
      }
    case 'registrationEmail':
      return {
        mutation: {
          operation: 'sectionFieldToBundleFieldTransformer',
          parameters: ['registration.contactEmail']
        },
        query: {
          operation: 'fieldValueSectionExchangeTransformer',
          parameters: ['registration', 'contactEmail']
        },
        template: {
          fieldName: certificateHandlebar,
          operation: 'plainInputTransformer'
        }
      }
    case 'registrationPhone':
      return {
        mutation: {
          operation: 'sectionFieldToBundleFieldTransformer',
          parameters: [
            'registration.contactPhoneNumber',
            {
              operation: 'msisdnTransformer',
              parameters: ['registration.contactPhoneNumber']
            }
          ]
        },
        query: {
          operation: 'fieldValueSectionExchangeTransformer',
          parameters: [
            'registration',
            'contactPhoneNumber',
            {
              operation: 'localPhoneTransformer',
              parameters: ['registration.contactPhoneNumber']
            }
          ]
        },
        template: {
          fieldName: certificateHandlebar,
          operation: 'selectTransformer'
        }
      }
    case 'birthDate':
      return {
        template: {
          operation: 'dateFormatTransformer',
          fieldName: certificateHandlebar,
          parameters: ['birthDate', 'en', 'do MMMM yyyy']
        },
        mutation: {
          operation: 'longDateTransformer',
          parameters: ['birthDate']
        },
        query: {
          operation: 'fieldValueTransformer',
          parameters: ['birthDate']
        }
      }
    case 'deathDate':
      return {
        template: {
          operation: 'deceasedDateFormatTransformation',
          fieldName: certificateHandlebar,
          parameters: ['en', 'do MMMM yyyy', 'deceased']
        },
        mutation: {
          operation: 'fieldToDeceasedDateTransformation',
          parameters: [
            'deceased',
            {
              operation: 'longDateTransformer',
              parameters: []
            }
          ]
        },
        query: {
          operation: 'deceasedDateToFieldTransformation',
          parameters: ['deceased']
        }
      }
    case 'marriageDate':
      return {
        template: {
          operation: 'marriageDateFormatTransformation',
          fieldName: certificateHandlebar,
          parameters: ['en', 'do MMMM yyyy', ['bride', 'groom']]
        },
        mutation: {
          operation: 'fieldToMarriageDateTransformation',
          parameters: [
            ['bride', 'groom'],
            {
              operation: 'longDateTransformer',
              parameters: []
            }
          ]
        },
        query: {
          operation: 'marriageDateToFieldTransformation',
          parameters: [['bride', 'groom']]
        }
      }
    case 'familyName':
    case 'firstNames':
    case 'marriedLastName':
      return {
        template: {
          fieldName: certificateHandlebar,
          operation: 'nameToFieldTransformer',
          parameters: ['en', mappingId]
        },
        mutation: {
          operation: 'fieldToNameTransformer',
          parameters: ['en', mappingId]
        },
        query: {
          operation: 'nameToFieldTransformer',
          parameters: ['en', mappingId]
        }
      }
    case 'nationality':
      return {
        template: {
          fieldName: certificateHandlebar,
          operation: 'nationalityTransformer'
        },
        mutation: {
          operation: 'fieldToArrayTransformer'
        },
        query: {
          operation: 'arrayToFieldTransformer'
        }
      }
    case 'nationalIdVerification':
      return {
        mutation: {
          operation: 'nidVerificationFieldToIdentityTransformer'
        },
        query: {
          operation: 'identityToNidVerificationFieldTransformer'
        }
      }
    default:
      throw Error(`Mapping not supported for ${mappingId}`)
  }
}

export function getCustomFieldMapping(fieldId: string): IFormFieldMapping {
  const customFieldCertificateHandlebar =
    createCustomFieldHandlebarName(fieldId)

  return {
    mutation: {
      operation: 'customFieldToQuestionnaireTransformer'
    },
    query: {
      operation: 'questionnaireToCustomFieldTransformer'
    },
    template: {
      fieldName: customFieldCertificateHandlebar,
      operation: 'questionnaireToTemplateFieldTransformer'
    }
  }
}
