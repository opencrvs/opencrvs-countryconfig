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
import { InformantType } from '../pages/informant'

export const BIRTH_CERTIFICATE_COLLECTOR_FORM = defineActionForm({
  label: {
    id: 'v2.event.birth.action.certificate.form.label',
    defaultMessage: 'Birth certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  pages: [
    {
      id: 'collector',
      type: PageTypes.enum.FORM,
      title: {
        id: 'v2.event.birth.action.certificate.form.section.who.title',
        defaultMessage: 'Certify record',
        description: 'This is the title of the section'
      },
      fields: [...printCertificateCollectors, ...printCertificateCollectorOther]
    },
    {
      id: 'collector.identity.verify',
      type: PageTypes.enum.VERIFICATION,
      title: {
        id: 'event.birth.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      conditional: not(
        field('collector.requesterId').isEqualTo(InformantType.OTHER)
      ),
      fields: printCertificateCollectorIdentityVerify,
      actions: {
        verify: {
          label: {
            defaultMessage: 'Verified',
            description: 'This is the label for the verification button',
            id: 'v2.event.birth.action.certificate.form.verify'
          }
        },
        cancel: {
          label: {
            defaultMessage: 'Identity does not match',
            description:
              'This is the label for the verification cancellation button',
            id: 'v2.event.birth.action.certificate.form.cancel'
          },
          confirmation: {
            title: {
              defaultMessage: 'Print without proof of ID?',
              description:
                'This is the title for the verification cancellation modal',
              id: 'v2.event.birth.action.certificate.form.cancel.confirmation.title'
            },
            body: {
              defaultMessage:
                'Please be aware that if you proceed, you will be responsible for issuing a certificate without the necessary proof of ID from the collector',
              description:
                'This is the body for the verification cancellation modal',
              id: 'v2.event.birth.action.certificate.form.cancel.confirmation.body'
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
          id: 'collector.collect.payment.data.afterLateRegistrationTarget',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
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
          ],
          configuration: {
            data: [
              {
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Birth registration after 365 days of date of birth',
                  description:
                    'Birth registration after 365 days of date of birth message',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.service.label.afterLateRegistrationTarget'
                }
              },
              {
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$15.00'
              }
            ]
          }
        },
        {
          id: 'collector.collect.payment.data.inBetweenRegistrationTargets',
          type: FieldType.DATA,
          label: {
            defaultMessage: 'Payment details',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                not(
                  field('child.dob')
                    .isAfter()
                    .days(applicationConfig.BIRTH.REGISTRATION_TARGET)
                    .inPast()
                ),

                field('child.dob')
                  .isAfter()
                  .days(applicationConfig.BIRTH.LATE_REGISTRATION_TARGET)
                  .inPast(),
                field('child.dob').isBefore().now()
              )
            }
          ],
          configuration: {
            data: [
              {
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Birth registration after 30 days but before 365 days of date of birth',
                  description:
                    'Birth registration after 30 days but before 365 days of date of birth message',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.service.label.inBetweenRegistrationTargets'
                }
              },
              {
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.fee.label'
                },
                value: '$7.00'
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
            id: 'v2.event.birth.action.certificate.form.section.collectPayment.data.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: and(
                field('child.dob')
                  .isAfter()
                  .days(applicationConfig.BIRTH.REGISTRATION_TARGET)
                  .inPast(),
                field('child.dob').isBefore().now()
              )
            }
          ],
          configuration: {
            data: [
              {
                label: {
                  defaultMessage: 'Service',
                  description: 'Title for the data entry',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.service.label'
                },
                value: {
                  defaultMessage:
                    'Birth registration before 30 days of date of birth',
                  description:
                    'Birth registration before 30 days of date of birth message',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.service.label.beforeRegistrationTarget'
                }
              },
              {
                label: {
                  defaultMessage: 'Fee',
                  description: 'Title for the data entry',
                  id: 'v2.event.birth.action.certificate.form.section.collectPayment.fee.label'
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
