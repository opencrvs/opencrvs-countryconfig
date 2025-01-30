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
  ESIGNET_TOKEN_URL,
  OPENID_PROVIDER_CLIENT_ID,
  OPENID_PROVIDER_CLAIMS,
  MOSIP_API_USERINFO_URL
} from '@countryconfig/constants'
import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'
import {
  idReader,
  qr,
  esignet,
  esignetCallback,
  idVerificationFields
} from '@opencrvs/mosip'
import { and, objectHasProperty } from '@opencrvs/toolkit/conditionals'
import { Conditional, SerializedFormField } from '../types/types'

export const iDReaderFields = (
  event: 'birth' | 'death',
  section: 'informant' | 'mother' | 'father',
  conditionals: Conditional[] = []
) => {
  const verifiedFieldId = `${event}.${section}.${section}-view-group.verified`
  return [
    idReader(
      event,
      section,
      conditionals.concat({
        action: 'hide',
        expression: '!!$form?.verified'
      }),
      [
        qr({
          validation: {
            rule: and(
              objectHasProperty('firstName', 'string'),
              objectHasProperty('familyName', 'string'),
              objectHasProperty('gender', 'string'),
              objectHasProperty('birthDate', 'string'),
              objectHasProperty('nid', 'string')
            ),
            errorMessage: {
              defaultMessage:
                'This QR code is not recognised. Please try again.',
              description: 'Error message for QR code validation',
              id: 'form.field.qr.validation.error'
            }
          }
        }),
        esignet(
          ESIGNET_TOKEN_URL,
          OPENID_PROVIDER_CLIENT_ID,
          OPENID_PROVIDER_CLAIMS,
          'esignet',
          'esignetCallback'
        )
      ]
    ) as SerializedFormField,
    esignetCallback({
      fieldName: 'esignetCallback',
      mosipAPIUserInfoUrl: MOSIP_API_USERINFO_URL,
      openIdProviderClientId: OPENID_PROVIDER_CLIENT_ID
    }) as SerializedFormField,
    ...(idVerificationFields(
      event,
      section,
      getCustomFieldMapping(verifiedFieldId)
    ) as SerializedFormField[])
  ]
}
