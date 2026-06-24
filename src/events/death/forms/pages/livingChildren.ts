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
  field,
  FieldType,
  PageTypes
} from '@opencrvs/toolkit/events'

const numberOfChildrenOptions = Array.from({ length: 15 }, (_, i) => ({
  value: String(i + 1),
  label: {
    defaultMessage: String(i + 1),
    description: `Option for number of children: ${i + 1}`,
    id: `event.death.action.declare.form.section.livingChildren.field.numberOfChildren.option.${i + 1}`
  }
}))

const childSexOptions = [
  {
    value: 'MALE',
    label: {
      defaultMessage: 'Male',
      description: 'Option for child sex: male',
      id: 'event.death.action.declare.form.section.livingChildren.field.child.sex.option.male'
    }
  },
  {
    value: 'FEMALE',
    label: {
      defaultMessage: 'Female',
      description: 'Option for child sex: female',
      id: 'event.death.action.declare.form.section.livingChildren.field.child.sex.option.female'
    }
  }
]

const ageUnitOptions = [
  {
    value: 'DAYS',
    label: {
      defaultMessage: 'Days',
      description: 'Unit for age: days',
      id: 'event.death.action.declare.form.section.livingChildren.field.child.age.unit.days'
    }
  },
  {
    value: 'MONTHS',
    label: {
      defaultMessage: 'Months',
      description: 'Unit for age: months',
      id: 'event.death.action.declare.form.section.livingChildren.field.child.age.unit.months'
    }
  },
  {
    value: 'YEARS',
    label: {
      defaultMessage: 'Years',
      description: 'Unit for age: years',
      id: 'event.death.action.declare.form.section.livingChildren.field.child.age.unit.years'
    }
  }
]

/** Generate the 4 fields (header, name, sex, age) for each child N */
function childFields(n: number) {
  const showConditional = {
    type: ConditionalType.SHOW,
    conditional: field('livingChildren.numberOfChildren').inArray(
      Array.from({ length: 15 - n + 1 }, (_, i) => String(n + i))
    )
  } as const

  return [
    {
      id: `livingChildren.child${n}.header`,
      type: FieldType.HEADING,
      label: {
        defaultMessage: `Child Number ${n}`,
        description: `Header for child ${n}`,
        id: `event.death.action.declare.form.section.livingChildren.field.child${n}.header.label`
      },
      configuration: {
        styles: { fontVariant: 'h3' as const }
      },
      conditionals: [showConditional]
    },
    {
      id: `livingChildren.child${n}.fullName`,
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Full Name',
        description: `Full name of child ${n}`,
        id: `event.death.action.declare.form.section.livingChildren.field.child${n}.fullName.label`
      },
      conditionals: [showConditional]
    },
    {
      id: `livingChildren.child${n}.sex`,
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Sex',
        description: `Sex of child ${n}`,
        id: `event.death.action.declare.form.section.livingChildren.field.child${n}.sex.label`
      },
      options: childSexOptions,
      conditionals: [showConditional]
    },
    {
      id: `livingChildren.child${n}.age`,
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      label: {
        defaultMessage: 'Age',
        description: `Age of child ${n}`,
        id: `event.death.action.declare.form.section.livingChildren.field.child${n}.age.label`
      },
      options: ageUnitOptions,
      defaultValue: { numericValue: 0, unit: 'YEARS' },
      conditionals: [showConditional]
    }
  ]
}

// Build all child field sets for children 1–15
const allChildFields = Array.from({ length: 15 }, (_, i) =>
  childFields(i + 1)
).flat()

export const livingChildren = defineFormPage({
  id: 'livingChildren',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Living children details',
    description: 'Form section title for living children details',
    id: 'form.death.livingChildren.title'
  },
  conditional: field('deceased.hasLivingChildren').isEqualTo('YES'),
  fields: [
    // ---- Number of living children ----
    {
      id: 'livingChildren.numberOfChildren',
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Number of children (living)',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.livingChildren.field.numberOfChildren.label'
      },
      options: numberOfChildrenOptions
    },
    // ---- Per-child fields (1–15) ----
    ...allChildFields
  ]
})
