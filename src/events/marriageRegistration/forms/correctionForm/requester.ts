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
  field,
  FieldConfig,
  FieldType,
  not,
  or
} from '@opencrvs/toolkit/events'
import { IdType, idTypeOptions } from '@countryconfig/events/utils'
import {
  InformantType,
  InformantTypeKey
} from '@countryconfig/events/birth/forms/pages/informant'
import { passportIdValidator } from '../../validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'
import { informantMessageDescriptors } from '@countryconfig/events/utils'

// Helper to create option with conditional for informant type
const createInformantOption = (informantType: InformantTypeKey) => {
  const defaultMessage =
    informantType === InformantType.OTHER
      ? `Informant ({informant.other.relation})`
      : informantType === InformantType.MOTHER_AND_FATHER
        ? 'Informant (Mother and Father)'
        : `Informant (${informantMessageDescriptors[informantType].defaultMessage})`

  return {
    label: {
      id: `v2.event.marriageRegistration.action.correction.form.section.requester.informant.${informantType.toLowerCase()}.label`,
      defaultMessage,
      description: 'This is the label for the field'
    },
    value: 'INFORMANT',
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('informant.relation').isEqualTo(informantType)
      }
    ]
  }
}

// Father option - shown when father exists
const fatherOption = {
  label: {
    id: 'event.marriageRegistration.action.correction.form.section.requester.father.label',
    defaultMessage: 'Father',
    description: 'This is the label for the field'
  },
  value: InformantType.FATHER,
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(field('father.name').isFalsy())
    }
  ]
}

// Mother option - shown when mother exists
const motherOption = {
  label: {
    id: 'event.marriageRegistration.action.correction.form.section.requester.mother.label',
    defaultMessage: 'Mother',
    description: 'This is the label for the field'
  },
  value: InformantType.MOTHER,
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: not(field('mother.name').isFalsy())
    }
  ]
}

// Common options - always shown (no conditionals needed)
const commonOptions = [
  {
    value: 'CHILD',
    label: {
      id: 'event.marriageRegistration.action.correction.form.requester.type.child',
      defaultMessage: 'Person named on the record',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'ANOTHER_AGENT',
    label: {
      id: 'event.marriageRegistration.action.correction.form.requester.type.anotherAgent',
      defaultMessage: 'Registrar / Registration office',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'ME',
    label: {
      id: 'event.marriageRegistration.action.correction.form.requester.type.me',
      defaultMessage: 'Registrar / Registration office',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'COURT',
    label: {
      id: 'event.marriageRegistration.action.correction.form.requester.type.court',
      defaultMessage: 'Court',
      description: 'This is the label for the correction requester field'
    }
  },
  {
    value: 'SOMEONE_ELSE',
    label: {
      id: 'event.marriageRegistration.action.correction.form.requester.type.someoneElse',
      defaultMessage: 'Someone else',
      description: 'This is the label for the correction requester field'
    }
  }
]

// All options with option-level conditionals
const requesterTypeOptions = [
  createInformantOption(InformantType.MOTHER),
  createInformantOption(InformantType.FATHER),
  createInformantOption(InformantType.OTHER),
  fatherOption,
  motherOption,
  ...commonOptions
]

export const correctionFormRequesters: FieldConfig[] = [
  // Single requester.type field with option-level conditionals
  {
    id: 'requester.type',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: or(
          field('informant.relation').isEqualTo(InformantType.MOTHER),
          field('informant.relation').isEqualTo(InformantType.FATHER),
          field('informant.relation').isEqualTo(InformantType.OTHER)
        )
      }
    ],
    options: requesterTypeOptions
  },
  {
    id: 'requester.idType',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Type of ID',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.idType.label'
    },
    options: idTypeOptions,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.passport',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.passport.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.PASSPORT)
        )
      }
    ],
    validation: [passportIdValidator('requester.passport')],

    parent: field('informant.relation')
  },
  {
    id: 'requester.brn',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.brn.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.BIRTH_CERTIFICATE)
        )
      }
    ],
    validation: [passportIdValidator('requester.brn')]
  },
  {
    id: 'requester.other',
    type: FieldType.TEXT,
    required: false,
    label: {
      defaultMessage: 'ID Number',
      description: 'This is the label for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: and(
          field('requester.type').isEqualTo('SOMEONE_ELSE'),
          field('requester.idType').isEqualTo(IdType.OTHER)
        )
      }
    ],
    validation: [passportIdValidator('requester.other')]
  },
  {
    id: 'requester.relationship',
    type: FieldType.TEXT,
    required: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.relationship.label',
      defaultMessage: 'Relationship to child',
      description: 'This is the label for the field'
    },
    placeholder: {
      defaultMessage: 'eg. Grandmother',
      description: 'This is the placeholder for the field',
      id: 'event.marriageRegistration.action.correction.form.section.requester.relationship.placeholder'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.name',
    type: FieldType.NAME,
    configuration: { maxLength: MAX_NAME_LENGTH },
    required: true,
    hideLabel: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.name.label',
      defaultMessage: 'Name',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ]
  },
  {
    id: 'requester.dob',
    type: FieldType.DATE,
    required: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.dob.label',
      defaultMessage: 'Date of birth',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    validation: [
      {
        message: {
          defaultMessage: 'Date cannot be in the future',
          description: 'This is the error message for invalid date',
          id: 'event.marriageRegistration.action.correction.form.section.requester.dob.error'
        },
        validator: field('requester.dob').isBefore().now()
      }
    ]
  },
  {
    id: 'requester.nationality',
    type: FieldType.COUNTRY,
    required: true,
    label: {
      id: 'event.marriageRegistration.action.correction.form.section.requester.nationality.label',
      defaultMessage: 'Nationality',
      description: 'This is the label for the field'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    defaultValue: 'COK'
  }
]
