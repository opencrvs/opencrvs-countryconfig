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
  defineFormPage,
  DocumentMimeType,
  field,
  FieldType,
  ImageMimeType,
  PageTypes
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

const DEFAULT_FILE_CONFIGURATION = {
  maxFileSize: 5 * 1024 * 1024,
  acceptedFileTypes: [
    ImageMimeType.enum['image/jpeg'],
    ImageMimeType.enum['image/png'],
    ImageMimeType.enum['image/jpg'],
    DocumentMimeType.enum['application/pdf']
  ]
}

const proofOfDeathOptions = [
  {
    value: 'POLICE_REPORT',
    label: {
      defaultMessage: 'Police report',
      description: 'Option for proof of death: police report',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeath.option.policeReport'
    }
  },
  {
    value: 'MAGISTRATE_INQUIRY_REPORT',
    label: {
      defaultMessage: 'Magistrate inquiry report',
      description: 'Option for proof of death: magistrate inquiry report',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeath.option.magistrateInquiry'
    }
  },
  {
    value: 'MEDICAL_CERTIFICATE',
    label: {
      defaultMessage: 'Medical certificate',
      description: 'Option for proof of death: medical certificate',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeath.option.medicalCertificate'
    }
  },
  {
    value: 'OTHER',
    label: {
      defaultMessage: 'Other',
      description: 'Option for proof of death: other',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeath.option.other'
    }
  }
]

const proofOfDeceasedIdentityOptions = [
  {
    value: 'BIRTH_CERTIFICATE',
    label: {
      defaultMessage: 'Birth certificate',
      description: 'Option for proof of deceased identity: birth certificate',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeceasedIdentity.option.birthCertificate'
    }
  },
  {
    value: 'PASSPORT',
    label: {
      defaultMessage: 'Passport',
      description: 'Option for proof of deceased identity: passport',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeceasedIdentity.option.passport'
    }
  },
  {
    value: 'OTHER',
    label: {
      defaultMessage: 'Other',
      description: 'Option for proof of deceased identity: other',
      id: 'event.death.action.declare.form.section.documents.field.proofOfDeceasedIdentity.option.other'
    }
  }
]

const proofOfInformantIdentityOptions = [
  {
    value: 'BIRTH_CERTIFICATE',
    label: {
      defaultMessage: 'Birth certificate',
      description: 'Option for proof of informant identity: birth certificate',
      id: 'event.death.action.declare.form.section.documents.field.proofOfInformantIdentity.option.birthCertificate'
    }
  },
  {
    value: 'PASSPORT',
    label: {
      defaultMessage: 'Passport',
      description: 'Option for proof of informant identity: passport',
      id: 'event.death.action.declare.form.section.documents.field.proofOfInformantIdentity.option.passport'
    }
  },
  {
    value: 'OTHER',
    label: {
      defaultMessage: 'Other',
      description: 'Option for proof of informant identity: other',
      id: 'event.death.action.declare.form.section.documents.field.proofOfInformantIdentity.option.other'
    }
  }
]

const overseasBurialDocOptions = [
  {
    value: 'TRANSFER_AUTHORISATION',
    label: {
      defaultMessage: 'Transfer authorisation',
      description: 'Option for removal/overseas burial: transfer authorisation',
      id: 'event.death.action.declare.form.section.documents.field.removalOverseasBurial.option.transferAuthorisation'
    }
  },
  {
    value: 'OTHER',
    label: {
      defaultMessage: 'Other',
      description: 'Option for removal/overseas burial: other',
      id: 'event.death.action.declare.form.section.documents.field.removalOverseasBurial.option.other'
    }
  }
]

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Supporting documents',
    description: 'Form section title for documents',
    id: 'form.section.documents.title'
  },
  fields: [
    // ---- Proof of death ----
    {
      id: 'documents.proofOfDeath',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Proof of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfDeath.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfDeathOptions
    },
    // ---- Proof of deceased's identity ----
    {
      id: 'documents.proofOfDeceasedIdentity',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: "Proof of deceased's identity",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfDeceasedIdentity.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfDeceasedIdentityOptions
    },
    // ---- Proof of informant's identity ----
    {
      id: 'documents.proofOfInformantIdentity',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      uncorrectable: true,
      label: {
        defaultMessage: "Proof of informant's identity",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.proofOfInformantIdentity.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: proofOfInformantIdentityOptions
    },
    // ---- Removal / overseas burial (shown if burial not in Tuvalu) ----
    {
      id: 'documents.removalOverseasBurial',
      type: FieldType.FILE_WITH_OPTIONS,
      uncorrectable: true,
      required: false,
      label: {
        defaultMessage: 'Removal or overseas burial documentation',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.documents.field.removalOverseasBurial.label'
      },
      configuration: DEFAULT_FILE_CONFIGURATION,
      options: overseasBurialDocOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            field('burial.arrangement').isEqualTo('BURIAL_IN_TUVALU')
          )
        }
      ]
    }
  ]
})
