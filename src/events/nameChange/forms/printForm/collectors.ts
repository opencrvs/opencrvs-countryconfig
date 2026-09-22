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
  not,
  or
} from '@opencrvs/toolkit/events'
import { InformantType, InformantTypeKey } from '../pages/informant'
import { informantMessageDescriptors } from '@countryconfig/events/utils'

// Helper to create option with conditional for informant type
const createInformantOption = (informantType: InformantTypeKey) => {
  let defaultMessage = 'Print and issue to Informant'

  if (
    informantType === InformantType.OTHER ||
    informantType === InformantType.SELF
  ) {
    defaultMessage = 'Print and issue to Informant'
  } else if (
    informantMessageDescriptors[
      informantType as keyof typeof informantMessageDescriptors
    ]
  ) {
    defaultMessage = `Print and issue to Informant (${informantMessageDescriptors[informantType as keyof typeof informantMessageDescriptors].defaultMessage})`
  }

  return {
    label: {
      id: `v2.event.birth.action.certificate.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(informantType)
      }
    ]
  }
}

// Father option - shown when father exists
const fatherOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.father.label',
    defaultMessage: 'Print and issue to Father',
    description: 'This is the label for the field'
  },
  value: InformantType.FATHER,
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(field('father.name').isFalsy())
    }
  ]
}

// Mother option - shown when mother exists
const motherOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.mother.label',
    defaultMessage: 'Print and issue to Mother',
    description: 'This is the label for the field'
  },
  value: InformantType.MOTHER,
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(field('mother.name').isFalsy())
    }
  ]
}

// Other option - always shown
const otherOption = {
  label: {
    id: 'event.birth.action.certificate.form.section.requester.other.label',
    defaultMessage: 'Print and issue to someone else',
    description: 'This is the label for the field'
  },
  value: 'SOMEONE_ELSE'
}

const requesterLabel = {
  defaultMessage: 'Requester',
  description: 'This is the label for the field',
  id: 'event.birth.action.certificate.form.section.requester.label'
}

// All options with option-level conditionals
const collectorOptions = [
  createInformantOption(InformantType.MOTHER),
  createInformantOption(InformantType.FATHER),
  createInformantOption(InformantType.OTHER),
  createInformantOption(InformantType.LEGAL_GUARDIAN),
  fatherOption,
  motherOption,
  otherOption
]

export const printCertificateCollectors: FieldConfig[] = [
  // Single collector.requesterId field with option-level conditionals
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: requesterLabel,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('informant.relation').isEqualTo(InformantType.MOTHER),
          field('informant.relation').isEqualTo(InformantType.FATHER),
          field('informant.relation').isEqualTo(InformantType.OTHER),
          field('informant.relation').isEqualTo(InformantType.LEGAL_GUARDIAN)
        )
      }
    ],
    options: collectorOptions
  }
]
