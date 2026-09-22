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
import { defineConfig, ActionType, field, ConditionalType, and, status, not, flag, InherentFlags } from '@opencrvs/toolkit/events'
import { Event } from '@countryconfig/events/utils'
import {
  DIVORCE_DECLARATION_FORM,
  DIVORCE_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchDivorce } from './advancedSearch'
import { dedupConfig } from './dedupConfig'
import { DIVORCE_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { CORRECTION_FORM } from './forms/correctionForm'

export const divorceEvent = defineConfig({
  id: Event.Divorce,
  declaration: DIVORCE_DECLARATION_FORM,
  label: {
    defaultMessage: 'Divorce',
    description: 'This is what this event is referred as in the system',
    id: 'event.divorce.label'
  },
  title: {
    defaultMessage:
      '{marriageDetails.bridegroomGivenNames.firstname, select, __EMPTY__ {Divorce declaration} other {{marriageDetails.brideName.firstname, select, __EMPTY__ {Divorce declaration for {marriageDetails.bridegroomGivenNames.surname}} other {{marriageDetails.bridegroomGivenNames.surname} and {marriageDetails.brideName.surname}}}}}',
    description: 'This is the title of the summary',
    id: 'event.divorce.title'
  },
  fallbackTitle: {
    id: 'event.divorce.fallbackTitle',
    defaultMessage: 'No names provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      // Marriage Registration Number
      {
        fieldId: 'marriageDetails.marriageRegistrationNumber',
        label: {
          defaultMessage: 'Marriage registration number',
          description: 'Marriage registration number',
          id: 'event.divorce.summary.marriageDetails.marriageRegistrationNumber.label'
        }
      },
      // Date of Marriage
      {
        fieldId: 'marriageDetails.dateOfMarriage',
        label: {
          defaultMessage: 'Date of marriage',
          description: 'Date on which the marriage took place',
          id: 'event.divorce.summary.marriageDetails.dateOfMarriage.label'
        }
      },
      // Place of Marriage
      {
        fieldId: 'marriageDetails.placeOfMarriage',
        label: {
          defaultMessage: 'Place of marriage',
          description: 'Location where the marriage occurred',
          id: 'event.divorce.summary.marriageDetails.placeOfMarriage.label'
        },
        emptyValueMessage: {
          defaultMessage: '-',
          description: 'Shown when place of marriage is missing',
          id: 'event.divorce.summary.marriageDetails.placeOfMarriage.empty'
        }
      },
      // Contact
      {
        id: 'informant.contact',
        label: {
          defaultMessage: 'Contact',
          description: 'Label for informant contact information',
          id: 'event.divorce.summary.informant.contact.label'
        },
        value: {
          defaultMessage:
            '{informantDetails.phoneNumber, select, __EMPTY__ {{informantDetails.email}} other {{informantDetails.phoneNumber}{informantDetails.email, select, __EMPTY__ {} other { and {informantDetails.email}}}}}',
          description: 'Shows phone and/or email of the informant',
          id: 'event.divorce.summary.informant.contact.value'
        },
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'Shown when informant contact details are missing',
          id: 'event.divorce.summary.informant.contact.empty'
        }
      },

      // Correction summary
      {
        fieldId: 'submittedBy',
        label: {
          defaultMessage: 'Submitted by',
          description: 'User role name who submitted correction',
          id: 'event.divorce.summary.submittedBy.label'
        }
      },
      {
        fieldId: 'office',
        label: {
          defaultMessage: 'Office',
          description: 'Location name of the office',
          id: 'event.divorce.summary.office.label'
        }
      },
      {
        fieldId: 'requestedOn',
        label: {
          defaultMessage: 'Requested on',
          description: 'Date the correction was submitted',
          id: 'event.divorce.summary.requestedOn.label'
        }
      },
      {
        fieldId: 'requestedBy',
        label: {
          defaultMessage: 'Requested by',
          description: 'Name of individual who requested the correction',
          id: 'event.divorce.summary.requestedBy.label'
        }
      },
      {
        fieldId: 'reasonForCorrection',
        label: {
          defaultMessage: 'Reason for correction',
          description: 'Reason provided for correction request',
          id: 'event.divorce.summary.reasonForCorrection.label'
        }
      },
      {
        fieldId: 'typeOfCorrection',
        label: {
          defaultMessage: 'Type of correction',
          description: 'Type or category of correction',
          id: 'event.divorce.summary.typeOfCorrection.label'
        }
      },
      {
        fieldId: 'supportingDocuments',
        label: {
          defaultMessage: 'Supporting documents',
          description: 'Documents attached for correction verification',
          id: 'event.divorce.summary.supportingDocuments.label'
        }
      }
    ]
  },
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.divorce.action.read.label'
      },
      review: DIVORCE_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.divorce.action.declare.label'
      },
      review: DIVORCE_DECLARATION_REVIEW,
      deduplication: {
        id: 'divorce-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.divorce.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.divorce.action.register.label'
      },
      deduplication: {
        id: 'divorce-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.divorce.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.divorce.action.collect-certificate.label'
      },
      printForm: DIVORCE_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        id: 'event.divorce.action.declare.form.review.title',
        defaultMessage:
          '{marriageDetails.bridegroomGivenNames, select, __EMPTY__ {Divorce} other {{marriageDetails.brideName, select, __EMPTY__ {Divorce for {marriageDetails.bridegroomGivenNames}} other {Divorce for {marriageDetails.bridegroomGivenNames} and {marriageDetails.brideName}}}}}',
        description: 'Title of the form to show in review page'
      },
      correctionForm: CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchDivorce
})
