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
  ActionType,
  ConditionalType,
  defineConfig,
  field
} from '@opencrvs/toolkit/events'
import { advancedSearchMarriageRegistration } from './advancedSearch'
import { Event } from '@countryconfig/events/utils'
import { MARRIAGE_REGISTER_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { dedupConfig } from './dedupConfig'
import {
  MARRIAGE_REGISTRATION_FORM,
  MARRIAGE_REGISTRATION_REVIEW
} from './forms/declaration'
import { CORRECTION_FORM } from './forms/correctionForm'

export const marriageRegistrationEvent = defineConfig({
  id: Event.MarriageRegistration,
  declaration: MARRIAGE_REGISTRATION_FORM,
  label: {
    defaultMessage: 'Marriage registration',
    description: 'This is what this event is referred as in the system',
    id: 'event.marriageRegistration.label'
  },
  dateOfEvent: field('marriageDetails.dateOfMarriage'),
  title: {
    defaultMessage:
      '{marriageDetails.brideName.firstname, select, __EMPTY__ {Marriage Licence} other {{marriageDetails.brideName.surname, select, __EMPTY__ {Marriage Licence for {marriageDetails.brideName.surname} and {marriageDetails.bridegroomName.surname}} other {Marriage Licence for {marriageDetails.bridegroomName.surname} and {marriageDetails.brideName.surname}}}}}',
    description: 'This is the title of the summary',
    id: 'event.marriageRegistration.summary.title'
  },
  fallbackTitle: {
    id: 'event.marriageRegistration.summary.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      // dateOfMarriage
      {
        fieldId: 'marriageDetails.dateOfMarriage',
        label: {
          defaultMessage: 'Date of marriage',
          description: 'Date on which the marriage took place',
          id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.dateOfMarriage.label'
        }
      },
      // placeOfMarriage
      {
        fieldId: 'marriageDetails.address',
        label: {
          defaultMessage: 'Place of marriage',
          description: 'Address or location where the marriage occurred',
          id: 'event.marriageRegistration.summary.marriageDetails.address.label'
        },
        emptyValueMessage: {
          defaultMessage: '-',
          description: 'Shown when place of marriage is missing',
          id: 'event.marriageRegistration.summary.marriageDetails.address.empty'
        }
      },
      // Contact
      {
        id: 'informant.contact',
        label: {
          defaultMessage: 'Contact',
          description: 'Label for informant contact information',
          id: 'event.marriageRegistration.summary.informant.contact.label'
        },
        value: {
          defaultMessage:
            '{informantDetails.phoneNumber, select, __EMPTY__ {{informantDetails.email}} other {{informantDetails.phoneNumber}{informantDetails.email, select, __EMPTY__ {} other { and {informantDetails.email}}}}}',
          description: 'Shows phone and/or email of the informant',
          id: 'event.marriageRegistration.summary.informant.contact.value'
        },
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'Shown when informant contact details are missing',
          id: 'event.marriageRegistration.summary.informant.contact.empty'
        }
      },

      // Correction summary
      {
        fieldId: 'submittedBy',
        label: {
          defaultMessage: 'Submitted by',
          description: 'User role name who submitted correction',
          id: 'event.marriageRegistration.summary.submittedBy.label'
        }
      },
      {
        fieldId: 'office',
        label: {
          defaultMessage: 'Office',
          description: 'Location name of the office',
          id: 'event.marriageRegistration.summary.office.label'
        }
      },
      {
        fieldId: 'requestedOn',
        label: {
          defaultMessage: 'Requested on',
          description: 'Date the correction was submitted',
          id: 'event.marriageRegistration.summary.requestedOn.label'
        }
      },
      {
        fieldId: 'requestedBy',
        label: {
          defaultMessage: 'Requested by',
          description: 'Name of individual who requested the correction',
          id: 'event.marriageRegistration.summary.requestedBy.label'
        }
      },
      {
        fieldId: 'reasonForCorrection',
        label: {
          defaultMessage: 'Reason for correction',
          description: 'Reason provided for correction request',
          id: 'event.marriageRegistration.summary.reasonForCorrection.label'
        }
      },
      {
        fieldId: 'typeOfCorrection',
        label: {
          defaultMessage: 'Type of correction',
          description: 'Type or category of correction',
          id: 'event.marriageRegistration.summary.typeOfCorrection.label'
        }
      },
      {
        fieldId: 'supportingDocuments',
        label: {
          defaultMessage: 'Supporting documents',
          description: 'Documents attached for correction verification',
          id: 'event.marriageRegistration.summary.supportingDocuments.label'
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
        id: 'event.marriageRegistration.action.Read.label'
      },
      review: MARRIAGE_REGISTRATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.marriageRegistration.action.declare.label'
      },
      review: MARRIAGE_REGISTRATION_REVIEW,
      deduplication: {
        id: 'marriage-registration-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.marriageRegistration.action.detect-duplicate.label'
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
        id: 'event.marriageRegistration.action.register.label'
      },
      deduplication: {
        id: 'marriage-registration-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.marriageRegistration.action.detect-duplicate.label'
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
        id: 'event.marriageRegistration.action.collect-certificate.label'
      },
      printForm: MARRIAGE_REGISTER_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        id: 'event.marriageRegistration.action.declare.form.review.title',
        defaultMessage:
          '{marriageDetails.brideName.firstname, select, __EMPTY__ {Marriage Registration} other {{marriageDetails.brideName.surname, select, __EMPTY__ {Marriage Registration for {marriageDetails.brideName.firstname}} other {Marriage Registration for {marriageDetails.bridegroomName.surname} and {marriageDetails.brideName.surname}}}}}',
        description: 'Title of the form to show in review page'
      },
      correctionForm: CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchMarriageRegistration
})
