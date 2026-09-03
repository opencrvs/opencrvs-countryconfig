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
  field,
  user,
  SelectOption
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  createSelectOptions,
  emptyMessage,
  BIRTH_DELAYED_REGISTRATION_TARGET_DAYS,
  BIRTH_LATE_REGISTRATION_TARGET_DAYS,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  hasNonHealthNotifierRole,
} from '@countryconfig/events/utils'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female',
} as const

const TypeOfBirth = {
  SINGLE: 'SINGLE',
  TWIN: 'TWIN',
  TRIPLET: 'TRIPLET',
  HIGHER_MULTIPLE_DELIVERY: 'HIGHER_MULTIPLE_DELIVERY'
} as const

const BirthOrderTwin = {
  ELDER: 'ELDER',
  YOUNGER: 'YOUNGER'
} as const

const BirthOrderTriplet = {
  FIRST: 'FIRST',
  SECOND: 'SECOND',
  THIRD: 'THIRD'
} as const

const BirthOrderHigher = {
  FIRST: 'FIRST',
  SECOND: 'SECOND',
  THIRD: 'THIRD',
  FOURTH: 'FOURTH',
  FIFTH: 'FIFTH',
  SIXTH: 'SIXTH',
  SEVENTH: 'SEVENTH'
} as const

const AttendantAtBirth = {
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  MIDWIFE: 'MIDWIFE',
  OTHER: 'OTHER',
  NONE: 'NONE'
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
    id: 'form.field.label.sexMale'
  },
  FEMALE: {
    defaultMessage: 'Female',
    description: 'Label for option female',
    id: 'form.field.label.sexFemale'
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
  HIGHER_MULTIPLE_DELIVERY: {
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for higher multiple delivery birth',
    id: 'form.field.label.birthTypeHigherMultipleDelivery'
  }
} satisfies Record<keyof typeof TypeOfBirth, TranslationConfig>

const birthOrderTwinMessageDescriptors = {
  ELDER: {
    defaultMessage: 'Elder of twins',
    description: 'Label for elder twin birth order',
    id: 'form.field.label.birthOrderTwinElder'
  },
  YOUNGER: {
    defaultMessage: 'Younger of twins',
    description: 'Label for younger twin birth order',
    id: 'form.field.label.birthOrderTwinYounger'
  }
} satisfies Record<keyof typeof BirthOrderTwin, TranslationConfig>

const birthOrderTripletMessageDescriptors = {
  FIRST: {
    defaultMessage: 'First born',
    description: 'Label for first born triplet',
    id: 'form.field.label.birthOrderTripletFirst'
  },
  SECOND: {
    defaultMessage: 'Second born',
    description: 'Label for second born triplet',
    id: 'form.field.label.birthOrderTripletSecond'
  },
  THIRD: {
    defaultMessage: 'Third born',
    description: 'Label for third born triplet',
    id: 'form.field.label.birthOrderTripletThird'
  }
} satisfies Record<keyof typeof BirthOrderTriplet, TranslationConfig>

const birthOrderHigherMessageDescriptors = {
  FIRST: {
    defaultMessage: 'First born',
    description: 'Label for first born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherFirst'
  },
  SECOND: {
    defaultMessage: 'Second born',
    description: 'Label for second born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherSecond'
  },
  THIRD: {
    defaultMessage: 'Third born',
    description: 'Label for third born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherThird'
  },
  FOURTH: {
    defaultMessage: 'Fourth born',
    description: 'Label for fourth born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherFourth'
  },
  FIFTH: {
    defaultMessage: 'Fifth born',
    description: 'Label for fifth born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherFifth'
  },
  SIXTH: {
    defaultMessage: 'Sixth born',
    description: 'Label for sixth born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherSixth'
  },
  SEVENTH: {
    defaultMessage: 'Seventh born',
    description: 'Label for seventh born higher multiple delivery',
    id: 'form.field.label.birthOrderHigherSeventh'
  }
} satisfies Record<keyof typeof BirthOrderHigher, TranslationConfig>

