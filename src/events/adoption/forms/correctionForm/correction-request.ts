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
 * Page 1 - Correction Request
 * Fields: A1 (Requester), A2 (Reason for correction), A2.1 (Other reason)
 */

export const correctionRequestFields: FieldConfig[] = [
  // A1 - Requester
  {
    id: 'requester.type',
    type: FieldType.SELECT,
    required: true,
    label: {
      defaultMessage: 'Requester',
      description: 'This is the label for the field',
      id: 'event.adoption.action.correction.form.section.requester.label'
    },
    options: [
      {
        value: 'REGISTRAR',
        label: {
          id: 'event.adoption.action.correction.form.requester.type.registrar',
          defaultMessage: 'Registrar / Registration office',
          description: 'This is the label for the correction requester field'
        }
      },
      {
        value: 'COURT',
        label: {
          id: 'event.adoption.action.correction.form.requester.type.court',
          defaultMessage: 'Court',
          description: 'This is the label for the correction requester field'
        }
      },
      {
        value: 'SOMEONE_ELSE',
        label: {
          id: 'event.adoption.action.correction.form.requester.type.someoneElse',
          defaultMessage: 'Someone else',
          description: 'This is the label for the correction requester field'
        }
      }
    ]
  },
  // A2 - Reason for correction
  {
    id: 'reason.option',
    type: FieldType.SELECT,
    required: true,
    label: {
      id: 'event.adoption.action.correction.form.section.reason.title',
      defaultMessage: 'Reason for correction',
      description: 'This is the title of the section'
    },
    options: [
      {
        value: 'CLERICAL_ERROR',
        label: {
          defaultMessage: 'Myself or an agent made a mistake (Clerical error)',
          description: 'Label for the clerical error option',
          id: 'event.adoption.action.correction.reason.option.clericalError.label'
        }
      },
      {
        value: 'MATERIAL_ERROR',
        label: {
          defaultMessage:
            'Informant provided incorrect information (Material error)',
          description: 'Label for the material error option',
          id: 'event.adoption.action.correction.reason.option.materialError.label'
        }
      },
      {
        value: 'MATERIAL_OMISSION',
        label: {
          defaultMessage:
            'Informant did not provide this information (Material omission)',
          description: 'Label for the material omission option',
          id: 'event.adoption.action.correction.reason.option.materialOmission.label'
        }
      },
      {
        value: 'JUDICIAL_ORDER',
        label: {
          defaultMessage: 'Requested to do so by the court (Judicial order)',
          description: 'Label for the judicial order option',
          id: 'event.adoption.action.correction.reason.option.judicialOrder.label'
        }
      },
      {
        value: 'OTHER',
        label: {
          defaultMessage: 'Other (please specify)',
          description: 'Label for the other option',
          id: 'event.adoption.action.correction.reason.option.other.label'
        }
      }
    ]
  },
  // A2.1 - Other reason (conditional on A2 = "Other")
  {
    id: 'reason.other',
    type: FieldType.TEXT,
    required: true,
    label: {
      defaultMessage: 'Other reason (please specify)',
      description: 'Label for the reason',
      id: 'event.adoption.action.correction.reason.other.label'
    },
    conditionals: [
      {
        type: ConditionalType.SHOW,
        conditional: field('reason.option').isEqualTo('OTHER')
      }
    ]
  }
]
