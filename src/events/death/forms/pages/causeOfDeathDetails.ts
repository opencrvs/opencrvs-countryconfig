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
  FieldType,
  never,
  not,
  or
} from '@opencrvs/toolkit/events'
import { COUNTRY_CONFIG_URL } from '@countryconfig/constants'

const durationOptions = [
  {
    value: 'Seconds',
    label: {
      id: 'unit.seconds',
      defaultMessage: 'Seconds',
      description: 'Seconds'
    }
  },
  {
    value: 'Minutes',
    label: {
      id: 'unit.minutes',
      defaultMessage: 'Minutes',
      description: 'Minutes'
    }
  },
  {
    value: 'Hours',
    label: {
      id: 'unit.hours',
      defaultMessage: 'Hours',
      description: 'Hours'
    }
  },
  {
    value: 'Days',
    label: {
      id: 'unit.days',
      defaultMessage: 'Days',
      description: 'Days'
    }
  },
  {
    value: 'Weeks',
    label: {
      id: 'unit.weeks',
      defaultMessage: 'Weeks',
      description: 'Weeks'
    }
  },
  {
    value: 'Months',
    label: {
      id: 'unit.months',
      defaultMessage: 'Months',
      description: 'Months'
    }
  },
  {
    value: 'Years',
    label: {
      id: 'unit.years',
      defaultMessage: 'Years',
      description: 'Years'
    }
  }
]

export type CauseLetter = 'A' | 'B' | 'C' | 'D' | 'Other'

export const symptomNumber = [
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight'
] as const

function getLabelForCause(
  letter: CauseLetter,
  index: number,
  basePath: string
) {
  switch (letter) {
    case 'A':
      return {
        defaultMessage: `A.${index + 1}. Direct cause`,
        description: 'This is the label for the field',
        id: `${basePath}.label`
      }
    case 'Other':
      return {
        defaultMessage: `${index + 1}. Other significant cause`,
        description: 'This is the label for the field',
        id: `${basePath}.label`
      }
    default:
      return {
        defaultMessage: `${letter}.${index + 1}. Antecedent cause`,
        description: 'This is the label for the field',
        id: `${basePath}.label`
      }
  }
}

function createSymptomFields(letter: CauseLetter) {
  return symptomNumber.flatMap((number, index) => {
    const basePath = `causeOfDeathDetails.causeOfDeath${letter}.symptom.${number}`

    const autocompleteField: any = {
      id: basePath,
      type: FieldType.AUTOCOMPLETE,
      analytics: true,
      label: getLabelForCause(letter, index, basePath),
      configuration: {
        url: `${COUNTRY_CONFIG_URL}/causes-of-death?terms=`,
        defaultOptions: [{ label: 'Other', value: 'OTHER' }]
      }
    }

    if (index === 0) {
      autocompleteField.helperText = {
        defaultMessage:
          'Select the condition that most directly led to death, or choose "Other" to enter a diagnosis not listed',
        description: 'This is the label for the field',
        id: `causeOfDeathDetails.causeOfDeath${letter}.symptom.one.helperText`
      }
    }

    if (index > 0) {
      autocompleteField.conditionals = [
        {
          type: ConditionalType.SHOW,
          conditional: field(
            `causeOfDeathDetails.causeOfDeath${letter}.add.symptom.button`
          ).isGreaterThan(index - 1)
        }
      ]
    }

    const otherField = {
      id: `${basePath}.other`,
      type: FieldType.TEXTAREA,
      required: true,
      analytics: true,
      label: {
        defaultMessage:
          'Enter the diagnosis or condition not found in the list above',
        description: 'This is the label for the field',
        id: `${basePath}.other.label`
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(basePath).get('value').isEqualTo('OTHER')
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Must not contain semicolon(s)',
            description: 'This is the label for the field',
            id: 'event.death.action.declare.other.condition.error'
          },
          validator: field(`${basePath}.other`).matches('^[^;]*$')
        }
      ]
    }

    return [autocompleteField, otherField]
  })
}

function applyShowConditional(fields: any[], showConditional: any): any[] {
  return fields.map((f) => {
    const existing: any[] = f.conditionals ?? []
    const showIdx = existing.findIndex(
      (c: any) => c.type === ConditionalType.SHOW
    )
    if (showIdx >= 0) {
      const updated = [...existing]
      updated[showIdx] = {
        type: ConditionalType.SHOW,
        conditional: and(showConditional, updated[showIdx].conditional)
      }
      return { ...f, conditionals: updated }
    }
    return {
      ...f,
      conditionals: [
        { type: ConditionalType.SHOW, conditional: showConditional },
        ...existing
      ]
    }
  })
}

export function createCauseOfDeathFields(letter: CauseLetter, showConditional?: any) {
  const base = `causeOfDeathDetails.causeOfDeath${letter}`

  const fields = [
    {
      id: base,
      type: FieldType.HEADING,
      label: {
        defaultMessage:
          letter === 'Other'
            ? 'Part II: Other significant causes'
            : `${letter}. Cause of death`,
        description: 'This is the label for the field',
        id: `${base}.label`
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },
    ...createSymptomFields(letter),
    {
      id: `${base}.interval`,
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'This is the label for the field',
        id: `spcCodingGroup.causeOfDeath${letter}.interval.helperText`
      },
      label: {
        defaultMessage: 'Duration',
        description: 'This is the label for the field',
        id: `spcCodingGroup.causeOfDeath${letter}.interval`
      },
      options: durationOptions
    }
  ]
  return showConditional ? applyShowConditional(fields, showConditional) : fields
}
