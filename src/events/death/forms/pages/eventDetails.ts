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
  and,
  ConditionalType,
  defineFormPage,
  field,
  FieldType,
  never,
  not,
  or,
  PageTypes,
  TranslationConfig,
  user
} from '@opencrvs/toolkit/events'

import {
  defaultStreetAddressConfiguration,
  getNestedFieldValidators,
  DEATH_REGISTRATION_TARGET_DAYS,
  createSelectOptions,
  emptyMessage,
  yesNoRadioOptions
} from '@countryconfig/events/utils'

const MannerDeathType = {
  MANNER_NATURAL: 'MANNER_NATURAL',
  MANNER_ACCIDENT: 'MANNER_ACCIDENT',
  MANNER_SUICIDE: 'MANNER_SUICIDE',
  MANNER_HOMICIDE: 'MANNER_HOMICIDE',
  MANNER_UNDETERMINED: 'MANNER_UNDETERMINED'
} as const

const mannerDeathMessageDescriptors = {
  MANNER_NATURAL: {
    defaultMessage: 'Natural causes',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathNatural'
  },
  MANNER_ACCIDENT: {
    defaultMessage: 'Accident',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathAccident'
  },
  MANNER_SUICIDE: {
    defaultMessage: 'Suicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathSuicide'
  },
  MANNER_HOMICIDE: {
    defaultMessage: 'Homicide',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathHomicide'
  },
  MANNER_UNDETERMINED: {
    defaultMessage: 'Manner undetermined',
    description: 'Option for form field: Manner of death',
    id: 'form.field.label.mannerOfDeathUndetermined'
  }
} satisfies Record<keyof typeof MannerDeathType, TranslationConfig>

const mannerDeathTypeOptions = createSelectOptions(
  MannerDeathType,
  mannerDeathMessageDescriptors
)

export const PlaceOfDeath = {
  HEALTH_FACILITY: 'HEALTH_FACILITY',
  DECEASED_USUAL_RESIDENCE: 'DECEASED_USUAL_RESIDENCE',
  OTHER: 'OTHER'
} as const

const placeOfDeathMessageDescriptors = {
  HEALTH_FACILITY: {
    defaultMessage: 'Health Institution',
    description: 'Select item for Health Institution',
    id: 'form.field.label.healthInstitution'
  },
  DECEASED_USUAL_RESIDENCE: {
    defaultMessage: "Deceased's usual residence",
    description:
      'Option for place of occurrence of death same as deceased primary address',
    id: 'form.field.label.placeOfDeathSameAsPrimary'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Select item for Other location',
    id: 'form.field.label.otherInstitution'
  }
} satisfies Record<keyof typeof PlaceOfDeath, TranslationConfig>

const placeOfDeathOptions = createSelectOptions(
  PlaceOfDeath,
  placeOfDeathMessageDescriptors
)

// Duration unit options for cause of death sections
const durationUnitOptions = [
  {
    value: 'seconds',
    label: {
      defaultMessage: 'Seconds',
      description: 'Unit option: seconds',
      id: 'event.death.action.declare.form.section.event.field.duration.unit.seconds'
    }
  },
  {
    value: 'minutes',
    label: {
      defaultMessage: 'Minutes',
      description: 'Unit option: minutes',
      id: 'event.death.action.declare.form.section.event.field.duration.unit.minutes'
    }
  },
  {
    value: 'hours',
    label: {
      defaultMessage: 'Hours',
      description: 'Unit option: hours',
      id: 'event.death.action.declare.form.section.event.field.duration.unit.hours'
    }
  },
  {
    value: 'days',
    label: {
      defaultMessage: 'Days',
      description: 'Unit option: days',
      id: 'event.death.action.declare.form.section.event.field.duration.unit.days'
    }
  },
  {
    value: 'months',
    label: {
      defaultMessage: 'Months',
      description: 'Unit option: months',
      id: 'event.death.action.declare.form.section.event.field.duration.unit.months'
    }
  },
  {
    value: 'years',
    label: {
      defaultMessage: 'Years',
      description: 'Unit option: years',
      id: 'event.death.action.declare.form.section.event.field.duration.unit.years'
    }
  }
]

