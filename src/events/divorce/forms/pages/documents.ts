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
import { DEFAULT_FILE_CONFIGURATION } from '@countryconfig/events/fileTypeConfig'
import { createSelectOptions } from '@countryconfig/events/utils'
import {
  defineFormPage,
  FieldType,
  PageTypes,
  ImageMimeType,
  TranslationConfig
} from '@opencrvs/toolkit/events'
const IdType = {
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER'
} as const
const idTypeMessageDescriptors = {
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeBC'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'form.field.label.iDTypeOther'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>
const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for documents',
    id: 'event.divorce.action.declare.form.section.documents.title'
  },
  fields: [
    // proof of marriage
    {
      id: 'documents.marriageCertificate',
      type: FieldType.FILE_WITH_OPTIONS,
      analytics: true,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: 'Proof of marriage',
        description: 'Label for uploading marriage certificate',
        id: 'event.divorce.action.declare.form.section.documents.field.marriageCertificate.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'marriageCertificate',
          label: {
            defaultMessage: 'Marriage certificate',
            description: 'Marriage certificate option',
            id: 'event.divorce.action.declare.form.section.documents.field.marriageCertificate.option.marriageCertificate'
          }
        },
        {
          value: 'other',
          label: {
            defaultMessage: 'Other',
            description: 'Other documents option',
            id: 'event.divorce.action.declare.form.section.documents.field.marriageCertificate.option.other'
          }
        }
      ]
    },
    // husband
    {
      id: 'documents.husbandsIdentity',
      type: FieldType.FILE_WITH_OPTIONS,
      analytics: true,
      required: false,
      label: {
        defaultMessage: "Proof of husband's identity",
        description: "Label for uploading husband's identity",
        id: 'event.divorce.action.declare.form.section.documents.field.husbandsIdentity.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },
    // wife
    {
      id: 'documents.wifesIdentity',
      type: FieldType.FILE_WITH_OPTIONS,
      analytics: true,
      required: false,
      label: {
        defaultMessage: "Proof of wife's identity",
        description: "Label for uploading proof of wife's identity ",
        id: 'event.divorce.action.declare.form.section.documents.field.wifesIdentity.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: idTypeOptions
    },

    {
      id: 'documents.divorceOrder',
      type: FieldType.FILE_WITH_OPTIONS,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Divorce order documents',
        description: 'Label for uploading divorce order',
        id: 'event.divorce.action.declare.form.section.documents.field.divorceOrder.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: [
        {
          value: 'divorceOrder',
          label: {
            defaultMessage: 'Divorce order',
            description: 'Divorce order option',
            id: 'event.divorce.action.declare.form.section.documents.field.divorceOrder.option.divorceOrder'
          }
        },
        {
          value: 'other',
          label: {
            defaultMessage: 'Other',
            description: 'Other documents option',
            id: 'event.divorce.action.declare.form.section.documents.field.divorceOrder.option.other'
          }
        }
      ]
    }
  ]
})
