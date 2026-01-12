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
  field,
  or,
  user,
  and,
  status,
  not,
  flag,
  InherentFlags
} from '@opencrvs/toolkit/events'
import {
  DEATH_DECLARATION_REVIEW,
  DEATH_DECLARATION_FORM
} from './forms/declaration'
import { Event } from '@countryconfig/form/types/types'
import { DEATH_CERTIFICATE_COLLECTOR_FORM } from '../death/forms/printForm'
import { advancedSearchDeath } from './advancedSearch'
import { PlaceOfDeath } from './forms/pages/eventDetails'
import { DEATH_CORRECTION_FORM } from './forms/correctionForm'
import { dedupConfig } from './dedupConfig'

export const deathEvent = defineConfig({
  id: Event.Death,
  declaration: DEATH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Death',
    description: 'This is what this event is referred as in the system',
    id: 'event.death.label'
  },
  dateOfEvent: field('eventDetails.date'),
  placeOfEvent: field('eventDetails.deathLocationId'),
  title: {
    defaultMessage: '{deceased.name.firstname} {deceased.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.death.title'
  },
  fallbackTitle: {
    id: 'event.tennis-club-membership.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  summary: {
    fields: [
      {
        fieldId: 'eventDetails.date',
        emptyValueMessage: {
          defaultMessage: 'No date of death',
          description:
            'This is shown when there is no date of death information',
          id: 'event.death.summary.eventDetails.date.empty'
        }
      },
      {
        fieldId: 'eventDetails.placeOfDeath',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description:
            'This is shown when there is no place of death information',
          id: 'event.death.summary.eventDetails.placeOfDeath.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'event.death.summary.eventDetails.placeOfDeath.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDeath').isFalsy()
          }
        ]
      },
      {
        fieldId: 'eventDetails.deathLocation',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description:
            'This is shown when there is no death location information',
          id: 'event.death.summary.eventDetails.deathLocation.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'event.death.summary.eventDetails.deathLocation.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDeath').isEqualTo(
              PlaceOfDeath.HEALTH_FACILITY
            )
          }
        ]
      },
      {
        fieldId: 'deceased.address',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description:
            'This is shown when there is no death location information',
          id: 'event.death.summary.eventDetails.placeOfDeath.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'event.death.summary.eventDetails.placeOfDeath.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDeath').isEqualTo(
              PlaceOfDeath.DECEASED_USUAL_RESIDENCE
            )
          }
        ]
      },
      {
        fieldId: 'eventDetails.deathLocationOther',
        emptyValueMessage: {
          defaultMessage: 'No place of death',
          description:
            'This is shown when there is no death location information',
          id: 'event.death.summary.eventDetails.placeOfDeath.empty'
        },
        label: {
          defaultMessage: 'Place of death',
          description: 'Label for place of death',
          id: 'event.death.summary.eventDetails.placeOfDeath.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('eventDetails.placeOfDeath').isEqualTo(
              PlaceOfDeath.OTHER
            )
          }
        ]
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'event.death.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'event.death.summary.informant.contact.label'
        },
        value: {
          defaultMessage: '{informant.phoneNo} {informant.email}',
          description: 'This is the contact value of the informant',
          id: 'event.death.summary.informant.contact.value'
        }
      }
    ]
  },
  flags: [
    {
      id: 'validated',
      label: {
        id: 'event.birth.flag.validated',
        defaultMessage: 'Validated',
        description: 'Flag label for validated'
      },
      requiresAction: true
    }
  ],
  actions: [
    {
      type: ActionType.READ,
      label: {
        defaultMessage: 'Read',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.death.action.Read.label'
      },
      review: DEATH_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.death.action.declare.label'
      },
      review: DEATH_DECLARATION_REVIEW,
      deduplication: {
        id: 'death-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.death.action.detect-duplicate.label'
        },
        query: dedupConfig
      },
      flags: [
        {
          id: 'validated',
          operation: 'add',
          conditional: or(
            user.hasRole('REGISTRATION_AGENT'),
            user.hasRole('LOCAL_REGISTRAR')
          )
        }
      ]
    },
    {
      type: ActionType.EDIT,
      label: {
        defaultMessage: 'Edit',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'actions.edit'
      },
      flags: [{ id: 'validated', operation: 'remove' }]
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'VALIDATE_DECLARATION',
      icon: 'Stamp',
      label: {
        defaultMessage: 'Validate declaration',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.death.custom.action.validate-declaration.label'
      },
      supportingCopy: {
        defaultMessage:
          'Approving this declaration confirms it as legally accepted and eligible for registration.',
        description:
          'This is the supporting copy for the Validate declaration -action',
        id: 'event.death.custom.action.validate-declaration.supportingCopy'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(status('DECLARED'), not(flag('validated')))
        },
        {
          type: ConditionalType.ENABLE,
          conditional: not(flag(InherentFlags.POTENTIAL_DUPLICATE))
        }
      ],
      flags: [{ id: 'validated', operation: 'add' }],
      form: [
        {
          id: 'comments',
          type: 'TEXTAREA',
          label: {
            defaultMessage: 'Comments',
            description:
              'This is the label for the comments field for the validate declaration action',
            id: 'event.death.custom.action.validate-declaration.field.comments.label'
          }
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Validated',
        description:
          'The label to show in audit history for the validate action',
        id: 'event.death.custom.action.validate-declaration.audit-history-label'
      }
    },
    {
      type: ActionType.REJECT,
      label: {
        defaultMessage: 'Reject',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.death.action.reject.label'
      }
    },
    {
      type: ActionType.REGISTER,
      label: {
        defaultMessage: 'Register',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.death.action.register.label'
      },
      flags: [{ id: 'validated', operation: 'remove' }],
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: flag('validated')
        }
      ],
      deduplication: {
        id: 'death-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.death.action.detect-duplicate.label'
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
        id: 'event.death.action.collect-certificate.label'
      },
      printForm: DEATH_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Correct record',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.death.action.request-correction.label'
      },
      correctionForm: DEATH_CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchDeath
})
