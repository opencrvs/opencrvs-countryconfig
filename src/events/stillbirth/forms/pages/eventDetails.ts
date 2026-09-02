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
  AddressType,
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  PageTypes,
  SelectOption,
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'

import {
  createSelectOptions,
  defaultStreetAddressConfiguration,
  emptyMessage,
  getNestedFieldValidators
} from '@countryconfig/events/utils'
import {
  tuvaluNameConfig,
  invalidNameValidator
} from '@countryconfig/events/birth/validators'

export const BornAlive = {
  NO: 'NO',
  YES: 'YES'
} as const

/** True only when the baby showed no signs of life — the case is eligible to continue as a stillbirth. */
export const stillbirthEligible = field('eventDetails.wasBornAlive').isEqualTo(
  BornAlive.NO
)

const bornAliveOptions = [
  {
    value: BornAlive.NO,
    label: {
      defaultMessage: 'No',
      description: 'Option: baby was not born alive',
      id: 'event.stillbirth.action.declare.form.section.eventDetails.field.wasBornAlive.option.no'
    }
  },
  {
    value: BornAlive.YES,
    label: {
      defaultMessage: 'Yes',
      description: 'Option: baby was born alive',
      id: 'event.stillbirth.action.declare.form.section.eventDetails.field.wasBornAlive.option.yes'
    }
  }
] satisfies SelectOption[]

export const GenderTypes = {
  MALE: 'male',
  FEMALE: 'female'
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

export const genderOptions = createSelectOptions(
  GenderTypes,
  genderMessageDescriptors
)

export const PlaceOfDelivery = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  PRIVATE_HOME: 'PRIVATE_HOME',
  OTHER: 'OTHER'
} as const

const placeOfDeliveryMessageDescriptors = {
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
} satisfies Record<keyof typeof PlaceOfDelivery, TranslationConfig>

const placeOfDeliveryOptions = [
  {
    value: PlaceOfDelivery.HEALTH_FACILITY,
    label: placeOfDeliveryMessageDescriptors.HEALTH_FACILITY
  },
  {
    value: PlaceOfDelivery.PRIVATE_HOME,
    label: placeOfDeliveryMessageDescriptors.PRIVATE_HOME
  },
  {
    value: PlaceOfDelivery.OTHER,
    label: placeOfDeliveryMessageDescriptors.OTHER
  }
] satisfies SelectOption[]

const TypeOfBirth = {
  SINGLE: 'SINGLE',
  TWIN: 'TWIN',
  TRIPLET: 'TRIPLET',
  HIGHER_MULTIPLE_DELIVERY: 'HIGHER_MULTIPLE_DELIVERY'
} as const

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

const typeOfBirthOptions = createSelectOptions(
  TypeOfBirth,
  typeOfBirthMessageDescriptors
)

const BirthOrderTwin = { ELDER: 'ELDER', YOUNGER: 'YOUNGER' } as const

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

const birthOrderTwinOptions = createSelectOptions(
  BirthOrderTwin,
  birthOrderTwinMessageDescriptors
)

const BirthOrderTriplet = {
  FIRST: 'FIRST',
  SECOND: 'SECOND',
  THIRD: 'THIRD'
} as const

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

const birthOrderTripletOptions = createSelectOptions(
  BirthOrderTriplet,
  birthOrderTripletMessageDescriptors
)

const BirthOrderHigher = {
  FIRST: 'FIRST',
  SECOND: 'SECOND',
  THIRD: 'THIRD',
  FOURTH: 'FOURTH',
  FIFTH: 'FIFTH',
  SIXTH: 'SIXTH',
  SEVENTH: 'SEVENTH'
} as const

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

const birthOrderHigherOptions = createSelectOptions(
  BirthOrderHigher,
  birthOrderHigherMessageDescriptors
)

const AttendantAtBirth = {
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  MIDWIFE: 'MIDWIFE',
  OTHER: 'OTHER'
} as const

