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

import { FieldConfig, FieldType } from '@opencrvs/toolkit/events'
import { CollectorType } from './collector-other'

const informantOption = {
  label: {
    id: 'event.death.action.certificate.form.section.requester.informant.label',
    defaultMessage:
      'Print and issue to informant ({informant.name.firstname} {informant.name.surname})',
    description: 'This is the label for the field'
  },
  value: 'INFORMANT'
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

export const printCertificateCollectors: FieldConfig[] = [
  {
    ...commonConfigs,
    options: [informantOption, otherOption]
  }
]
