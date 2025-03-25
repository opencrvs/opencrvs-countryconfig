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
  defineForm,
  field,
  FieldType,
  FormPageType
} from '@opencrvs/toolkit/events'
import { informantOtherThanParent, InformantType } from './pages/informant'

const CertCollectorType = {
  INFORMANT: 'INFORMANT',
  OTHER: 'OTHER',
  PRINT_IN_ADVANCE: 'PRINT_IN_ADVANCE'
} as const

const otherIdType = {
  PASSPORT: 'PASSPORT',
  DRIVING_LICENSE: 'DRIVING_LICENSE',
  REFUGEE_NUMBER: 'REFUGEE_NUMBER',
  ALIEN_NUMBER: 'ALIEN_NUMBER',
  OTHER: 'OTHER',
  NO_ID: 'NO_ID'
} as const

export const BIRTH_CERTIFICATE_COLLECTOR_FORM = defineForm({
  label: {
    id: 'v2.event.tennis-club-membership.birth.action.certificate.form.label',
    defaultMessage: 'Birth certificate collector',
    description: 'This is what this form is referred as in the system'
  },
  review: {
    title: {
      id: 'v2.event.tennis-club-membership.action.certificate.form.review.title',
      defaultMessage: 'Member certificate collector for {firstname} {surname}',
      description: 'Title of the form to show in review page'
    },
    fields: []
  },
  active: true,
  version: {
    id: '1.0.0',
    label: {
      id: 'v2.event.tennis-club-membership.action.certificate.form.version.1',
      defaultMessage: 'Version 1',
      description: 'This is the first version of the form'
    }
  },
  pages: [
    {
      id: 'collector',
      title: {
        id: 'v2.event.tennis-club-membership.action.certificate.form.section.who.title',
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
            id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.label'
          },
          options: [
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.informant.label',
                defaultMessage: 'Print and issue Informant',
                description: 'This is the label for the field'
              },
              value: CertCollectorType.INFORMANT
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.other.label',
                defaultMessage: 'Print and issue someone else',
                description: 'This is the label for the field'
              },
              value: CertCollectorType.OTHER
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.certificate.form.section.requester.printInAdvance.label',
                defaultMessage: 'Print in advance',
                description: 'This is the label for the field'
              },
              value: CertCollectorType.PRINT_IN_ADVANCE
            }
          ]
        },
        {
          id: 'collector.OTHER.idType',
          type: FieldType.SELECT,
          required: true,
          label: {
            defaultMessage: 'Select Type of ID',
            description: 'This is the label for selecting the type of ID',
            id: 'v2.event.tennis-club-membership.action.form.section.idType.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').isEqualTo('OTHER')
            }
          ],
          options: [
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.passport.label',
                defaultMessage: 'Passport',
                description: 'Option for selecting Passport as the ID type'
              },
              value: otherIdType.PASSPORT
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.drivingLicense.label',
                defaultMessage: 'Driving License',
                description:
                  'Option for selecting Driving License as the ID type'
              },
              value: otherIdType.DRIVING_LICENSE
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.refugeeNumber.label',
                defaultMessage: 'Refugee Number',
                description:
                  'Option for selecting Refugee Number as the ID type'
              },
              value: otherIdType.REFUGEE_NUMBER
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.alienNumber.label',
                defaultMessage: 'Alien Number',
                description: 'Option for selecting Alien Number as the ID type'
              },
              value: otherIdType.ALIEN_NUMBER
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.other.label',
                defaultMessage: 'Other',
                description: 'Option for selecting Other as the ID type'
              },
              value: otherIdType.OTHER
            },
            {
              label: {
                id: 'v2.event.tennis-club-membership.action.form.section.idType.noId.label',
                defaultMessage: 'No ID',
                description: 'Option for selecting No ID as the ID type'
              },
              value: otherIdType.NO_ID
            }
          ]
        },
        {
          id: 'collector.PASSPORT.details',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Passport Details',
            description: 'Field for entering Passport details',
            id: 'v2.event.tennis-club-membership.action.form.section.passportDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').isEqualTo(
                otherIdType.PASSPORT
              )
            }
          ]
        },
        {
          id: 'collector.DRIVING_LICENSE.details',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Driving License Details',
            description: 'Field for entering Driving License details',
            id: 'v2.event.tennis-club-membership.action.form.section.drivingLicenseDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').isEqualTo(
                otherIdType.DRIVING_LICENSE
              )
            }
          ]
        },
        {
          id: 'collector.REFUGEE_NUMBER.details',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Refugee Number Details',
            description: 'Field for entering Refugee Number details',
            id: 'v2.event.tennis-club-membership.action.form.section.refugeeNumberDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').isEqualTo(
                otherIdType.REFUGEE_NUMBER
              )
            }
          ]
        },
        {
          id: 'collector.ALIEN_NUMBER.details',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Alien Number Details',
            description: 'Field for entering Alien Number details',
            id: 'v2.event.tennis-club-membership.action.form.section.alienNumberDetails.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').isEqualTo(
                otherIdType.ALIEN_NUMBER
              )
            }
          ]
        },
        {
          id: 'collector.OTHER.idTypeOther',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Other ID Type (if applicable)',
            description: 'Field for entering ID type if "Other" is selected',
            id: 'v2.event.tennis-club-membership.action.form.section.idTypeOther.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.OTHER.idType').isEqualTo(
                otherIdType.OTHER
              )
            }
          ]
        },
        {
          id: 'collector.OTHER.firstName',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'First Name',
            description: 'This is the label for the first name field',
            id: 'v2.event.tennis-club-membership.action.form.section.firstName.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').isEqualTo(
                otherIdType.OTHER
              )
            }
          ]
        },
        {
          id: 'collector.OTHER.lastName',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Last Name',
            description: 'This is the label for the last name field',
            id: 'v2.event.tennis-club-membership.action.form.section.lastName.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').isEqualTo(
                otherIdType.OTHER
              )
            }
          ]
        },
        {
          id: 'collector.OTHER.relationshipToMember',
          type: FieldType.TEXT,
          required: true,
          label: {
            defaultMessage: 'Relationship to Member',
            description:
              'This is the label for the relationship to member field',
            id: 'v2.event.tennis-club-membership.action.form.section.relationshipToMember.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').isEqualTo(
                otherIdType.OTHER
              )
            }
          ]
        },
        {
          id: 'collector.OTHER.signedAffidavit',
          type: FieldType.FILE,
          required: false,
          label: {
            defaultMessage: 'Signed Affidavit (Optional)',
            description: 'This is the label for uploading a signed affidavit',
            id: 'v2.event.tennis-club-membership.action.form.section.signedAffidavit.label'
          },
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('collector.requesterId').isEqualTo(
                otherIdType.OTHER
              )
            }
          ]
        }
      ]
    },
    {
      id: 'collector.identity.verify',
      type: FormPageType.VERIFICATION,
      title: {
        id: 'event.birth.action.print.verifyIdentity',
        defaultMessage: 'Verify their identity',
        description: 'This is the title of the section'
      },
      fields: [
        {
          id: 'collector.identity.verify.data.mother',
          type: FieldType.DATA,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('informant.relation').isEqualTo(
                InformantType.MOTHER
              )
            }
          ],
          label: {
            defaultMessage: '',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.certificate.form.section.verifyIdentity.data.label'
          },
          configuration: {
            data: [
              { fieldId: 'mother.idType' },
              { fieldId: 'mother.nid' },
              { fieldId: 'mother.firstname' },
              { fieldId: 'mother.surname' },
              { fieldId: 'mother.dob' },
              { fieldId: 'mother.nationality' }
            ]
          }
        },
        {
          id: 'collector.identity.verify.data.father',
          type: FieldType.DATA,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('informant.relation').isEqualTo(
                InformantType.FATHER
              )
            }
          ],
          label: {
            defaultMessage: '',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.certificate.form.section.verifyIdentity.data.label'
          },
          configuration: {
            data: [
              { fieldId: 'father.idType' },
              { fieldId: 'father.nid' },
              { fieldId: 'father.firstname' },
              { fieldId: 'father.surname' },
              { fieldId: 'father.dob' },
              { fieldId: 'father.nationality' }
            ]
          }
        },
        {
          id: 'collector.identity.verify.data.other',
          type: FieldType.DATA,
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: informantOtherThanParent
            }
          ],
          label: {
            defaultMessage: '',
            description: 'Title for the data section',
            id: 'v2.event.birth.action.certificate.form.section.verifyIdentity.data.label'
          },
          configuration: {
            data: [
              { fieldId: 'informant.idType' },
              { fieldId: 'informant.nid' },
              { fieldId: 'informant.firstname' },
              { fieldId: 'informant.surname' },
              { fieldId: 'informant.dob' },
              { fieldId: 'informant.nationality' }
            ]
          }
        }
      ],
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
    }
  ]
})