const medCertEstablished = field(
  'eventDetails.causeOfDeathEstablished'
).isEqualTo(true)
const notNaturalCauses = not(
  field('eventDetails.mannerOfDeath').isEqualTo(MannerDeathType.MANNER_NATURAL)
)
const magistrateRequired = field(
  'eventDetails.magistrateInquiryRequired'
).isEqualTo('YES')
const notHospitalClerk = not(user.hasRole('HOSPITAL_CLERK'))
const notPersonallyAttended = not(
  field('eventDetails.notPersonallyAttended').isEqualTo(true)
)

export const eventDetails = defineFormPage({
  id: 'eventDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Event details',
    description: 'Form section title for event details',
    id: 'form.death.eventDetails.title'
  },
  fields: [
    // ---- Date of death ----
    {
      id: 'eventDetails.date',
      type: FieldType.DATE,
      required: true,
      secured: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date',
            description: 'This is the error message for invalid date',
            id: 'event.death.action.declare.form.section.event.field.date.error'
          },
          validator: field('eventDetails.date').isBefore().now()
        },
        {
          message: {
            defaultMessage:
              "Date of death must be after the deceased's birth date",
            description:
              'This is the error message for date of death before date of birth',
            id: 'event.death.action.declare.form.section.event.field.date.error.beforeBirth'
          },
          validator: or(
            field('eventDetails.date').isAfter().date(field('deceased.dob')),
            field('deceased.dobUnknown').isEqualTo(true)
          )
        }
      ],
      label: {
        defaultMessage: 'Date of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.date.label'
      }
    },
    // ---- Time of death ----
    {
      id: 'eventDetails.timeOfDeath',
      type: FieldType.TIME,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Time of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.timeOfDeath.label'
      }
    },
    // ---- Reason for late registration (auto-shown when date is late) ----
    {
      id: 'eventDetails.reasonForLateRegistration',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Reason for late registration',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.reason.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(
            not(
              field('eventDetails.date')
                .isAfter()
                .days(DEATH_REGISTRATION_TARGET_DAYS)
                .inPast()
            ),
            field('eventDetails.date').isBefore().now()
          )
        }
      ]
    },
    // ---- Manner of death ----
    {
      id: 'eventDetails.mannerOfDeath',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Manner of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.manner.label'
      },
      options: mannerDeathTypeOptions
    },
    // ---- Place of death ----
    {
      id: 'eventDetails.placeOfDeath',
      type: FieldType.SELECT,
      required: true,
      secured: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of death',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.placeOfDeath.label'
      },
      options: placeOfDeathOptions
    },
    // ---- Health institution (shown if Health Facility) ----
    {
      id: 'eventDetails.deathLocation',
      type: FieldType.LOCATION,
      required: true,
      secured: true,
      analytics: true,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.deathLocation.label'
      },
      parent: field('eventDetails.placeOfDeath'),
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('eventDetails.placeOfDeath').isEqualTo(
            PlaceOfDeath.HEALTH_FACILITY
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
    // ---- Death location address (shown if Deceased's usual residence or Other) ----
    {
      id: 'eventDetails.deathLocationOther',
      type: FieldType.ADDRESS,
      required: true,
      hideLabel: true,
      secured: true,
      analytics: true,
      label: {
        defaultMessage: 'Death location address',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.deceased.field.deathLocationOther.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: or(
            field('eventDetails.placeOfDeath').isEqualTo(PlaceOfDeath.OTHER),
            field('eventDetails.placeOfDeath').isEqualTo(
              PlaceOfDeath.DECEASED_USUAL_RESIDENCE
            )
          )
        }
      ],
      parent: field('eventDetails.placeOfDeath'),
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message when generic field is invalid',
            id: 'error.invalidInput'
          },
          validator: field(
            'eventDetails.deathLocationOther'
          ).isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'eventDetails.deathLocationOther',
          defaultStreetAddressConfiguration
        )
      ],
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration,
        allowedLocations: user.jurisdiction(
          user.scope('record.create').attribute('placeOfEvent')
        )
      }
    },
    // ---- Hidden field to capture location ID ----
    {
      id: 'eventDetails.deathLocationId',
      type: FieldType.ALPHA_HIDDEN,
      required: false,
      label: {
        defaultMessage: 'Health Institution',
        description: 'This is the label for the field',
        id: 'event.birth.action.declare.form.section.child.field.birthLocation.label'
      },
      parent: [
        field('eventDetails.placeOfDeath'),
        field('eventDetails.deathLocation'),
        field('eventDetails.deathLocationOther'),
        field('deceased.address')
      ],
      value: [
        field('eventDetails.deathLocation'),
        field('eventDetails.deathLocationOther').get('administrativeArea'),
        field('deceased.address').get('administrativeArea')
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.policeInquiryDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: notNaturalCauses
        }
      ]
    },
    // ---- Was this case referred to the police? ----
    {
      id: 'eventDetails.referredToPolice',
      type: FieldType.RADIO_GROUP,
      required: false,
      analytics: true,
      options: yesNoRadioOptions,
      label: {
        defaultMessage: 'Was this case referred to the police?',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.referredToPolice.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: notNaturalCauses
        }
      ]
    },
    // ---- Was a Magistrate's inquiry required? ----
    {
      id: 'eventDetails.magistrateInquiryRequired',
      type: FieldType.RADIO_GROUP,
      required: false,
      analytics: true,
      options: yesNoRadioOptions,
      label: {
        defaultMessage: "Was a Magistrate's inquiry required?",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.magistrateInquiryRequired.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: notNaturalCauses
        }
      ]
    },
    // ---- Cause of death from Magistrate's findings (hidden from Health) ----
    {
      id: 'eventDetails.magistrateFindingsCause',
      type: FieldType.TEXTAREA,
      required: false,
      analytics: true,
      label: {
        defaultMessage: "Cause of death from Magistrate's findings",
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.magistrateFindingsCause.label'
      },
      helperText: {
        defaultMessage:
          "Enter the cause of death as stated in the Magistrate's findings",
        description: 'Helper text for magistrate findings cause field',
        id: 'event.death.action.declare.form.section.event.field.magistrateFindingsCause.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(magistrateRequired, notHospitalClerk)
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.medCertDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },
    // ---- Medical certificate of cause of death has been established ----
    {
      id: 'eventDetails.causeOfDeathEstablished',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage:
          'Medical certificate of cause of death has been established',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeOfDeath.label'
      }
    },
    // ---- Full name of certifying medical officer ----
    {
      id: 'eventDetails.certifyingMedicalOfficer',
      type: FieldType.TEXT,
      required: true,
      label: {
        defaultMessage: 'Full name of certifying medical officer',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.certifyingMedicalOfficer.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Date last seen alive (hidden if not personally attended) ----
    {
      id: 'eventDetails.dateLastSeenAlive',
      type: FieldType.DATE,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Date last seen alive',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.dateLastSeenAlive.label'
      },
      helperText: {
        defaultMessage:
          'Date the deceased was last seen alive by the certifying medical officer',
        description: 'Helper text for date last seen alive',
        id: 'event.death.action.declare.form.section.event.field.dateLastSeenAlive.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: and(medCertEstablished, notPersonallyAttended)
        }
      ]
    },
    // ---- Not personally attended ----
    {
      id: 'eventDetails.notPersonallyAttended',
      type: FieldType.CHECKBOX,
      analytics: true,
      label: {
        defaultMessage: 'Not personally attended',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.notPersonallyAttended.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.causeSection1Divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Section I heading ----
    {
      id: 'eventDetails.causeSection1Heading',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Section I. Cause of death',
        description: 'Heading for Section I cause of death',
        id: 'event.death.action.declare.form.section.event.field.causeSection1Heading.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Disease or condition directly leading to death (sub heading) ----
    {
      id: 'eventDetails.causeDirectSubheading',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Disease or condition directly leading to death',
        description: 'Sub heading for direct cause of death',
        id: 'event.death.action.declare.form.section.event.field.causeDirectSubheading.label'
      },
      configuration: { styles: { fontVariant: 'reg16' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Direct cause ----
    {
      id: 'eventDetails.causeA',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Direct cause',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeA.label'
      },
      helperText: {
        defaultMessage:
          'Please enter the disease or condition directly leading to death',
        description: 'Helper text for direct cause field',
        id: 'event.death.action.declare.form.section.event.field.causeA.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Duration A ----
    {
      id: 'eventDetails.durationA',
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Duration',
        description: 'Duration for direct cause',
        id: 'event.death.action.declare.form.section.event.field.durationA.label'
      },
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'Helper text for duration field',
        id: 'event.death.action.declare.form.section.event.field.durationA.helperText'
      },
      options: durationUnitOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.causeBDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Antecedent cause B ----
    {
      id: 'eventDetails.causeB',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Antecedent cause B',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeB.label'
      },
      helperText: {
        defaultMessage:
          'Please enter the condition that gave rise to the above cause (if applicable)',
        description: 'Helper text for antecedent cause B',
        id: 'event.death.action.declare.form.section.event.field.causeB.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Duration B ----
    {
      id: 'eventDetails.durationB',
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Duration',
        description: 'Duration for antecedent cause B',
        id: 'event.death.action.declare.form.section.event.field.durationB.label'
      },
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'Helper text for duration field',
        id: 'event.death.action.declare.form.section.event.field.durationB.helperText'
      },
      options: durationUnitOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.causeCDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Antecedent cause C ----
    {
      id: 'eventDetails.causeC',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Antecedent cause C',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeC.label'
      },
      helperText: {
        defaultMessage:
          'Please enter the condition that gave rise to the above cause (if applicable)',
        description: 'Helper text for antecedent cause C',
        id: 'event.death.action.declare.form.section.event.field.causeC.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Duration C ----
    {
      id: 'eventDetails.durationC',
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Duration',
        description: 'Duration for antecedent cause C',
        id: 'event.death.action.declare.form.section.event.field.durationC.label'
      },
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'Helper text for duration field',
        id: 'event.death.action.declare.form.section.event.field.durationC.helperText'
      },
      options: durationUnitOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.causeDDivider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Antecedent cause D ----
    {
      id: 'eventDetails.causeD',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Antecedent cause D',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeD.label'
      },
      helperText: {
        defaultMessage:
          'Please enter the condition that gave rise to the above cause (if applicable)',
        description: 'Helper text for antecedent cause D',
        id: 'event.death.action.declare.form.section.event.field.causeD.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Duration D ----
    {
      id: 'eventDetails.durationD',
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Duration',
        description: 'Duration for antecedent cause D',
        id: 'event.death.action.declare.form.section.event.field.durationD.label'
      },
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'Helper text for duration field',
        id: 'event.death.action.declare.form.section.event.field.durationD.helperText'
      },
      options: durationUnitOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Divider ----
    {
      id: 'eventDetails.causeSection2Divider',
      type: FieldType.DIVIDER,
      label: emptyMessage,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Section II heading ----
    {
      id: 'eventDetails.causeSection2Heading',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Section II. Other significant conditions',
        description: 'Heading for Section II other conditions',
        id: 'event.death.action.declare.form.section.event.field.causeSection2Heading.label'
      },
      configuration: { styles: { fontVariant: 'h3' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Other conditions sub heading ----
    {
      id: 'eventDetails.causeOtherSubheading',
      type: FieldType.HEADING,
      label: {
        defaultMessage:
          'Other conditions that contributed to the death but were not part of the main cause',
        description: 'Sub heading for other significant conditions',
        id: 'event.death.action.declare.form.section.event.field.causeOtherSubheading.label'
      },
      configuration: { styles: { fontVariant: 'reg16' } },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        },
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    // ---- Other significant conditions ----
    {
      id: 'eventDetails.causeOther',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Other significant conditions',
        description: 'This is the label for the field',
        id: 'event.death.action.declare.form.section.event.field.causeOther.label'
      },
      helperText: {
        defaultMessage:
          'Please enter a disease or condition that contributed to the death but did not directly cause it',
        description: 'Helper text for other significant conditions',
        id: 'event.death.action.declare.form.section.event.field.causeOther.helperText'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    },
    // ---- Duration Other ----
    {
      id: 'eventDetails.durationOther',
      type: FieldType.NUMBER_WITH_UNIT,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Duration',
        description: 'Duration for other significant conditions',
        id: 'event.death.action.declare.form.section.event.field.durationOther.label'
      },
      helperText: {
        defaultMessage: 'Interval between onset and death',
        description: 'Helper text for duration field',
        id: 'event.death.action.declare.form.section.event.field.durationOther.helperText'
      },
      options: durationUnitOptions,
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: medCertEstablished
        }
      ]
    }
  ]
})
