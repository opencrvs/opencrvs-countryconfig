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
  and,
  ConditionalType,
  defineActionForm,
  field,
  FieldType,
  not,
  PageTypes
} from '@opencrvs/toolkit/events'
import { applicationConfig } from '@countryconfig/api/application/application-config'
import { printCertificateCollectors } from './collectors'
import { printCertificateCollectorOther } from './collector-other'
import { printCertificateCollectorIdentityVerify } from './collector-identity-verify'

export const MARRIAGE_REGISTER_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'event.marriageRegistration.action.certificate.form.label',
    defaultMessage: 'Marriage registration certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.marriageRegistration.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectors]
    },
    {
      id: 'collector.details',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.marriageRegistration.action.certificate.form.section.who.title.2',
        defaultMessage: 'Collector details',
        description: 'This is the title of the section'
      },
      conditional: field('collector.requesterId').isEqualTo('SOMEONE_ELSE'),
      fields: [...printCertificateCollectorOther]
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      title: {
        id: 'event.marriageRegistration.action.print.verifyIdentity',
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
            id: 'event.marriageRegistration.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'event.marriageRegistration.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Proceed without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'event.marriageRegistration.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'event.marriageRegistration.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.marriageRegistration.action.print.collectPayment',
        defaultMessage: 'Collect Payment',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.collect.payment.feeCollected',
          type: FieldType.NUMBER,
          label: {
            defaultMessage: 'Fee collected',
            description: 'Fee amount collected',
            id: 'event.marriageRegistration.action.certificate.form.section.collectPayment.feeCollected.label'
          },
          required: false,
          placeholder: {
            defaultMessage: 'Enter fee amount',
            description: 'Placeholder for fee collected field',
            id: 'event.marriageRegistration.action.certificate.form.section.collectPayment.feeCollected.placeholder'
          }
        },
        {
          id: 'collector.collect.payment.receiptNumber',
          type: FieldType.TEXT,
          label: {
            defaultMessage: 'Receipt number',
            description: 'Receipt number for the payment',
            id: 'event.marriageRegistration.action.certificate.form.section.collectPayment.receiptNumber.label'
          },
          required: false,
          placeholder: {
            defaultMessage: 'Enter receipt number',
            description: 'Placeholder for receipt number field',
            id: 'event.marriageRegistration.action.certificate.form.section.collectPayment.receiptNumber.placeholder'
          }
        }
      ]
    }
  ]
})
