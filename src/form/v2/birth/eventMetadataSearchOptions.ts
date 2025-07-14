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

import { EventStatus } from '@opencrvs/toolkit/events'
import { format, subDays, subMonths, subQuarters, subYears } from 'date-fns'

export const statusOptions = [
  {
    value: 'ALL',
    label: {
      defaultMessage: 'Any status',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusAny'
    }
  },
  {
    value: EventStatus.enum.NOTIFIED,
    label: {
      defaultMessage: 'Notified',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusNotified'
    }
  },
  {
    value: EventStatus.enum.DECLARED,
    label: {
      defaultMessage: 'Declared',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusDeclared'
    }
  },
  {
    value: EventStatus.enum.VALIDATED,
    label: {
      defaultMessage: 'Validated',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusValidated'
    }
  },
  {
    value: EventStatus.enum.REGISTERED,
    label: {
      defaultMessage: 'Registered',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusRegistered'
    }
  },
  {
    value: EventStatus.enum.CERTIFIED,
    label: {
      defaultMessage: 'Certified',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusCertified'
    }
  },
  {
    value: EventStatus.enum.REJECTED,
    label: {
      defaultMessage: 'Rejected',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusRejected'
    }
  },
  {
    value: EventStatus.enum.ARCHIVED,
    label: {
      defaultMessage: 'Archived',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusArchived'
    }
  }
]

export const timePeriodOptions = [
  {
    label: {
      defaultMessage: 'Last 7 days',
      description: 'Label for option of time period select: last 7 days',
      id: 'form.section.label.timePeriodLast7Days'
    },
    value: `${format(subDays(new Date(), 7), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  },
  {
    label: {
      defaultMessage: 'Last 30 days',
      description: 'Label for option of time period select: last 30 days',
      id: 'form.section.label.timePeriodLast30Days'
    },
    value: `${format(subMonths(new Date(), 1), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  },
  {
    label: {
      defaultMessage: 'Last 90 days',
      description: 'Label for option of time period select: last 90 days',
      id: 'form.section.label.timePeriodLast90Days'
    },
    value: `${format(subQuarters(new Date(), 1), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  },
  {
    label: {
      defaultMessage: 'Last year',
      description: 'Label for option of time period select: last year',
      id: 'form.section.label.timePeriodLastYear'
    },
    value: `${format(subYears(new Date(), 1), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  }
]
