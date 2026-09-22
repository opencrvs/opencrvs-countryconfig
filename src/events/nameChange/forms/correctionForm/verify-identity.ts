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
  field,
  FieldConfig,
  FieldType
} from '@opencrvs/toolkit/events'

/**
 * Page 3a - Verify Their Identity
 * Display the requester's information for verification
 */

export const verifyIdentityFields: FieldConfig[] = [
  // Display data for "Person whose name is being changed"
  {
    id: 'requester.identity.verify.data.personWhoseNameIsBeingChanged',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo(
          'PERSON_WHOSE_NAME_IS_BEING_CHANGED'
        )
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.nameChange.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'newName.name.firstname' },
        { fieldId: 'newName.name.surname' },
        { fieldId: 'subjects.dob' },
        { fieldId: 'subjects.nationality' }
      ]
    }
  },
  // Display data for "Mother"
  {
    id: 'requester.identity.verify.data.mother',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('MOTHER')
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.nameChange.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'mother.idType' },
        { fieldId: 'mother.name' },
        { fieldId: 'mother.dob' },
        { fieldId: 'mother.nationality' }
      ]
    }
  },
  // Display data for "Father"
  {
    id: 'requester.identity.verify.data.father',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('FATHER')
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.nameChange.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'father.idType' },
        { fieldId: 'father.name' },
        { fieldId: 'father.dob' },
        { fieldId: 'father.nationality' }
      ]
    }
  },
  // Display data for "Someone Else"
  {
    id: 'requester.identity.verify.data.someoneElse',
    type: FieldType.DATA,
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('requester.type').isEqualTo('SOMEONE_ELSE')
      }
    ],
    label: {
      defaultMessage: '',
      description: 'Title for the data section',
      id: 'event.nameChange.action.correction.form.section.verifyIdentity.data.label'
    },
    configuration: {
      data: [
        { fieldId: 'requester.idType' },
        { fieldId: 'requester.passport' },
        { fieldId: 'requester.brn' },
        { fieldId: 'requester.other' },
        { fieldId: 'requester.name' },
        { fieldId: 'requester.dob' },
        { fieldId: 'requester.nationality' }
      ]
    }
  }
]
