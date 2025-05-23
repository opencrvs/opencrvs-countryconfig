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

import { AdvancedSearchConfig, event, field } from '@opencrvs/toolkit/events'
import format from 'date-fns/format'
import subDays from 'date-fns/subDays'

const statusOptions = [
  {
    value: 'ALL',
    label: {
      defaultMessage: 'Any status',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusAny'
    }
  },
  {
    value: 'IN_PROGRESS',
    label: {
      defaultMessage: 'In progress',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusInprogress'
    }
  },
  {
    value: 'IN_REVIEW',
    label: {
      defaultMessage: 'In review',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusInReview'
    }
  },
  {
    value: 'REJECTED',
    label: {
      defaultMessage: 'Requires updates',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusRequireUpdate'
    }
  },
  {
    value: 'REGISTERED',
    label: {
      defaultMessage: 'Registered',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusRegistered'
    }
  },
  {
    value: 'CERTIFIED',
    label: {
      defaultMessage: 'Certified',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusCertified'
    }
  },
  {
    value: 'ARCHIVED',
    label: {
      defaultMessage: 'Archived',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusAchived'
    }
  },
  {
    value: 'CORRECTION_REQUESTED',
    label: {
      defaultMessage: 'Correction requested',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusCorrectionRequested'
    }
  },
  {
    value: 'VALIDATED',
    label: {
      defaultMessage: 'Validated',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusValidated'
    }
  },
  {
    value: 'CREATED',
    label: {
      defaultMessage: 'Draft',
      description: 'Option for form field: status of record',
      id: 'v2.advancedSearch.form.recordStatusCreated'
    }
  }
]

const timePeriodOptions = [
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
    value: `${format(subDays(new Date(), 30), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  },
  {
    label: {
      defaultMessage: 'Last 90 days',
      description: 'Label for option of time period select: last 90 days',
      id: 'form.section.label.timePeriodLast90Days'
    },
    value: `${format(subDays(new Date(), 90), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  },
  {
    label: {
      defaultMessage: 'Last year',
      description: 'Label for option of time period select: last year',
      id: 'form.section.label.timePeriodLastYear'
    },
    value: `${format(subDays(new Date(), 365), 'yyyy-MM-dd')},${format(new Date(), 'yyyy-MM-dd')}`
  }
]
export const advancedSearchBirth = [
  {
    title: {
      defaultMessage: 'Registration details',
      description: 'The title of Registration details accordion',
      id: 'v2.advancedSearch.form.registrationDetails'
    },
    fields: [
      event('legalStatus.REGISTERED.createdAtLocation').exact(),
      event('legalStatus.REGISTERED.createdAt').range(),
      event('status', statusOptions).exact(),
      event('updatedAt', timePeriodOptions).range()
    ]
  },
  {
    title: {
      defaultMessage: 'Child details',
      description: 'The title of Child details accordion',
      id: 'v2.advancedSearch.form.childDetails'
    },
    fields: [
      field('child.dob').range(),
      field('child.firstname').fuzzy(),
      field('child.surname').fuzzy(),
      field('child.gender').exact()
    ]
  },
  {
    title: {
      defaultMessage: 'Event details',
      description: 'The title of Event details accordion',
      id: 'v2.advancedSearch.form.eventDetails'
    },
    fields: [field('child.birthLocation', { conditionals: [] }).exact()]
  },
  {
    title: {
      defaultMessage: 'Mother details',
      description: 'The title of Mother details accordion',
      id: 'v2.advancedSearch.form.motherDetails'
    },
    fields: [
      field('mother.dob').range(),
      field('mother.firstname').fuzzy(),
      field('mother.surname').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Father details',
      description: 'The title of Father details accordion',
      id: 'v2.advancedSearch.form.fatherDetails'
    },
    fields: [
      field('father.dob').range(),
      field('father.firstname').fuzzy(),
      field('father.surname').fuzzy()
    ]
  },
  {
    title: {
      defaultMessage: 'Informant details',
      description: 'The title of Informant details accordion',
      id: 'v2.advancedSearch.form.informantDetails'
    },
    fields: [
      field('informant.dob', { conditionals: [] }).range(),
      field('informant.firstname', { conditionals: [] }).fuzzy(),
      field('informant.surname', { conditionals: [] }).fuzzy()
    ]
  }
] satisfies AdvancedSearchConfig[]
