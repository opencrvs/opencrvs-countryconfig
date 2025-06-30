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

import { CollectorType } from './collector-other'
export const DEATH_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'v2.event.death.action.certificate.form.label',
    defaultMessage: 'Death certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.death.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectors, ...printCertificateCollectorOther]
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      title: {
        id: 'event.death.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: and(
        not(
          field('collector.requesterId').isEqualTo(CollectorType.SOMEONE_ELSE)
        ),
        not(field('collector.requesterId').isEqualTo('PRINT_IN_ADVANCE'))
      ),
      fields: printCertificateCollectorIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'v2.event.death.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'v2.event.death.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'v2.event.death.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'v2.event.death.action.certificate.form.cancel.confirmation.body'
            }
          }
        }
      }
    },
    {
      id: 'collector.collect.payment',
      type: PageTypes.enum.FORM,
      title: {
        id: 'event.birth.action.print.collectPayment',
        defaultMessage: 'Collect Payment',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.collect.payment.data.afterRegistrationTarget',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'v2.event.death.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                not(
                  field('eventDetails.date')
                    .isAfter()
                    .days(applicationConfig.DEATH.REGISTRATION_TARGET)
                    .inPast()
                ),
                field('eventDetails.date').isBefore().now()
              )
            }
          ],
          configuration: {
            data: [
              {
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'v2.event.death.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Death registration after 45 days of date of death',
                  description:
                    'Death registration after 45 days of date of death message',
                  id: 'v2.event.death.action.certificate.form.section.collectPayment.service.label.afterRegistrationTarget'
                }
              },
              {
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'v2.event.death.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$15.00'
              }
            ]
          }
        },
        {
          id: 'collector.collect.payment.data.beforeRegistrationTarget',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'v2.event.death.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('eventDetails.date')
                  .isAfter()
                  .days(applicationConfig.DEATH.REGISTRATION_TARGET)
                  .inPast(),
                field('eventDetails.date').isBefore().now()
              )
            }
          ],
          configuration: {
            data: [
              {
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'v2.event.death.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Death registration before 45 days of date of death',
                  description:
                    'Death registration before 45 days of date of death message',
                  id: 'v2.event.death.action.certificate.form.section.collectPayment.service.label.beforeRegistrationTarget'
                }
              },
              {
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'v2.event.death.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$5.00'
              }
            ]
          }
        }
      ]
    }
  ]
})
