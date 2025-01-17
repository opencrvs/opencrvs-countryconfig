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

import { defineFormPage, TranslationConfig } from '@opencrvs/toolkit/events'
import { field } from '@opencrvs/toolkit/conditionals'
import { appendConditionalsToFields, createSelectOptions } from '../../utils'
import { AddressType, getAddressFields } from '../../person/address'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
} as const

const TypeOfBirth = {
  SINGLE: 'SINGLE',
  TWIN: 'TWIN',
  TRIPLET: 'TRIPLET',
  QUADRUPLET: 'QUADRUPLET',
  HIGHER_MULTIPLE_DELIVERY: 'HIGHER_MULTIPLE_DELIVERY'
} as const

const AttendantAtBirth = {
  PHYSICIAN: 'PHYSICIAN',
  NURSE: 'NURSE',
  MIDWIFE: 'MIDWIFE',
  OTHER_PARAMEDICAL_PERSONNEL: 'OTHER_PARAMEDICAL_PERSONNEL',
  LAYPERSON: 'LAYPERSON',
  TRADITIONAL_BIRTH_ATTENDANT: 'TRADITIONAL_BIRTH_ATTENDANT',
  NONE: 'NONE'
} as const

const PlaceOfBirth = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  PRIVATE_HOME: 'PRIVATE_HOME',
  OTHER: 'OTHER'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'form.field.label.sexFemale'
  },
  UNKNOWN: {
    defaultMessage: 'Unknown',
    description: 'Label for option unknown',
    id: 'form.field.label.sexUnknown'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const typeOfBirthMessageDescriptors = {
  SINGLE: {
    defaultMessage: 'Single',
    description: 'Label for single birth',
    id: 'form.field.label.birthTypeSingle'
  },
  TWIN: {
    defaultMessage: 'Twin',
    description: 'Label for twin birth',
    id: 'form.field.label.birthTypeTwin'
  },
  TRIPLET: {
    defaultMessage: 'Triplet',
    description: 'Label for triplet birth',
    id: 'form.field.label.birthTypeTriplet'
  },
  QUADRUPLET: {
    defaultMessage: 'Quadruplet',
    description: 'Label for quadruplet birth',
    id: 'form.field.label.birthTypeQuadruplet'
  },
  HIGHER_MULTIPLE_DELIVERY: {
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for higher multiple delivery birth',
    id: 'form.field.label.birthTypeHigherMultipleDelivery'
  }
} satisfies Record<keyof typeof TypeOfBirth, TranslationConfig>

const attendantAtBirthMessageDescriptors = {
  PHYSICIAN: {
    defaultMessage: 'Physician',
    description: 'Label for physician attendant',
    id: 'form.field.label.attendantAtBirthPhysician'
  },
  NURSE: {
    defaultMessage: 'Nurse',
    description: 'Label for nurse attendant',
    id: 'form.field.label.attendantAtBirthNurse'
  },
  MIDWIFE: {
    defaultMessage: 'Midwife',
    description: 'Label for midwife attendant',
    id: 'form.field.label.attendantAtBirthMidwife'
  },
  OTHER_PARAMEDICAL_PERSONNEL: {
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for other paramedical personnel',
    id: 'form.field.label.attendantAtBirthOtherParamedicalPersonnel'
  },
  LAYPERSON: {
    defaultMessage: 'Layperson',
    description: 'Label for layperson attendant',
    id: 'form.field.label.attendantAtBirthLayperson'
  },
  TRADITIONAL_BIRTH_ATTENDANT: {
    defaultMessage: 'Traditional birth attendant',
    description: 'Label for traditional birth attendant',
    id: 'form.field.label.attendantAtBirthTraditionalBirthAttendant'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Label for no attendant',
    id: 'form.field.label.attendantAtBirthNone'
  }
} satisfies Record<keyof typeof AttendantAtBirth, TranslationConfig>

const placeOfBirthMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  PRIVATE_HOME: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'form.field.label.privateHome'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfBirth, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

const placeOfBirthOptions = createSelectOptions(
  PlaceOfBirth,
  placeOfBirthMessageDescriptors
)

const typeOfBirthOptions = createSelectOptions(
  TypeOfBirth,
  typeOfBirthMessageDescriptors
)

const attendantAtBirthOptions = createSelectOptions(
  AttendantAtBirth,
  attendantAtBirthMessageDescriptors
)

export const childPage = defineFormPage({
  id: 'child',
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.birth.child.title'
  },
  fields: [
    {
      id: 'child.firstname',
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.firstname.label'
      }
    },
    {
      id: 'child.surname',
      type: 'TEXT',
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.surname.label'
      }
    },
    {
      id: 'child.gender',
      type: 'SELECT',
      required: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.gender.label'
      },
      options: genderOptions
    },
    {
      id: 'child.dob',
      type: 'DATE',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Please enter a valid date',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBeforeNow()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.dob.label'
      }
    },
    {
      id: 'child.placeOfBirth',
      type: 'SELECT',
      required: true,
      label: {
        defaultMessage: 'Place of delivery',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.placeOfBirth.label'
      },
      options: placeOfBirthOptions
    },
    {
      id: 'child.birthLocation',
      type: 'LOCATION',
      required: true,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      options: {
        type: 'HEALTH_FACILITY'
      },
      conditionals: [
        {
          type: 'HIDE',
          conditional: field('child.placeOfBirth').isUndefinedOrNotInArray([
            'HEALTH_FACILITY'
          ])
        }
      ]
    },
    ...appendConditionalsToFields({
      inputFields: getAddressFields(AddressType.childResidentialAddress),
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field('child.placeOfBirth').isUndefinedOrNotInArray([
            'PRIVATE_HOME'
          ])
        }
      ]
    }),
    ...appendConditionalsToFields({
      inputFields: getAddressFields(AddressType.childOther),
      newConditionals: [
        {
          type: 'HIDE',
          conditional: field('child.placeOfBirth').isUndefinedOrNotInArray([
            'OTHER'
          ])
        }
      ]
    }),
    {
      id: 'child.attendantAtBirth',
      type: 'SELECT',
      required: false,
      label: {
        defaultMessage: 'Attendant at birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.attendantAtBirth.label'
      },
      options: attendantAtBirthOptions
    },
    {
      id: 'child.birthType',
      type: 'SELECT',
      required: false,
      label: {
        defaultMessage: 'Type of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthType.label'
      },
      options: typeOfBirthOptions
    },
    {
      id: 'child.weightAtBirth',
      type: 'TEXT',
      required: false,
      label: {
        defaultMessage: 'Weight at birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.label'
      },
      options: {
        type: 'number'
      }
    }
  ]
})
