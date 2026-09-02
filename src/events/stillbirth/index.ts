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

import {
  STILLBIRTH_DECLARATION_FORM,
  STILLBIRTH_DECLARATION_REVIEW
} from './forms/declaration'
import { STILLBIRTH_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { STILLBIRTH_CORRECTION_FORM } from './forms/correctionForm'
import { PlaceOfDelivery } from './forms/pages/eventDetails'
import { advancedSearchStillbirth } from './advancedSearch'
import { dedupConfig } from './dedupConfig'
import { Event } from '@countryconfig/events/utils'

export const stillbirthEvent = defineConfig({
  id: Event.Stillbirth,
  analytics: true,
  declaration: STILLBIRTH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Stillbirth',
    description: 'This is what this event is referred as in the system',
    id: 'event.stillbirth.label'
  },
  dateOfEvent: field('eventDetails.dateOfDelivery'),
  placeOfEvent: field('eventDetails.deliveryLocationId'),
  title: {
    defaultMessage:
      '{mother.name.firstname, select, __EMPTY__ {Stillbirth declaration} other {{mother.name.surname, select, __EMPTY__ {Stillbirth declaration for {mother.name.firstname}} other {Stillbirth declaration for {mother.name.firstname} {mother.name.surname}}}}}',
    description: 'This is the title of the summary',
    id: 'event.stillbirth.title'
  },
  fallbackTitle: {
    id: 'event.stillbirth.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'eventDetails.dateOfDelivery',
        emptyValueMessage: {
          defaultMessage: 'No date of delivery',
          description: 'This is shown when there is no event information',
          id: 'event.stillbirth.summary.eventDetails.dateOfDelivery.empty'
        }
      },
      {
        fieldId: 'eventDetails.deliveryLocation',
        emptyValueMessage: {
          defaultMessage: 'No place of delivery',
          description: 'This is shown when there is no place of delivery information',
          id: 'event.stillbirth.summary.eventDetails.placeOfDelivery.empty'
        },
        label: {
          defaultMessage: 'Place of delivery',
          description: 'Label for place of delivery',
          id: 'event.stillbirth.summary.eventDetails.placeOfDelivery.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDelivery').isEqualTo(
              PlaceOfDelivery.HEALTH_FACILITY
            )
          }
        ]
      },
      {
        fieldId: 'eventDetails.deliveryLocation.privateHome',
        emptyValueMessage: {
          defaultMessage: 'No place of delivery',
          description: 'This is shown when there is no place of delivery information',
          id: 'event.stillbirth.summary.eventDetails.placeOfDelivery.empty'
        },
        label: {
          defaultMessage: 'Place of delivery',
          description: 'Label for place of delivery',
          id: 'event.stillbirth.summary.eventDetails.placeOfDelivery.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDelivery').isEqualTo(
              PlaceOfDelivery.PRIVATE_HOME
            )
          }
        ]
      },
      {
        fieldId: 'eventDetails.deliveryLocation.other',
        emptyValueMessage: {
          defaultMessage: 'No place of delivery',
          description: 'This is shown when there is no place of delivery information',
          id: 'event.stillbirth.summary.eventDetails.placeOfDelivery.empty'
        },
        label: {
          defaultMessage: 'Place of delivery',
          description: 'Label for place of delivery',
          id: 'event.stillbirth.summary.eventDetails.placeOfDelivery.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDelivery').isEqualTo(
              PlaceOfDelivery.OTHER
            )
          }
        ]
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'event.stillbirth.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'event.stillbirth.summary.informant.contact.label'
        },
        value: {
          defaultMessage:
            '{informant.phoneNo, select, __EMPTY__ {{informant.email, select, __EMPTY__ {} other {{informant.email}}}} other {{informant.phoneNo}{informant.email, select, __EMPTY__ {} other { | {informant.email}}}}}',
          description: 'This is the contact value of the informant',
          id: 'event.stillbirth.summary.informant.contact.value'
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
        id: 'event.stillbirth.action.Read.label'
      },
      review: STILLBIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.stillbirth.action.declare.label'
      },
      review: STILLBIRTH_DECLARATION_REVIEW,
      deduplication: {
        id: 'stillbirth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.stillbirth.action.detect-duplicate.label'
        },
        query: dedupConfig
      },
      dialogCopy: {
        notify: {
          id: 'event.stillbirth.action.declare.notify.copy',
          defaultMessage:
            'You are about to formally notify the relevant Registration Office that a stillbirth event has occurred. Please confirm that the information provided is accurate before proceeding.',
          description: 'Confirmation text for the notify action'
        },
        declare: {
          id: 'event.stillbirth.action.declare.declare.copy',
          defaultMessage:
            'You are about to formally declare this stillbirth event. Once declared, the record will enter the verification and approval process.',
          description: 'Confirmation text for the declare action'
        },
        register: {
          id: 'event.stillbirth.action.declare.register.copy',
          defaultMessage:
            '<strong>WARNING!</strong>: By clicking "Register", you confirm that you have reviewed the record alongside supporting documentation in the Record tab. The record will proceed to be <strong>legally registered</strong> via the outbox. Further amends after registration can only be made via a legal correction process.',
          description: 'Confirmation text for the register action'
        }
      }
    },
    {
      type: ActionType.REJECT,
      label: {
        defaultMessage: 'Reject',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.stillbirth.action.reject.label'
      },
      supportingCopy: {
        id: 'rejectModal.description',
        defaultMessage:
          'Rejecting this declaration will return it to the submitter for updates. Please ensure a valid reason for rejection has been recorded.',
        description: 'The description for reject modal'
      }
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.stillbirth.action.register.label'
      },
      supportingCopy: {
        id: 'event.stillbirth.action.register.supportingCopy',
        description: 'Confirmation text for the register action',
        defaultMessage:
          'Registering this stillbirth event will create an official civil registration record. Please ensure all details are correct before proceeding.'
      },
      deduplication: {
        id: 'stillbirth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.stillbirth.action.detect-duplicate.label'
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
        id: 'event.stillbirth.action.collect-certificate.label'
      },
      printForm: STILLBIRTH_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Request correction',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.stillbirth.action.requestCorrection.label'
      },
      correctionForm: STILLBIRTH_CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchStillbirth
})
