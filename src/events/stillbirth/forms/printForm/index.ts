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
  defineActionForm,
  field,
  FieldType,
  PageTypes
} from '@opencrvs/toolkit/events'

export const STILLBIRTH_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.stillbirth.action.certificate.form.label',
    defaultMessage: 'Stillbirth certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.stillbirth.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.requesterId',
          type: FieldType.SELECT,
          required: true,
          label: {
            defaultMessage: 'Requester',
            description: 'This is the label for the field',
            id: 'event.stillbirth.action.certificate.form.section.requester.label'
          },
          options: [
            {
              value: 'INFORMANT',
              label: {
                id: 'event.stillbirth.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue informant',
                description: 'This is the label for the field'
              }
            },
            {
              value: 'PRINT_IN_ADVANCE',
              label: {
                id: 'event.stillbirth.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              }
            }
          ]
        }
      ]
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      conditional: field('collector.requesterId').isEqualTo('INFORMANT'),
      title: {
        id: 'event.stillbirth.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.identity.verify.data',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Informant details',
            description: 'Title for the data section',
            id: 'event.stillbirth.action.certificate.form.section.verifyIdentity.data.label'
          },
          configuration: {
            subtitle: {
              defaultMessage: "Please verify the informant's identity",
              description: 'Subtitle for the data section',
              id: 'event.stillbirth.action.certificate.form.section.verifyIdentity.data.subtitle'
            },
            data: [{ fieldId: 'informant.name' }, { fieldId: 'informant.dob' }]
          }
        }
      ],
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.stillbirth.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.stillbirth.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.stillbirth.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.stillbirth.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    }
  ]
})
