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
  and,
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  not,
  or
} from '@opencrvs/toolkit/events'
import { InformantType } from '../pages/informant'

export const printCertificateCollectorIdentityVerify: FieldConfig[] = [
  {
    id: 'collector.identity.verify.data.mother',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('collector.requesterId').isEqualTo(InformantType.MOTHER),
          and(
            field('collector.requesterId').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo(InformantType.MOTHER)
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'v2.event.birth.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'mother.idType' },
        { fieldId: 'mother.nid' },
        { fieldId: 'mother.passport' },
        { fieldId: 'mother.brn' },
        { fieldId: 'mother.firstname' },
        { fieldId: 'mother.surname' },
        { fieldId: 'mother.dob' },
        { fieldId: 'mother.age' },
        { fieldId: 'mother.nationality' }
      ]
    }
  },
  {
    id: 'collector.identity.verify.data.father',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('collector.requesterId').isEqualTo(InformantType.FATHER),
          and(
            field('collector.requesterId').isEqualTo('INFORMANT'),
            field('informant.relation').isEqualTo(InformantType.FATHER)
          )
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'v2.event.birth.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'father.idType' },
        { fieldId: 'father.nid' },
        { fieldId: 'father.passport' },
        { fieldId: 'father.brn' },
        { fieldId: 'father.firstname' },
        { fieldId: 'father.surname' },
        { fieldId: 'father.dob' },
        { fieldId: 'father.age' },
        { fieldId: 'father.nationality' }
      ]
    }
  },
  {
    id: 'collector.identity.verify.data.other',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('collector.requesterId').isEqualTo('INFORMANT'),
          not(field('informant.relation').isEqualTo(InformantType.FATHER)),
          not(field('informant.relation').isEqualTo(InformantType.MOTHER))
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'v2.event.birth.action.certificate.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'informant.relation' },
        { fieldId: 'informant.idType' },
        { fieldId: 'informant.nid' },
        { fieldId: 'informant.passport' },
        { fieldId: 'informant.brn' },
        { fieldId: 'informant.firstname' },
        { fieldId: 'informant.surname' },
        { fieldId: 'informant.dob' },
        { fieldId: 'informant.age' },
        { fieldId: 'informant.nationality' }
      ]
    }
  }
]
