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
  FieldType
} from '@opencrvs/toolkit/events'
import { InformantType, InformantTypeKey } from '../pages/informant'
import { informantMessageDescriptors } from '@countryconfig/form/common/messages'

const getInformantOption = (informantType: InformantTypeKey) => {
  return {
    label: {
      id: `v2.event.birth.action.certificate.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage: `Print and issue to Informant (${informantMessageDescriptors[informantType].defaultMessage})`,
      description: 'This is the label for the field'
    },
    value: informantType
  }
}
const fatherOption = {
  label: {
    id: 'v2.event.birth.action.certificate.form.section.requester.father.label',
    defaultMessage: 'Print and issue to father',
    description: 'This is the label for the field'
  },
  value: InformantType.FATHER
}

const motherOption = {
  label: {
    id: 'v2.event.birth.action.certificate.form.section.requester.mother.label',
    defaultMessage: 'Print and issue to mother',
    description: 'This is the label for the field'
  },
  value: InformantType.MOTHER
}
const otherOption = {
  label: {
    id: 'v2.event.birth.action.certificate.form.section.requester.other.label',
    defaultMessage: 'Print and issue to someone else',
    description: 'This is the label for the field'
  },
  value: InformantType.OTHER
}

export const printCertificateCollectors: FieldConfig[] = [
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(InformantType.MOTHER)
      }
    ],
    options: [
      getInformantOption(InformantType.MOTHER),
      fatherOption,
      otherOption
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(InformantType.FATHER)
      }
    ],
    options: [
      getInformantOption(InformantType.FATHER),
      motherOption,
      otherOption
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.BROTHER
        )
      }
    ],
    options: [
      getInformantOption(InformantType.BROTHER),
      fatherOption,
      motherOption,
      otherOption
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.GRANDFATHER
        )
      }
    ],
    options: [
      getInformantOption(InformantType.GRANDFATHER),
      fatherOption,
      motherOption,
      otherOption
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.GRANDMOTHER
        )
      }
    ],
    options: [
      getInformantOption(InformantType.GRANDMOTHER),
      fatherOption,
      motherOption,
      otherOption
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(InformantType.SISTER)
      }
    ],
    options: [
      getInformantOption(InformantType.SISTER),
      fatherOption,
      motherOption,
      otherOption
    ]
  },
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'v2.event.birth.action.certificate.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(
          InformantType.LEGAL_GUARDIAN
        )
      }
    ],
    options: [
      getInformantOption(InformantType.LEGAL_GUARDIAN),
      fatherOption,
      motherOption,
      otherOption
    ]
  }
]
