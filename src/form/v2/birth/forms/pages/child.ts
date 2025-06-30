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
  defineFormPage,
  TranslationConfig,
  ConditionalType,
  and,
  FieldType,
  AddressType,
  or,
  PageTypes,
  field
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import { applicationConfig } from '@countryconfig/api/application/application-config'

import { createSelectOptions } from '@countryconfig/form/v2/utils'
import {
  invalidNameValidator,
  MAX_NAME_LENGTH
} from '@countryconfig/form/v2/birth/validators'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown'
} as const

export const PlaceOfBirth = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  PRIVATE_HOME: 'PRIVATE_HOME',
  OTHER: 'OTHER'
} as const

const genderMessageDescriptors = {
  MALE: {
    defaultMessage: 'Male',
    description: 'Label for option male',
    id: 'v2.form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'v2.form.field.label.sexFemale'
  },
  UNKNOWN: {
    defaultMessage: 'Unknown',
    description: 'Label for option unknown',
    id: 'v2.form.field.label.sexUnknown'
  }
} satisfies Record<keyof typeof GenderTypes, TranslationConfig>

const placeOfBirthMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'v2.form.field.label.healthInstitution'
  },
  PRIVATE_HOME: {
    defaultMessage: 'Residential address',
    description: 'Select item for Private Home',
    id: 'v2.form.field.label.privateHome'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'v2.form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfBirth, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

const placeOfBirthOptions = createSelectOptions(
  PlaceOfBirth,
  placeOfBirthMessageDescriptors
)

export const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'v2.form.birth.child.title'
  },
  fields: [
    {
      id: 'child.surname',
      type: FieldType.TEXT,
      configuration: { maxLength: MAX_NAME_LENGTH },
      required: true,
      label: {
        defaultMessage: 'Last name',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.surname.label'
      },
      validation: [invalidNameValidator('child.surname')]
    },
    {
      id: 'child.firstname',
      type: FieldType.TEXT,
      configuration: { maxLength: MAX_NAME_LENGTH },
      required: true,
      label: {
        defaultMessage: 'First name(s)',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.firstname.label'
      },
      validation: [invalidNameValidator('child.firstname')]
    },
    {
      id: 'child.gender',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.gender.label'
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
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.dob.label'
      }
    },
    {
      id: 'child.reason',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason for delayed registration',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('child.dob')
                .isAfter()
                .days(applicationConfig.BIRTH.LATE_REGISTRATION_TARGET)
                .inPast()
            ),
            field('child.dob').isBefore().now()
          )
        }
      ]
    },
    {
      id: 'child.birthTime',
      type: 'TIME',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Time',
            description: 'This is the error message for invalid time',
            id: 'v2.event.birth.action.declare.form.section.child.field.birthTime.error'
          },
          validator: field('child.birthTime').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Birth Time',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.birthTime.label'
      }
    },
    {
      id: 'child.weightAtBirth',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Weight at birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.weightAtBirth.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be within 0 and 6000',
            description: 'This is the error message for invalid number range',
            id: 'v2.error.child.weightAtBirth.invalidNumberRange'
          },
          validator: or(
            field('child.weightAtBirth').isBetween(0, 6000),
            field('child.weightAtBirth').isUndefined()
          )
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'Grammes',
          description: 'This is the postfix for the weight field',
          id: 'v2.event.birth.action.declare.form.section.child.field.weightAtBirth.postfix'
        }
      }
    },
    {
      id: 'child.placeOfBirth',
      type: FieldType.SELECT,
      required: true,
      label: {
        defaultMessage: 'Place of delivery',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.placeOfBirth.label'
      },
      options: placeOfBirthOptions
    },
    {
      id: 'child.birthLocation',
      type: 'FACILITY',
      required: true,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(
            PlaceOfBirth.HEALTH_FACILITY
          )
        }
      ]
    },
    {
      id: 'child.address.privateHome',
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Child`s address',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(
            PlaceOfBirth.PRIVATE_HOME
          )
        }
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    },
    {
      id: 'child.address.other',
      type: FieldType.ADDRESS,
      hideLabel: true,
      label: {
        defaultMessage: 'Child`s address',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(PlaceOfBirth.OTHER)
        }
      ],
      defaultValue: {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    },
    // NUI — should be a http button to generate a UI number and becomes a disabled field
    {
      id: 'child.legacyRegistrationNumber',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Legacy birth registration number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.legacyRegistrationNumber.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be within 0 and 999999',
            description: 'This is the error message for invalid number range',
            id: 'v2.error.child.legacyRegistrationNumber'
          },
          validator: or(
            field('child.legacyRegistrationNumber').isBetween(0, 999999),
            field('child.legacyRegistrationNumber').isUndefined()
          )
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'Grammes',
          description: 'This is the postfix for the weight field',
          id: 'v2.event.birth.action.declare.form.section.child.field.legacyRegistrationNumber.postfix'
        }
      }
    },
    {
      id: 'child.legacyRegistrationBirthDate',
      type: 'DATE',
      required: false,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.child.field.legacyRegistrationBirthDate.error'
          },
          validator: field('child.legacyRegistrationBirthDate').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Legacy Registration Date',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.legacyRegistrationBirthDate.label'
      }
    },
    {
      id: 'child.legacyRegistrationBirthTime',
      type: 'TIME',
      required: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Time',
            description: 'This is the error message for invalid time',
            id: 'v2.event.birth.action.declare.form.section.child.field.legacyRegistrationBirthTime.error'
          },
          validator: field('child.legacyRegistrationBirthTime').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Legacy birth registration time',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.legacyRegistrationBirthTime.label'
      }
    }
  ]
})
