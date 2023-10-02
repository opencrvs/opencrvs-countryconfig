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

import { certificateHandlebars } from '@countryconfig/form/marriage/certificate-handlebars'
import { ISectionMapping } from '@countryconfig/form/types/types'

// You should never need to edit this function.  If there is a bug here raise an issue in [Github](https://github.com/opencrvs/opencrvs-farajaland)
export function getSectionMapping(mappingId: string): ISectionMapping {
  switch (mappingId) {
    case 'registration':
      return {
        template: [
          {
            fieldName: certificateHandlebars.registrationNumber,
            operation: 'registrationNumberTransformer'
          },
          {
            fieldName: certificateHandlebars.qrCode,
            operation: 'QRCodeTransformer'
          },
          {
            fieldName: certificateHandlebars.certificateDate,
            operation: 'certificateDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: certificateHandlebars.registrar,
            operation: 'userTransformer',
            parameters: ['REGISTERED']
          },
          {
            fieldName: certificateHandlebars.registrationAgent,
            operation: 'userTransformer',
            parameters: ['VALIDATED']
          },
          {
            fieldName: certificateHandlebars.registrarName,
            operation: 'registrarNameUserTransformer'
          },
          {
            fieldName: certificateHandlebars.role,
            operation: 'roleUserTransformer'
          },
          {
            fieldName: certificateHandlebars.registrarSignature,
            operation: 'registrarSignatureUserTransformer'
          },
          {
            fieldName: certificateHandlebars.registrationDate,
            operation: 'registrationDateTransformer',
            parameters: ['en', 'dd MMMM yyyy']
          },
          {
            fieldName: certificateHandlebars.registrationLocation,
            operation: 'registrationLocationUserTransformer'
          },
          {
            fieldName: certificateHandlebars.groomSignature,
            operation: 'groomSignatureTransformer'
          },
          {
            fieldName: certificateHandlebars.brideSignature,
            operation: 'brideSignatureTransformer'
          },
          {
            fieldName: certificateHandlebars.witnessOneSignature,
            operation: 'witnessOneSignatureTransformer'
          },
          {
            fieldName: certificateHandlebars.witnessTwoSignature,
            operation: 'witnessTwoSignatureTransformer'
          }
        ],
        mutation: {
          operation: 'setMarriageRegistrationSectionTransformer'
        },
        query: {
          operation: 'getMarriageRegistrationSectionTransformer'
        }
      }
    default:
      throw Error(`Mapping not supported for ${mappingId}`)
  }
}
