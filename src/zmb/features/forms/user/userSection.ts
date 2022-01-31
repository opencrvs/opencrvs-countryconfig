/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import {
  FIELD_GROUP_TITLE,
  IFormSection,
  NATIONAL_ID,
  LOCATION_SEARCH_INPUT,
  SELECT_WITH_DYNAMIC_OPTIONS,
  SELECT_WITH_OPTIONS,
  SIMPLE_DOCUMENT_UPLOADER,
  TEXT
} from '..'
import { conditionals } from '../utils'
import { messages } from './messages'

enum UserSection {
  User = 'user',
  Preview = 'preview'
}

export const userSectionFormType: IFormSection = {
  id: UserSection.User,
  viewType: 'form',
  name: messages.user,
  title: messages.userFormTitle,
  groups: [
    {
      id: 'registration-office',
      title: messages.assignedRegistrationOffice,
      conditionals: [conditionals.isOfficePreSelected],
      fields: [
        {
          name: 'assignedRegistrationOffice',
          type: FIELD_GROUP_TITLE,
          label: messages.assignedRegistrationOfficeGroupTitle,
          required: false,
          hidden: true,
          initialValue: '',
          validate: []
        },
        {
          name: 'registrationOffice',
          type: LOCATION_SEARCH_INPUT,
          label: messages.registrationOffice,
          required: true,
          initialValue: '',
          searchableResource: 'offices',
          searchableType: 'CRVS_OFFICE',
          validate: [
            {
              operation: 'officeMustBeSelected'
            }
          ],
          locationList: [],
          mapping: {
            mutation: {
              operation: 'fieldNameTransformer',
              parameters: ['primaryOffice']
            },
            query: {
              operation: 'locationIDToFieldTransformer',
              parameters: ['primaryOffice']
            }
          }
        }
      ]
    },
    {
      id: 'user-view-group',
      fields: [
        {
          name: 'userDetails',
          type: FIELD_GROUP_TITLE,
          label: messages.userDetails,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'firstNamesEng',
          type: TEXT,
          label: messages.firstNameEn,
          required: false,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'firstNames']
            },
            query: {
              operation: 'nameToFieldTransformer',
              parameters: ['en', 'firstNames']
            }
          }
        },
        {
          name: 'familyNameEng',
          type: TEXT,
          label: messages.lastNameEn,
          required: true,
          initialValue: '',
          validate: [{ operation: 'englishOnlyNameFormat' }],
          mapping: {
            mutation: {
              operation: 'fieldToNameTransformer',
              parameters: ['en', 'familyName']
            },
            query: {
              operation: 'nameToFieldTransformer',
              parameters: ['en', 'familyName']
            }
          }
        },
        {
          name: 'phoneNumber',
          type: TEXT,
          label: messages.phoneNumber,
          required: true,
          initialValue: '',
          validate: [{ operation: 'phoneNumberFormat' }],
          mapping: {
            mutation: {
              operation: 'msisdnTransformer',
              parameters: ['user.mobile']
            },
            query: {
              operation: 'localPhoneTransformer',
              parameters: ['user.mobile']
            }
          }
        },
        {
          name: 'nid',
          type: TEXT,
          label: messages.NID,
          required: false,
          initialValue: '',
          validate: [
            {
              operation: 'validIDNumber',
              parameters: [NATIONAL_ID]
            }
          ],
          mapping: {
            mutation: {
              operation: 'fieldToIdentifierWithTypeTransformer',
              parameters: [NATIONAL_ID]
            },
            query: {
              operation: 'identifierWithTypeToFieldTransformer',
              parameters: [NATIONAL_ID]
            }
          }
        },
        {
          name: 'accountDetails',
          type: FIELD_GROUP_TITLE,
          label: messages.accountDetails,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'role',
          type: SELECT_WITH_OPTIONS,
          label: messages.labelRole,
          required: true,
          initialValue: '',
          validate: [],
          options: []
        },
        {
          name: 'type',
          type: SELECT_WITH_DYNAMIC_OPTIONS,
          label: messages.type,
          required: true,
          initialValue: '',
          validate: [],
          dynamicOptions: {
            dependency: 'role',
            options: {}
          }
        },
        {
          name: 'device',
          type: TEXT,
          label: messages.userDevice,
          required: false,
          initialValue: '',
          validate: []
        }
      ]
    },
    {
      id: 'signature-attachment',
      title: messages.userSignatureAttachmentTitle,
      conditionals: [conditionals.isRegistrarRoleSelected],
      fields: [
        {
          name: 'attachmentTitle',
          type: FIELD_GROUP_TITLE,
          hidden: true,
          label: messages.userAttachmentSection,
          required: false,
          initialValue: '',
          validate: []
        },
        {
          name: 'signature',
          type: SIMPLE_DOCUMENT_UPLOADER,
          label: messages.userSignatureAttachment,
          description: messages.userSignatureAttachmentDesc,
          allowedDocType: ['image/png'],
          initialValue: '',
          required: true,
          validate: []
        }
      ]
    }
  ]
}

const getPreviewGroups = () => {
  return userSectionFormType.groups.map(group => {
    return {
      id: `preview-${group.id}`,
      fields: group.fields
    }
  })
}

export const userSectionPreviewType: IFormSection = {
  id: UserSection.Preview,
  viewType: 'preview' as const,
  name: messages.userFormReviewTitle,
  title: messages.userFormTitle,
  groups: getPreviewGroups()
}

export const userSection = {
  sections: [userSectionFormType, userSectionPreviewType]
}
