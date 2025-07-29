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

export const placeOfBirthOptions = createSelectOptions(
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
      id: 'child.name',
      type: FieldType.NAME,
      configuration: { maxLength: MAX_NAME_LENGTH },
      required: true,
      hideLabel: true,
      label: {
        defaultMessage: "Child's name",
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.name.label'
      },
      validation: [invalidNameValidator('child.name')]
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
      id: 'child.childBirthDate',
      type: 'DATE',
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.child.field.childBirthDate.error'
          },
          validator: field('child.childBirthDate').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.childBirthDate.label'
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
              field('child.childBirthDate')
                .isAfter()
                .days(applicationConfig.BIRTH.LATE_REGISTRATION_TARGET)
                .inPast()
            ),
            field('child.childBirthDate').isBefore().now()
          )
        }
      ]
    },
    {
      id: 'child.birthTime',
      type: 'TIME',
      required: true,
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
      secured: true,
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
      secured: true,
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
      secured: true,
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
        country: 'MDG',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    },
    {
      id: 'child.address.other',
      type: FieldType.ADDRESS,
      secured: true,
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
        country: 'MDG',
        addressType: AddressType.DOMESTIC,
        province: '$user.province',
        district: '$user.district',
        urbanOrRural: 'URBAN'
      }
    },
    // FIXME: to be replaced with the full component — NUI
    {
      id: 'child.iD',
      type: FieldType.NUMBER,
      required: true,
      label: {
        defaultMessage: 'iD',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.iD.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be within 0 and 999999999',
            description: 'This is the error message for invalid number range',
            id: 'v2.error.child.iD'
          },
          validator: or(
            field('child.iD').isBetween(0, 999999999),
            field('child.iD').isUndefined()
          )
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'iD',
          description: 'This is the postfix for the weight field',
          id: 'v2.event.birth.action.declare.form.section.child.field.iD.postfix'
        }
      }
    },
    {
      id: 'child.legacyBirthRegistrationNumber',
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Legacy birth registration number',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.legacyBirthRegistrationNumber.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be within 0 and 999999',
            description: 'This is the error message for invalid number range',
            id: 'v2.error.child.legacyBirthRegistrationNumber'
          },
          validator: or(
            field('child.legacyBirthRegistrationNumber').isBetween(0, 999999),
            field('child.legacyBirthRegistrationNumber').isUndefined()
          )
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'Grammes',
          description: 'This is the postfix for the weight field',
          id: 'v2.event.birth.action.declare.form.section.child.field.legacyBirthRegistrationNumber.postfix'
        }
      }
    },
    {
      id: 'child.legacyBirthRegistrationDate',
      type: 'DATE',
      required: false,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid Birthdate',
            description: 'This is the error message for invalid date',
            id: 'v2.event.birth.action.declare.form.section.child.field.legacyBirthRegistrationDate.error'
          },
          validator: field('child.legacyBirthRegistrationDate').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Legacy Registration Date',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.legacyBirthRegistrationDate.label'
      }
    },
    {
      id: 'child.legacyBirthRegistrationTime',
      type: 'TIME',
      required: true,
      label: {
        defaultMessage: 'Legacy birth registration time',
        description: 'This is the label for the field',
        id: 'v2.event.birth.action.declare.form.section.child.field.legacyBirthRegistrationTime.label'
      }
    }
  ]
})
