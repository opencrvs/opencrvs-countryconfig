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

import { createSelectOptions } from '@countryconfig/form/v2/utils'
import {
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  not,
  or,
  TranslationConfig
} from '@opencrvs/toolkit/events'
import { requireMotherDetails } from './mother'
import { requireFatherDetails } from './father'
import { InformantType } from './informant'

const IdType = {
  NATIONAL_ID: 'NATIONAL_ID',
  PASSPORT: 'PASSPORT',
  BIRTH_CERTIFICATE: 'BIRTH_CERTIFICATE',
  OTHER: 'OTHER'
} as const

const idTypeMessageDescriptors = {
  NATIONAL_ID: {
    defaultMessage: 'National ID',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeNationalID'
  },
  PASSPORT: {
    defaultMessage: 'Passport',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypePassport'
  },
  BIRTH_CERTIFICATE: {
    defaultMessage: 'Birth Certificate',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeBirthCertificate'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Option for form field: Type of ID',
    id: 'v2.form.field.label.iDTypeOther'
  }
} satisfies Record<keyof typeof IdType, TranslationConfig>

const idTypeOptions = createSelectOptions(IdType, idTypeMessageDescriptors)

const Other = {
  PROOF_OF_LEGAL_GUARDIANSHIP: 'PROOF_OF_LEGAL_GUARDIANSHIP',
  PROOF_OF_ASSIGNED_RESPONSIBILITY: 'PROOF_OF_ASSIGNED_RESPONSIBILITY'
} as const

const otherMessageDescriptors = {
  PROOF_OF_LEGAL_GUARDIANSHIP: {
    defaultMessage: 'Proof of legal guardianship',
    description: 'Label for document option Proof of legal guardianship',
    id: 'v2.form.field.label.legalGuardianProof'
  },
  PROOF_OF_ASSIGNED_RESPONSIBILITY: {
    defaultMessage: 'Proof of assigned responsibility',
    description: 'Label for docuemnt option Proof of assigned responsibility',
    id: 'v2.form.field.label.assignedResponsibilityProof'
  }
} satisfies Record<keyof typeof Other, TranslationConfig>

const otherOptions = createSelectOptions(Other, otherMessageDescriptors)

export const documents = defineFormPage({
  id: 'documents',
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'v2.form.section.documents.title'
  },
  fields: [
    {
      id: 'documents.proofOfBirth',
      type: FieldType.FILE,
      required: false,
      options: {
        style: {
          fullWidth: true
        }
      },
      label: {
        defaultMessage: 'Proof of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfBirth.label'
      }
    },
    {
      id: 'documents.proofOfMother',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: "Proof of mother's ID",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfMother.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireMotherDetails
        }
      ]
    },

    {
      id: 'documents.proofOfFather',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: "Proof of father's ID",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfFather.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: requireFatherDetails
        }
      ]
    },
    {
      id: 'documents.proofOfInformant',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: "Proof of informant's ID",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOfInformant.label'
      },
      options: idTypeOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              field('informant.relation').isEqualTo(InformantType.MOTHER),
              field('informant.relation').isEqualTo(InformantType.FATHER)
            )
          )
        }
      ]
    },

    {
      id: 'documents.proofOther',
      type: FieldType.FILE_WITH_OPTIONS,
      required: false,
      label: {
        defaultMessage: 'Other',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.documents.field.proofOther.label'
      },
      options: otherOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(
            or(
              field('informant.relation').isEqualTo(InformantType.MOTHER),
              field('informant.relation').isEqualTo(InformantType.FATHER)
            )
          )
        }
      ]
    }
  ]
})