const attendantAtBirthMessageDescriptors = {
  DOCTOR: {
    defaultMessage: 'Doctor',
    description: 'Label for doctor attendant at birth option',
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
    description: 'Label for other attendant at birth option',
    id: 'form.field.label.attendantAtBirthOther'
  }
} satisfies Record<keyof typeof AttendantAtBirth, TranslationConfig>

const attendantAtBirthOptions = createSelectOptions(
  AttendantAtBirth,
  attendantAtBirthMessageDescriptors
)

const showIfEligible = [
  { type: ConditionalType.SHOW, conditional: stillbirthEligible }
]

export const eventDetails = defineFormPage({
  id: 'eventDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Event details',
    description: 'Form section title for stillbirth event details',
    id: 'event.stillbirth.action.declare.form.section.eventDetails.title'
  },
  fields: [
    {
      id: 'eventDetails.wasBornAlive',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Was the baby ever born alive?',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.wasBornAlive.label'
      },
      helperText: {
        defaultMessage:
          "Select 'Yes' if the baby showed any signs of life after delivery (breathing, heartbeat, crying, or movement), even briefly.",
        description: 'Helper text for was born alive field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.wasBornAlive.helperText'
      },
      defaultValue: BornAlive.NO,
      options: bornAliveOptions
    },
    {
      id: 'eventDetails.wasBornAliveWarning',
      type: FieldType.PARAGRAPH,
      label: {
        defaultMessage:
          'This case cannot be registered as a stillbirth event. If the baby showed any signs of life, this must be registered as a Live Birth, and if the child passed away, a Death Registration must be completed.',
        description: 'Warning shown when the baby was born alive',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.wasBornAliveWarning.label'
      },
      configuration: { styles: { hint: true } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.wasBornAlive').isEqualTo(
            BornAlive.YES
          )
        }
      ]
    },
    {
      id: 'eventDetails.gestationalAgeWeeks',
      type: FieldType.NUMBER,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Gestational age at delivery (completed weeks)',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.gestationalAgeWeeks.label'
      },
      helperText: {
        defaultMessage:
          'Enter the number of completed weeks of pregnancy at the time of delivery. Late foetal death is defined as 28 weeks or more.',
        description: 'Helper text for gestational age field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.gestationalAgeWeeks.helperText'
      },
      placeholder: {
        defaultMessage: 'weeks',
        description: 'Placeholder for gestational age field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.gestationalAgeWeeks.placeholder'
      },
      validation: [
        {
          message: {
            defaultMessage:
              'Gestational age must be between 28 and 45 completed weeks. This case cannot be registered as a stillbirth event.',
            description: 'Error message for invalid gestational age range',
            id: 'event.stillbirth.error.invalidGestationalAge'
          },
          validator: field('eventDetails.gestationalAgeWeeks').isBetween(28, 45)
        }
      ],
      configuration: {
        min: 0,
        postfix: {
          defaultMessage: 'weeks',
          description: 'Postfix for the gestational age field',
          id: 'event.stillbirth.action.declare.form.section.eventDetails.field.gestationalAgeWeeks.postfix'
        }
      },
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.divider1',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.dateOfDelivery',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      secured: true,
      label: {
        defaultMessage: 'Date of delivery',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.dateOfDelivery.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Cannot be a future date',
            description: 'This is the error message for invalid date',
            id: 'event.stillbirth.action.declare.form.section.eventDetails.field.dateOfDelivery.error'
          },
          validator: field('eventDetails.dateOfDelivery').isBefore().now()
        }
      ],
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.sex',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Sex',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.sex.label'
      },
      options: genderOptions,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.divider2',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.placeOfDelivery',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      secured: true,
      label: {
        defaultMessage: 'Place of delivery',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.placeOfDelivery.label'
      },
      options: placeOfDeliveryOptions,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.deliveryLocation',
      type: FieldType.LOCATION,
      required: true,
      analytics: true,
      secured: true,
      parent: field('eventDetails.placeOfDelivery'),
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.deliveryLocation.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.placeOfDelivery').isEqualTo(
            PlaceOfDelivery.HEALTH_FACILITY
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
      id: 'eventDetails.deliveryLocation.privateHome',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Residential address',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.deliveryLocation.residence.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.placeOfDelivery').isEqualTo(
            PlaceOfDelivery.PRIVATE_HOME
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
            'eventDetails.deliveryLocation.privateHome'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'eventDetails.deliveryLocation.privateHome',
          defaultStreetAddressConfiguration
        )
      ],
      parent: field('eventDetails.placeOfDelivery'),
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
      id: 'eventDetails.deliveryLocation.other',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      secured: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Other address',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.deliveryLocation.other.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.placeOfDelivery').isEqualTo(
            PlaceOfDelivery.OTHER
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
            'eventDetails.deliveryLocation.other'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'eventDetails.deliveryLocation.other',
          defaultStreetAddressConfiguration
        )
      ],
      parent: field('eventDetails.placeOfDelivery'),
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
      id: 'eventDetails.deliveryLocationId',
      type: FieldType.ALPHA_HIDDEN,
      required: false,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.deliveryLocation.label'
      },
      parent: [
        field('eventDetails.placeOfDelivery'),
        field('eventDetails.deliveryLocation'),
        field('eventDetails.deliveryLocation.privateHome'),
        field('eventDetails.deliveryLocation.other')
      ],
      value: [
        field('eventDetails.deliveryLocation'),
        field('eventDetails.deliveryLocation.privateHome').get(
          'administrativeArea'
        ),
        field('eventDetails.deliveryLocation.other').get('administrativeArea')
      ]
    },
    {
      id: 'eventDetails.divider3',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.birthType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Type of birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.birthType.label'
      },
      options: typeOfBirthOptions,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.birthOrderTwin',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Order of birth (twins)',
        description: 'This is the label for the birth order field for twins',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.birthOrderTwin.label'
      },
      options: birthOrderTwinOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.birthType').isEqualTo(
            TypeOfBirth.TWIN
          )
        }
      ]
    },
    {
      id: 'eventDetails.birthOrderTriplet',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Order of birth (triplets)',
        description: 'This is the label for the birth order field for triplets',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.birthOrderTriplet.label'
      },
      options: birthOrderTripletOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.birthType').isEqualTo(
            TypeOfBirth.TRIPLET
          )
        }
      ]
    },
    {
      id: 'eventDetails.birthOrderHigher',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Order of births (higher multiple delivery)',
        description:
          'This is the label for the birth order field for higher multiple delivery',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.birthOrderHigher.label'
      },
      options: birthOrderHigherOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.birthType').isEqualTo(
            TypeOfBirth.HIGHER_MULTIPLE_DELIVERY
          )
        }
      ]
    },
    {
      id: 'eventDetails.divider4',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.attendantAtBirth',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Attendant at birth',
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.attendantAtBirth.label'
      },
      options: attendantAtBirthOptions,
      conditionals: showIfEligible
    },
    {
      id: 'eventDetails.attendantOther',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Other (please specify)',
        description: 'Label for text field when attendant at birth is Other',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.attendantOther.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.attendantAtBirth').isEqualTo(
            AttendantAtBirth.OTHER
          )
        }
      ]
    },
    {
      id: 'eventDetails.attendantName',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      configuration: tuvaluNameConfig,
      label: {
        defaultMessage: "Attendant's full name",
        description: 'This is the label for the field',
        id: 'event.stillbirth.action.declare.form.section.eventDetails.field.attendantName.label'
      },
      validation: [invalidNameValidator('eventDetails.attendantName')],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('eventDetails.attendantAtBirth').isFalsy())
        }
      ]
    }
  ]
})
