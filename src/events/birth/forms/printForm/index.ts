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
  defineActionForm,
  event,
  field,
  FieldType,
  not,
  or,
  PageTypes
} from '@opencrvs/toolkit/events'
import { printCertificateCollectors } from './collectors'
import { printCertificateCollectorOther } from './collector-other'
import { printCertificateCollectorIdentityVerify } from './collector-identity-verify'

const isSubsequentCertificateIssuance = event
  .hasAction(ActionType.PRINT_CERTIFICATE)
  .minCount(1)
const isFirstCertificateIssuance = not(isSubsequentCertificateIssuance)
const isPostSixMonthRegistration = and(
  field('child.dob').isBefore().now(),
  not(field('child.dob').isAfter().days(180).inPast())
)
const isLegacyRecord = field('introduction.isLegacyRecord').isEqualTo(true)
const requiresBirthRegistrationFee = and(
  isFirstCertificateIssuance,
  or(isPostSixMonthRegistration, isLegacyRecord)
)
const requiresCertificateIssuanceFee = isSubsequentCertificateIssuance
const requiresPayment = or(
  requiresBirthRegistrationFee,
  requiresCertificateIssuanceFee
)

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
          id: 'collector.collect.payment.freeData',
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
                  defaultMessage: 'First birth certificate issuance',
                  description: 'Free first birth certificate service name',
                  id: 'event.birth.action.certificate.form.section.collectPayment.service.label.firstIssuance'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.birth.action.certificate.form.section.collectPayment.fee.label'
                },
                value: 'Nil'
              }
            ]
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                isFirstCertificateIssuance,
                not(or(isPostSixMonthRegistration, isLegacyRecord))
              )
            }
          ]
        },
        {
          id: 'collector.collect.payment.registrationFeeData',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.birth.action.certificate.form.section.collectPayment.registrationFeeData.label'
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
                  defaultMessage: 'Late or legacy birth registration',
                  description: 'Late or legacy birth registration service name',
                  id: 'event.birth.action.certificate.form.section.collectPayment.service.label.lateOrLegacyRegistration'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.birth.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$10.00'
              }
            ]
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: requiresBirthRegistrationFee
            }
          ]
        },
        {
          id: 'collector.collect.payment.subsequentIssuanceData',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'event.birth.action.certificate.form.section.collectPayment.subsequentIssuanceData.label'
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
                  defaultMessage: 'Subsequent birth certificate issuance',
                  description: 'Subsequent birth certificate service name',
                  id: 'event.birth.action.certificate.form.section.collectPayment.service.label.subsequentIssuance'
                }
              },
              {
                id: 'fee',
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'event.birth.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$10.00'
              }
            ]
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: requiresCertificateIssuanceFee
            }
          ]
        },
        {
          id: 'collector.collect.payment.feeWaived',
          type: FieldType.CHECKBOX,
          defaultValue: false,
          label: {
            defaultMessage: 'Fee is waived / not collected',
            description: 'Label for the fee waiver checkbox',
            id: 'event.birth.action.certificate.form.section.collectPayment.feeWaived.label'
          },
          conditionals: [
            { type: ConditionalType.SHOW, conditional: requiresPayment }
          ]
        },
        {
          id: 'collector.collect.payment.amountCollected',
          type: FieldType.NUMBER,
          required: true,
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
              conditional: and(
                requiresPayment,
                not(
                  field('collector.collect.payment.feeWaived').isEqualTo(true)
                )
              )
            }
          ]
        },
        {
          id: 'collector.collect.payment.receiptNumber',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Receipt Number',
            description: 'Label for the receipt number field',
            id: 'event.birth.action.certificate.form.section.collectPayment.receiptNumber.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                requiresPayment,
                not(
                  field('collector.collect.payment.feeWaived').isEqualTo(true)
                )
              )
            }
          ]
        },
        {
          id: 'collector.collect.payment.feeWaiverReason',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Reason for fee waiver / non-collection',
            description: 'Label for the reason for fee waiver field',
            id: 'event.birth.action.certificate.form.section.collectPayment.feeWaiverReason.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                requiresPayment,
                field('collector.collect.payment.feeWaived').isEqualTo(true)
              )
            }
          ],
          configuration: { maxLength: 500 }
        }
      ]
    }
  ]
})
