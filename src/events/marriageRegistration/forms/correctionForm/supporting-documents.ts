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
  // Proof of identity - General document upload
  {
    id: 'documents.proofOfIdentityGeneral',
    type: FieldType.FILE_WITH_OPTIONS,
    required: false,
    label: {
      defaultMessage: 'Proof of identity',
      description: 'Label for the general proof of identity field',
      id: 'event.marriageLicense.action.correction.documents.proofOfIdentityGeneral.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'PASSPORT',
        label: {
          defaultMessage: 'Passport',
          description: 'Label for the passport option',
          id: 'event.marriageLicense.action.correction.documents.proofOfIdentityGeneral.passport.label'
        }
      },
      {
        value: 'BIRTH_CERTIFICATE',
        label: {
          defaultMessage: 'Birth certificate',
          description: 'Label for the birth certificate option',
          id: 'event.marriageLicense.action.correction.documents.proofOfIdentityGeneral.birthCertificate.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.marriageLicense.action.correction.documents.proofOfIdentityGeneral.other.label'
        }
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
      id: 'event.marriageRegistration.action.correction.documents.supportingDocs.label'
    },
    configuration: DEFAULT_FILE_CONFIGURATION,
    options: [
      {
        value: 'PROOF_OF_BRIDEGROOM_IDENTITY',
        label: {
          defaultMessage: "Proof of Bridegroom's identity",
          description: 'Label for the proof of bridegroom identity option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.proofOfBridegroomIdentity.label'
        }
      },
      {
        value: 'PROOF_OF_BRIDE_IDENTITY',
        label: {
          defaultMessage: "Proof of Bride's identity",
          description: 'Label for the proof of bride identity option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.proofOfBrideIdentity.label'
        }
      },
      {
        value: 'PARTICULARS_OF_MARRIAGE',
        label: {
          defaultMessage: 'Particulars of marriage for registration',
          description: 'Label for the particulars of marriage option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.particularsOfMarriage.label'
        }
      },
      {
        value: 'DEGREE_ABSOLUTE',
        label: {
          defaultMessage: 'Degree absolute / final divorce order',
          description:
            'Label for the degree absolute or final divorce order option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.degreeAbsolute.label'
        }
      },
      {
        value: 'STATUTORY_DECLARATION',
        label: {
          defaultMessage: 'Statutory declaration',
          description: 'Label for the statutory declaration option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.statutoryDeclaration.label'
        }
      },
      {
        value: 'REGISTRAR_GENERAL_AUTHORISATION',
        label: {
          defaultMessage: 'Registrar general / registrar authorisation',
          description: 'Label for the registrar general authorisation option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.registrarGeneralAuthorisation.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other',
          description: 'Label for the other option',
          id: 'event.marriageRegistration.action.correction.documents.supportingDocs.other.label'
        }
      }
    ]
  }
]
