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
import {
  ConditionalType,
  field,
  FieldConfig,
  FieldType,
  ImageMimeType
} from '@opencrvs/toolkit/events'

/**
 * Page 4 - Supporting Documents
 * Fields: D1 (Proof of identity - conditional), D2 (Supporting documents)
 */

export const supportingDocumentsFields: FieldConfig[] = [
  // D1 - Proof of identity (show if requester is "Someone else")
  {
    id: 'documents.proofOfIdentity',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    label: {
      defaultMessage: 'Proof of identity',
      description: 'Label for the proof of identity field',
      id: 'event.nameChange.action.correction.documents.proofOfIdentity.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'PASSPORT',
        label: {
          defaultMessage: 'Passport',
          description: 'Label for the passport option',
          id: 'event.nameChange.action.correction.documents.proofOfIdentity.passport.label'
        }
      },
      {
        value: 'BIRTH_CERTIFICATE',
        label: {
          defaultMessage: 'Birth certificate',
          description: 'Label for the birth certificate option',
          id: 'event.nameChange.action.correction.documents.proofOfIdentity.birthCertificate.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.nameChange.action.correction.documents.proofOfIdentity.other.label'
        }
      }
    ],
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  // D2 - Supporting documents
  {
    id: 'documents.supportingDocs',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    label: {
      defaultMessage: 'Supporting documents',
      description: 'Label for the supporting documents field',
      id: 'event.nameChange.action.correction.documents.supportingDocs.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'SIGNED_DEED_POLL',
        label: {
          defaultMessage: 'Signed deed poll',
          description: 'Label for the signed deed poll option',
          id: 'event.nameChange.action.correction.documents.supportingDocs.signedDeedPoll.label'
        }
      },
      {
        value: 'PERSONAL_STATEMENT',
        label: {
          defaultMessage: 'Personal statement',
          description: 'Label for the personal statement option',
          id: 'event.nameChange.action.correction.documents.supportingDocs.personalStatement.label'
        }
      },
      {
        value: 'STATUTORY_DECLARATION',
        label: {
          defaultMessage: 'Statutory declaration',
          description: 'Label for the statutory declaration option',
          id: 'event.nameChange.action.correction.documents.supportingDocs.statutoryDeclaration.label'
        }
      },
      {
        value: 'COURT_ORDER',
        label: {
          defaultMessage: 'Court order',
          description: 'Label for the court order option',
          id: 'event.nameChange.action.correction.documents.supportingDocs.courtOrder.label'
        }
      },
      {
        value: 'MARRIAGE_CERTIFICATE',
        label: {
          defaultMessage: 'Marriage certificate',
          description: 'Label for the marriage certificate option',
          id: 'event.nameChange.action.correction.documents.supportingDocs.marriageCertificate.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.nameChange.action.correction.documents.supportingDocs.other.label'
        }
      }
    ]
  }
]
