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
  id: 'event.marriageRegistration.action.certificate.form.section.collector.label'
}

const documentTypeOptions = [
  {
    label: {
      id: 'event.marriageRegistration.action.certificate.form.section.documentType.option.certificate.label',
      defaultMessage: 'Marriage certificate',
      description: 'Marriage certificate document option'
    },
    value: 'MARRIAGE_CERTIFICATE'
  }
]

const collectorOptions = [
  {
    label: {
      id: 'event.marriageRegistration.action.certificate.form.section.collector.option.bridegroom.label',
      defaultMessage: 'Print and issue to bridegroom',
      description: 'Collector option for bridegroom'
    },
    value: 'BRIDEGROOM'
  },
  {
    label: {
      id: 'event.marriageRegistration.action.certificate.form.section.collector.option.bride.label',
      defaultMessage: 'Print and issue to bride',
      description: 'Collector option for bride'
    },
    value: 'BRIDE'
  },
  {
    label: {
      id: 'event.marriageRegistration.action.certificate.form.section.collector.option.couple.label',
      defaultMessage: 'Print and issue to couple',
      description: 'Collector option for both bride and groom'
    },
    value: 'COUPLE'
  },
  {
    label: {
      id: 'event.marriageRegistration.action.certificate.form.section.collector.option.officiant.label',
      defaultMessage: 'Print and issue to marriage officiant',
      description: 'Collector option for marriage officiant'
    },
    value: 'MARRIAGE_OFFICIANT'
  },
  {
    label: {
      id: 'event.marriageRegistration.action.certificate.form.section.collector.option.other.label',
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
