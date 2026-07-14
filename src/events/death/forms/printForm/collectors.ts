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

import { ConditionalType, field, FieldConfig, FieldType } from '@opencrvs/toolkit/events'
import { CollectorType } from './collector-other'
import { InformantType, InformantTypeKey } from '../pages/informant'

const deathInformantLabels: Record<InformantTypeKey, string> = {
  SPOUSE: 'Spouse',
  SON: 'Son',
  DAUGHTER: 'Daughter',
  FATHER: 'Father',
  MOTHER: 'Mother',
  OTHER: 'Other'
}

const getInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.OTHER
      ? 'Print and issue to Informant'
      : `Print and issue to Informant`

  return {
    label: {
      id: `event.death.action.certificate.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: InformantType[informantType]
  }
}

const otherOption = {
  label: {
    id: 'event.death.action.certificate.form.section.requester.other.label',
    defaultMessage: 'Print and issue to someone else',
    description: 'This is the label for the field'
  },
  value: CollectorType.SOMEONE_ELSE
}

const requesterLabel = {
  defaultMessage: 'Requester',
  description: 'This is the label for the field',
  id: 'event.death.action.certificate.form.section.requester.label'
}

const commonConfigs = {
  id: 'collector.requesterId',
  type: FieldType.SELECT,
  required: true,
  label: requesterLabel
}

// Single SELECT with per-option conditionals — each informant option is shown only when
// informant.relation matches. Avoids duplicate field IDs across multiple FieldConfig entries.
export const printCertificateCollectors: FieldConfig[] = [
  {
    ...commonConfigs,
    options: [
      ...(Object.keys(InformantType) as InformantTypeKey[]).map((informantType) => ({
        ...getInformantOption(informantType),
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('informant.relation').isEqualTo(InformantType[informantType])
          }
        ]
      })),
      otherOption
    ]
  }
]
