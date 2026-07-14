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
  ConditionalType,
  defineActionForm,
  field,
  FieldType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { printCertificateCollectors } from './collectors'
import { printCertificateCollectorOther } from './collector-other'
import { printCertificateCollectorIdentityVerify } from './collector-identity-verify'

export const BIRTH_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.birth.action.certificate.form.label',
    defaultMessage: 'Birth certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectors]
    },
    {
      id: 'CollectorDetails',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.certificate.form.section.collector.details.title',
        defaultMessage: 'Collector details',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectorOther],
      conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: not(
        field('collector.requesterId').isEqualTo('SOMEONE_ELSE')
      ),
      fields: printCertificateCollectorIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'event.birth.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.birth.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.birth.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.birth.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      requireCompletionToContinue: true,
      title: {
        id: 'event.birth.action.print.collectPayment',
        defaultMessage: 'Collect Payment',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.collect.payment.data',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.birth.action.certificate.form.section.collectPayment.data.label'
          },
          configuration: {
            data: [
              {
                id: 'service',
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'event.birth.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage: 'Birth Certificate',
                  description: 'Birth certificate service name',
                  id: 'event.birth.action.certificate.form.section.collectPayment.service.label.birthCertificate'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.birth.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$25.00'
              }
            ]
          }
        },
        {
          id: 'collector.collect.payment.lateRegistrationFee',
          type: FieldType.CHECKBOX,
          defaultValue: false,
          label: {
            defaultMessage: 'Late registration fee is waived / not collected',
            description: 'Label for the Late registration fee checkbox',
            id: 'event.birth.action.certificate.form.section.collectPayment.lateRegistrationFee.label'
          }
        },
        {
          id: 'collector.collect.payment.amountCollected',
          type: FieldType.NUMBER,
          required: false,
          label: {
            defaultMessage: 'Confirm amount collected',
            description: 'Label for the amount collected field',
            id: 'event.birth.action.certificate.form.section.collectPayment.amountCollected.label'
          },
          configuration: {
            min: 0,
            prefix: {
              defaultMessage: '$',
              description: 'Prefix for the amount collected field',
              id: 'event.birth.action.certificate.form.section.collectPayment.amountCollected.prefix'
            }
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                field('collector.collect.payment.lateRegistrationFee').isEqualTo(true)
              )
            }
          ]
        },

        {
          id: 'collector.collect.payment.receiptNumber',
          type: FieldType.TEXT,
          required: false,
          label: {
            defaultMessage: 'Receipt Number',
            description: 'Label for the receipt number field',
            id: 'event.birth.action.certificate.form.section.collectPayment.receiptNumber.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: not(
                field('collector.collect.payment.lateRegistrationFee').isEqualTo(true)
              )
            }
          ]
        }
        ,
        {
          id: 'collector.collect.payment.feeWaiverReason',
          type: FieldType.TEXT,
          required: false,
          label: {
            defaultMessage: 'Reason for fee waiver / non-collection',
            description: 'Label for the reason for fee waiver / non-collection field',
            id: 'event.birth.action.certificate.form.section.collectPayment.feeWaiverReason.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.collect.payment.lateRegistrationFee').isEqualTo(true)
            }
          ]
        }
  ]
}
  ]
})
