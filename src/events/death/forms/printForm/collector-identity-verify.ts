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
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  or
} from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

const commonLabel = {
  defaultMessage: '',
  description: 'Title for the data section',
  id: 'event.death.action.certificate.form.section.verifyIdentity.data.label'
}

export const printCertificateCollectorIdentityVerify: FieldConfig[] = [
  // SPOUSE informant — verify against spouse section data
  {
    id: 'collector.identity.verify.data.spouse',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(InformantType.SPOUSE)
      }
    ],
    label: commonLabel,
    configuration: {
      data: [
        { fieldId: 'spouse.brnText' },
        { fieldId: 'spouse.passport' },
        { fieldId: 'spouse.otherId' },
        { fieldId: 'spouse.name' },
        { fieldId: 'spouse.dob' },
        { fieldId: 'spouse.nationality' }
      ]
    }
  },
  // FATHER informant — verify against father section data
  {
    id: 'collector.identity.verify.data.father',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(InformantType.FATHER)
      }
    ],
    label: commonLabel,
    configuration: {
      data: [
        { fieldId: 'father.brnText' },
        { fieldId: 'father.passport' },
        { fieldId: 'father.otherId' },
        { fieldId: 'father.name' },
        { fieldId: 'father.dob' },
        { fieldId: 'father.nationality' }
      ]
    }
  },
  // MOTHER informant — verify against mother section data
  {
    id: 'collector.identity.verify.data.mother',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('collector.requesterId').isEqualTo(InformantType.MOTHER)
      }
    ],
    label: commonLabel,
    configuration: {
      data: [
        { fieldId: 'mother.brnText' },
        { fieldId: 'mother.passport' },
        { fieldId: 'mother.otherId' },
        { fieldId: 'mother.name' },
        { fieldId: 'mother.dob' },
        { fieldId: 'mother.nationality' }
      ]
    }
  },
  // SON / DAUGHTER / OTHER informant — verify against informant section data
  {
    id: 'collector.identity.verify.data.informant',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('collector.requesterId').isEqualTo(InformantType.SON),
          field('collector.requesterId').isEqualTo(InformantType.DAUGHTER),
          field('collector.requesterId').isEqualTo(InformantType.OTHER)
        )
      }
    ],
    label: commonLabel,
    configuration: {
      data: [
        { fieldId: 'informant.brn' },
        { fieldId: 'informant.passport' },
        { fieldId: 'informant.otherId' },
        { fieldId: 'informant.name' },
        { fieldId: 'informant.dob' },
        { fieldId: 'informant.nationality' }
      ]
    }
  }
]