const attendantAtBirthMessageDescriptors = {
  DOCTOR: {
    defaultMessage: 'Doctor',
    description: 'Label for doctor attendant',
    id: 'form.field.label.attendantAtBirthDoctor'
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
  OTHER: {
    defaultMessage: 'Other',
    description: 'Label for other attendant',
    id: 'form.field.label.attendantAtBirthOther'
  },
  NONE: {
    defaultMessage: 'None',
    description: 'Label for no attendant',
    id: 'form.field.label.attendantAtBirthNone'
  }
} satisfies Record<keyof typeof AttendantAtBirth, TranslationConfig>

export const placeOfBirthMessageDescriptors = {
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
    defaultMessage: 'Other address',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfBirth, TranslationConfig>

const genderOptions = createSelectOptions(GenderTypes, genderMessageDescriptors)

const placeOfBirthOptions = [
  {
    value: PlaceOfBirth.HEALTH_FACILITY,
    label: placeOfBirthMessageDescriptors.HEALTH_FACILITY,
  },
  {
    value: PlaceOfBirth.PRIVATE_HOME,
    label: placeOfBirthMessageDescriptors.PRIVATE_HOME,
  },
  {
    value: PlaceOfBirth.OTHER,
    label: placeOfBirthMessageDescriptors.OTHER,
  }
] satisfies SelectOption[]

const typeOfBirthOptions = createSelectOptions(
  TypeOfBirth,
  typeOfBirthMessageDescriptors
)

const birthOrderTwinOptions = createSelectOptions(
  BirthOrderTwin,
  birthOrderTwinMessageDescriptors
)

const birthOrderTripletOptions = createSelectOptions(
  BirthOrderTriplet,
  birthOrderTripletMessageDescriptors
)

const birthOrderHigherOptions = createSelectOptions(
  BirthOrderHigher,
  birthOrderHigherMessageDescriptors
)

const attendantAtBirthOptions = createSelectOptions(
  AttendantAtBirth,
  attendantAtBirthMessageDescriptors
)

export const child = defineFormPage({
  id: 'child',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: "Child's details",
    description: 'Form section title for Child',
    id: 'form.birth.child.title'
  },
  fields: [
    {
      id: 'child.name',
      type: FieldType.NAME,
      required: true,
      configuration: tuvaluNameConfig,
      hideLabel: true,
      label: {
        defaultMessage: "Child's name",
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.name.label'
      },
      validation: [invalidNameValidator('child.name')]
    },
    {
      id: 'child.gender',
      analytics: true,
      type: FieldType.SELECT,
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
      analytics: true,
      type: 'DATE',
      required: true,
      secured: true,
      validation: [
        {
          message: {
            defaultMessage: 'Cannot be a future date',
            description: 'This is the error message for invalid date',
            id: 'event.birth.action.declare.form.section.child.field.dob.error'
          },
          validator: field('child.dob').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.dob.label'
      }
    },
    {
      id: 'child.lateRegistrationNotice',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          "Todays date is greater than 6 months. Based on the date of birth.",
        description:
          'Paragraph notice shown when registration is more than 6 months after birth',
        id: 'event.birth.action.declare.form.section.child.field.lateRegistrationNotice.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            field('child.dob').isBefore().now(),
            not(
              field('child.dob')
                .isAfter()
                .days(BIRTH_DELAYED_REGISTRATION_TARGET_DAYS)
                .inPast()
            )
          )
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: and(
            field('child.dob').isBefore().now(),
            not(
              field('child.dob')
                .isAfter()
                .days(BIRTH_DELAYED_REGISTRATION_TARGET_DAYS)
                .inPast()
            )
          )
        }
      ]
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
                .days(BIRTH_LATE_REGISTRATION_TARGET_DAYS)
                .inPast()
            ),
            field('child.dob').isBefore().now()
          )
        }
      ]
    },
    {
      id: 'child.divider1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'child.placeOfBirth',
      analytics: true,
      type: FieldType.SELECT,
      required: true,
      secured: true,
      label: {
        defaultMessage: 'Place of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.placeOfBirth.label'
      },
      options: placeOfBirthOptions
    },
    {
      id: 'child.birthLocation',
      analytics: true,
      type: FieldType.LOCATION,
      required: true,
      secured: true,
      parent: field('child.placeOfBirth'),
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(
            PlaceOfBirth.HEALTH_FACILITY
          )
        }
      ],
      configuration: {
        locationTypes: ['HEALTH_FACILITY'],
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'child.birthLocation.privateHome',
      analytics: true,
      type: FieldType.ADDRESS,
      required: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Residential address',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.residence.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(
            PlaceOfBirth.PRIVATE_HOME
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'child.birthLocation.privateHome'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'child.birthLocation.privateHome',
          defaultStreetAddressConfiguration
        )
      ],
      parent: field('child.placeOfBirth'),
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration,
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'child.birthLocation.other',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,

      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Other address',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.other.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.placeOfBirth').isEqualTo(PlaceOfBirth.OTHER)
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'child.birthLocation.other'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'child.birthLocation.other',
          defaultStreetAddressConfiguration
        )
      ],
      parent: field('child.placeOfBirth'),
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration,
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    {
      id: 'child.birthLocationId',
      type: FieldType.ALPHA_HIDDEN,
      required: false,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      parent: [
        field('child.placeOfBirth'),
        field('child.birthLocation'),
        field('child.birthLocation.privateHome'),
        field('child.birthLocation.other')
      ],
      value: [
        field('child.birthLocation'),
        field('child.birthLocation.privateHome').get('administrativeArea'),
        field('child.birthLocation.other').get('administrativeArea')
      ]
    },
    {
      id: 'child.divider2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'child.timeOfBirth',
      analytics: true,
      type: FieldType.TIME,
      required: false,
      label: {
        defaultMessage: 'Time of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.timeOfBirth.label'
      },
      configuration: {
        use12HourFormat: false
      }
    },
    {
      id: 'child.birthType',
      analytics: true,
      type: FieldType.SELECT,
      required: false,
      label: {
        defaultMessage: 'Type of birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthType.label'
      },
      options: typeOfBirthOptions
    },
    {
      id: 'child.birthOrderTwin',
      type: FieldType.SELECT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Order of birth (twins)',
        description: 'This is the label for the birth order field for twins',
        id: 'event.birth.action.declare.form.section.child.field.birthOrderTwin.label'
      },
      options: birthOrderTwinOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.birthType').isEqualTo(TypeOfBirth.TWIN)
        }
      ]
    },
    {
      id: 'child.birthOrderTriplet',
      type: FieldType.SELECT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Order of birth (triplets)',
        description:
          'This is the label for the birth order field for triplets',
        id: 'event.birth.action.declare.form.section.child.field.birthOrderTriplet.label'
      },
      options: birthOrderTripletOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.birthType').isEqualTo(TypeOfBirth.TRIPLET)
        }
      ]
    },
    {
      id: 'child.birthOrderHigher',
      type: FieldType.SELECT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Order of birth (higher multiple delivery)',
        description:
          'This is the label for the birth order field for higher multiple delivery',
        id: 'event.birth.action.declare.form.section.child.field.birthOrderHigher.label'
      },
      options: birthOrderHigherOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.birthType').isEqualTo(
            TypeOfBirth.HIGHER_MULTIPLE_DELIVERY
          )
        }
      ]
    },
    {
      id: 'child.weightAtBirth',
      analytics: true,
      type: FieldType.NUMBER,
      required: false,
      label: {
        defaultMessage: 'Weight at birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be within 0.5 and 6 kg',
            description: 'This is the error message for invalid number range',
            id: 'error.child.weightAtBirth.invalidNumberRange'
          },
          validator: or(
            field('child.weightAtBirth').isBetween(0.5, 6),
            field('child.weightAtBirth').isUndefined()
          )
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'kg',
          description: 'This is the postfix for the weight field',
          id: 'event.birth.action.declare.form.section.child.field.weightAtBirth.postfix'
        }
      }
    },
    {
      id: 'child.divider3',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    {
      id: 'child.attendantAtBirth',
      type: FieldType.SELECT,
      analytics: true,
      required: false,
      label: {
        defaultMessage: 'Attendant at birth',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.attendantAtBirth.label'
      },
      options: attendantAtBirthOptions
    },
    {
      id: 'child.attendantOther',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Other (please specify attendant)',
        description: 'Label for text field when attendant at birth is Other',
        id: 'event.birth.action.declare.form.section.child.field.attendantOther.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('child.attendantAtBirth').isEqualTo(
            AttendantAtBirth.OTHER
          )
        }
      ]
    },
    {
      id: 'child.attendantFullName',
      type: FieldType.TEXT,
      required: false,
      label: {
        defaultMessage: 'Attendant full name',
        description: 'Label for attendant full name field',
        id: 'event.birth.action.declare.form.section.child.field.attendantFullName.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(field('child.attendantAtBirth').isEqualTo(AttendantAtBirth.OTHER)), 
            not(field('child.attendantAtBirth').isEqualTo(AttendantAtBirth.NONE)),
            not(field('child.attendantAtBirth').isFalsy())
          )
        }
      ]
    },
    {
      id: 'child.divider4',
      type: FieldType.DIVIDER,
      label: emptyMessage,
        conditionals: [
          {
            type: ConditionalType.SHOW,
            conditional: and(
              hasNonHealthNotifierRole
            )
          }
        ]
    },
    {
      id: 'child.nameChangedAfterRegistration',
      type: FieldType.CHECKBOX,
      required: false,
      analytics: false,
      defaultValue: false,
      label: {
        defaultMessage: 'Name changed after registration (via deed poll)',
        description:
          'Checkbox to indicate the child name was changed after registration',
        id: 'event.birth.action.declare.form.section.child.field.nameChangedAfterRegistration.label'
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: field(
            'child.nameChangedAfterRegistration'
          ).isEqualTo(true)
        },
        {
          type: ConditionalType.SHOW,
          conditional: hasNonHealthNotifierRole
        }
      ]
    }
  ]
})
