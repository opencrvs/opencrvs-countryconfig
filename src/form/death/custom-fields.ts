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

import { Conditional, SerializedFormField } from '../types/types'
import { getCustomFieldMapping } from '@countryconfig/utils/mapping/field-mapping-utils'

export function getNumberOfDependants(): SerializedFormField {
  const fieldName: string = 'numberOfDependants'
  const fieldId: string = `death.deceased.deceased-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'NUMBER',
    label: {
      id: 'form.customField.label.numberOfDependants',
      description:
        'A form field that asks for the persons number of dependants.',
      defaultMessage: 'No. of dependants'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: []
  }
}

export function getTimeOfDeath(): SerializedFormField {
  const fieldName: string = 'deathTime'
  const fieldId: string = `death.deathEvent.death-event-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: true,
    type: 'TIME',
    label: {
      id: 'form.field.label.timeOfDeath',
      description: 'Label for field time of death',
      defaultMessage: 'Time of death'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: []
  }
}

export function getOtherMannerOfDeath(): SerializedFormField {
  const fieldName: string = 'otherMannerOfDeath'
  const fieldId: string = `death.deathEvent.death-event-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    required: false,
    type: 'TEXT',
    label: {
      id: 'form.field.label.specifyOther',
      description: 'Label for field specify other',
      defaultMessage: 'Please specify'
    },
    initialValue: '',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals: [
      {
        action: 'hide',
        expression: 'values.mannerOfDeath !== "OTHER"'
      }
    ]
  }
}

export function getInformantPresenceAtDeath(
  conditionals: Conditional[]
): SerializedFormField {
  const fieldName: string = 'informantWasPresentAtDeath'
  const fieldId: string = `death.informant.informant-view-group.${fieldName}`

  return {
    name: fieldName,
    customQuestionMappingId: fieldId,
    custom: true,
    checkedValue: 'true',
    uncheckedValue: 'false',
    required: false,
    type: 'CHECKBOX',
    hideHeader: true,
    label: {
      id: 'form.field.label.informantWasPresentAtDeath',
      defaultMessage: 'Was informant present at death?'
    },
    initialValue: 'false',
    validator: [],
    mapping: getCustomFieldMapping(fieldId),
    conditionals
  }
}
