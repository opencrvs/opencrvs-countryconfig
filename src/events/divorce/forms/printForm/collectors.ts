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

/**
 * Marriage certificate print configuration
 * Document type and collector dropdowns
 */

const collectorLabel = {
  defaultMessage: 'Collector',
  description: 'Label for the collector selection field',
  id: 'event.divorce.action.certificate.form.section.collector.label'
}

const collectorOptions = [
  {
    label: {
      id: 'event.divorce.action.certificate.form.section.collector.option.husband.label',
      defaultMessage: 'Print and issue to husband',
      description: 'Collector option for husband'
    },
    value: 'HUSBAND'
  },
  {
    label: {
      id: 'event.divorce.action.certificate.form.section.collector.option.wife.label',
      defaultMessage: 'Print and issue to wife',
      description: 'Collector option for wife'
    },
    value: 'WIFE'
  },
  {
    label: {
      id: 'event.divorce.action.certificate.form.section.collector.option.other.label',
      defaultMessage: 'Print and issue to someone else',
      description: 'Collector option for other person'
    },
    value: 'SOMEONE_ELSE'
  }
]

export const printCertificateCollectors: FieldConfig[] = [
  {
    id: 'collector.requesterId',
    type: FieldType.SELECT,
    required: true,
    label: collectorLabel,
    options: collectorOptions
  }
]
