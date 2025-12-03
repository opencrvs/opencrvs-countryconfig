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
  and,
  ConditionalType,
  defineConfig,
  field,
  FieldType,
  flag,
  not,
  window
} from '@opencrvs/toolkit/events'
import {
  BIRTH_DECLARATION_FORM,
  BIRTH_DECLARATION_REVIEW
} from './forms/declaration'
import { advancedSearchBirth } from './advancedSearch'
import { Event } from '@countryconfig/form/types/types'
import { BIRTH_CERTIFICATE_COLLECTOR_FORM } from './forms/printForm'
import { PlaceOfBirth } from './forms/pages/child'
import { CORRECTION_FORM } from './forms/correctionForm'
import { dedupConfig } from './dedupConfig'
import { applicationConfig } from '@countryconfig/api/application/application-config'
import { CLIENT_APP_URL, GATEWAY_URL } from '@countryconfig/constants'

export const birthEvent = defineConfig({
  id: Event.Birth,
  declaration: BIRTH_DECLARATION_FORM,
  label: {
    defaultMessage: 'Birth',
    description: 'This is what this event is referred as in the system',
    id: 'event.birth.label'
  },
  dateOfEvent: field('child.dob'),
  title: {
    defaultMessage: '{child.name.firstname} {child.name.surname}',
    description: 'This is the title of the summary',
    id: 'event.birth.title'
  },
  fallbackTitle: {
    id: 'event.tennis-club-membership.fallbackTitle',
    defaultMessage: 'No name provided',
    description:
      'This is a fallback title if actual title resolves to empty string'
  },
  flags: [
    {
      id: 'approval-required-for-late-registration',
      label: {
        id: 'event.birth.flag.approval-required-for-late-registration',
        defaultMessage: 'Approval required for late registration',
        description: 'Flag label for approval required for late registration'
      },
      requiresAction: true
    },
    {
      id: 'vc-issued',
      label: {
        id: 'event.birth.flag.vc-issued',
        defaultMessage: 'VC issued',
        description: 'Flag label for VC issued'
      },
      requiresAction: false
    }
  ],
  summary: {
    fields: [
      {
        fieldId: 'child.dob',
        emptyValueMessage: {
          defaultMessage: 'No date of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.dob.empty'
        }
      },
      // Render the 'fallback value' when selection has not been made.
      // This hides the default values of the field when no selection has been made. (e.g. when address is prefilled with user's details, we don't want to show the address before selecting the option)
      {
        fieldId: 'child.placeOfBirth',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isFalsy()
          }
        ]
      },
      {
        fieldId: 'child.birthLocation',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isEqualTo(
              PlaceOfBirth.HEALTH_FACILITY
            )
          }
        ]
      },
      {
        fieldId: 'child.birthLocation.privateHome',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isEqualTo(
              PlaceOfBirth.PRIVATE_HOME
            )
          }
        ]
      },
      {
        fieldId: 'child.birthLocation.other',
        emptyValueMessage: {
          defaultMessage: 'No place of birth',
          description: 'This is shown when there is no child information',
          id: 'event.birth.summary.child.placeOfBirth.empty'
        },
        label: {
          defaultMessage: 'Place of birth',
          description: 'Label for place of birth',
          id: 'event.birth.summary.child.placeOfBirth.label'
        },
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: field('child.placeOfBirth').isEqualTo(
              PlaceOfBirth.OTHER
            )
          }
        ]
      },
      {
        id: 'informant.contact',
        emptyValueMessage: {
          defaultMessage: 'No contact details provided',
          description: 'This is shown when there is no informant information',
          id: 'event.birth.summary.informant.contact.empty'
        },
        label: {
          defaultMessage: 'Contact',
          description: 'This is the label for the informant information',
          id: 'event.birth.summary.informant.contact.label'
        },
        value: {
          defaultMessage: '{informant.phoneNo} {informant.email}',
          description: 'This is the contact value of the informant',
          id: 'event.birth.summary.informant.contact.value'
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
        id: 'event.birth.action.Read.label'
      },
      review: BIRTH_DECLARATION_REVIEW
    },
    {
      type: ActionType.DECLARE,
      label: {
        defaultMessage: 'Declare',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.declare.label'
      },
      review: BIRTH_DECLARATION_REVIEW,
      deduplication: {
        id: 'birth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.birth.action.detect-duplicate.label'
        },
        query: dedupConfig
      },
      flags: [
        {
          id: 'approval-required-for-late-registration',
          operation: 'add',
          conditional: and(
            not(
              field('child.dob')
                .isAfter()
                .days(applicationConfig.BIRTH.LATE_REGISTRATION_TARGET)
                .inPast()
            ),
            field('child.dob').isBefore().now()
          )
        }
      ]
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'Approve',
      label: {
        defaultMessage: 'Approve',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.approve.label'
      },
      form: [
        {
          id: 'notes',
          type: 'TEXTAREA',
          required: true,
          label: {
            defaultMessage: 'Notes',
            description: 'This is the label for the field for a custom action',
            id: 'event.birth.custom.action.approve.field.notes.label'
          }
        }
      ],
      flags: [
        { id: 'approval-required-for-late-registration', operation: 'remove' }
      ],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: flag('approval-required-for-late-registration')
        }
      ],
      auditHistoryLabel: {
        defaultMessage: 'Approved',
        description:
          'The label to show in audit history for the approve action',
        id: 'event.birth.action.approve.audit-history-label'
      },
      supportingCopy: {
        defaultMessage:
          'This birth has been registered late. You are now approving it for further validation and registration.',
        description: 'This is the confirmation text for the approve action',
        id: 'event.birth.action.approve.confirmationText'
      }
    },
    {
      type: ActionType.VALIDATE,
      label: {
        defaultMessage: 'Validate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.validate.label'
      },
      deduplication: {
        id: 'birth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.birth.action.detect-duplicate.label'
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
        id: 'event.birth.action.register.label'
      },
      deduplication: {
        id: 'birth-deduplication',
        label: {
          defaultMessage: 'Detect duplicate',
          description:
            'This is shown as the action name anywhere the user can trigger the action from',
          id: 'event.birth.action.detect-duplicate.label'
        },
        query: dedupConfig
      }
    },
    {
      type: ActionType.CUSTOM,
      customActionType: 'IssueVC',
      label: {
        defaultMessage: 'Issue VC',
        description: '',
        id: 'event.birth.action.issue-vc.label'
      },
      flags: [
        // @TODO: This is added in issuer service to record
        // {
        //   id: 'vc-issued',
        //   operation: 'add'
        // }
      ],
      conditionals: [
        {
          type: ConditionalType.ENABLE,
          conditional: not(flag('vc-issued'))
        }
      ],
      form: [
        {
          id: 'requester',
          type: FieldType.SELECT,
          // @TODO: import this from birth form?
          options: [
            {
              value: 'mother',
              label: {
                defaultMessage: 'Mother',
                description: '@TODO',
                id: 'event.birth.custom.action.issue-vc.field.requester.option.mother'
              }
            },
            {
              value: 'father',
              label: {
                defaultMessage: 'Father',
                description: '@TODO',
                id: 'event.birth.custom.action.issue-vc.field.requester.option.father'
              }
            }
          ],
          label: {
            defaultMessage: 'Requester',
            description: 'Select who is requesting the VC',
            id: 'event.birth.custom.action.issue-vc.field.requester.label'
          }
        },
        {
          id: 'request-credential-offer-button',
          type: FieldType.BUTTON,
          label: {
            defaultMessage: 'Request Credential Offer',
            description: 'Button to request the credential offer from issuer',
            id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.label'
          },
          configuration: {
            text: {
              defaultMessage: 'Request Credential Offer',
              description: 'Button to request the credential offer from issuer',
              id: 'event.birth.custom.action.issue-vc.field.request-credential-offer-button.configuration.text'
            }
          }
        },
        {
          parent: field('request-credential-offer-button'),
          id: 'get-credential-offer',
          type: FieldType.HTTP,
          label: {
            defaultMessage: 'Get Credential Offer',
            description:
              'HTTP request to get the credential offer from the issuer',
            id: 'event.birth.custom.action.issue-vc.field.get-credential-offer.label'
          },
          configuration: {
            trigger: field('request-credential-offer-button'),
            url: `${CLIENT_APP_URL}api/countryconfig/vc/offers`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: { pathname: window().location.get('pathname') }
          }
        },
        {
          parent: field('get-credential-offer'),
          id: 'qr-code',
          type: FieldType.IMAGE,
          label: {
            defaultMessage: 'QR Code',
            description: 'Upload the QR code image for the VC',
            id: 'event.birth.custom.action.issue-vc.field.qr-code.label'
          },
          configuration: {
            alt: {
              defaultMessage: 'QR Code',
              description: 'Upload the QR code image for the VC',
              id: 'event.birth.custom.action.issue-vc.field.qr-code.configuration.alt'
            }
          },
          value: field('get-credential-offer').get(
            'data.credential_offer_uri_qr'
          )
        }
      ]
    },
    {
      type: ActionType.PRINT_CERTIFICATE,
      label: {
        defaultMessage: 'Print certificate',
        description:
          'This is shown as the action name anywhere the user can trigger the action from',
        id: 'event.birth.action.collect-certificate.label'
      },
      printForm: BIRTH_CERTIFICATE_COLLECTOR_FORM
    },
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        id: 'event.birth.action.declare.form.review.title',
        defaultMessage:
          '{child.name.firstname, select, __EMPTY__ {Birth declaration} other {{child.name.surname, select, __EMPTY__ {Birth declaration for {child.name.firstname}} other {Birth declaration for {child.name.firstname} {child.name.surname}}}}}',
        description: 'Title of the form to show in review page'
      },
      correctionForm: CORRECTION_FORM
    }
  ],
  advancedSearch: advancedSearchBirth
})
