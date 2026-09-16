import {
  ConditionalType,
  AddressType,
  defineFormPage,
  FieldType,
  PageTypes,
  TranslationConfig,
  field,
  now,
  user
} from '@opencrvs/toolkit/events'
import { not } from '@opencrvs/toolkit/conditionals'
import {
  createSelectOptions,
  defaultStreetAddressConfiguration,
  getNestedFieldValidators
} from '@countryconfig/events/utils'

const OfficiantType = {
  MINISTER: 'MINISTER',
  MARRIAGE_CELEBRANT: 'MARRIAGE_CELEBRANT',
  REGISTRAR: 'REGISTRAR'
} as const

const officiantTypeMessageDescriptors = {
  MINISTER: {
    defaultMessage: 'Minister',
    description: 'Label for minister officiant option',
    id: 'form.field.label.officiantTypeMinister'
  },
  MARRIAGE_CELEBRANT: {
    defaultMessage: 'Marriage celebrant',
    description: 'Label for celebration officiant option',
    id: 'form.field.label.officiantTypeMarriageCelebrant'
  },
  REGISTRAR: {
    defaultMessage: 'Registrar',
    description: 'Label for registrar officiant option',
    id: 'form.field.label.officiantTypeRegistrar'
  }
} satisfies Record<keyof typeof OfficiantType, TranslationConfig>

const officiantTypeOptions = createSelectOptions(
  OfficiantType,
  officiantTypeMessageDescriptors
)

const Denomination = {
  CATHOLIC: 'CATHOLIC',
  PROTESTANT: 'PROTESTANT',
  OTHER: 'OTHER'
} as const

const denominationOptions = createSelectOptions(Denomination, {
  CATHOLIC: {
    defaultMessage: 'Catholic',
    description: 'Label for Catholic denomination option',
    id: 'form.field.label.denominationCatholic'
  },
  PROTESTANT: {
    defaultMessage: 'Protestant',
    description: 'Label for Protestant denomination option',
    id: 'form.field.label.denominationProtestant'
  },
  OTHER: {
    defaultMessage: 'Other',
    description: 'Label for other denomination option',
    id: 'form.field.label.denominationOther'
  }
})

const officiatingMinisterOptions = [
  {
    value: 'MINISTER',
    label: {
      defaultMessage: 'Minister',
      description: 'Label for minister option',
      id: 'form.field.label.officiatingMinister'
    }
  }
]

const marriageCelebrantOptions = [
  {
    value: 'MARRIAGE_CELEBRANT',
    label: {
      defaultMessage: 'Marriage celebrant',
      description: 'Label for marriage celebrant option',
      id: 'form.field.label.marriageCelebrant'
    }
  }
]

const registrarOptions = [
  {
    value: 'REGISTRAR',
    label: {
      defaultMessage: 'Registrar',
      description: 'Label for registrar option',
      id: 'form.field.label.registrar'
    }
  }
]

export const noticeDetails = defineFormPage({
  id: 'noticeOfIntendedMarriageDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Notice of intended marriage details',
    description: 'Title for notice of intended marriage details page',
    id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.title'
  },
  fields: [
    {
      id: 'noticeOfIntendedMarriageDetails.dateOfNoticeLodgement',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      defaultValue: now(),
      validation: [
        {
          message: {
            defaultMessage: 'Date of notice lodgement cannot be in the future',
            description: 'Validation message for a future notice lodgement date',
            id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.dateOfNoticeLodgement.error'
          },
          validator: field('noticeOfIntendedMarriageDetails.dateOfNoticeLodgement').isBefore().now()
        }
      ],
      label: {
        defaultMessage: 'Date of notice lodgement',
        description: 'Label for the notice lodgement date field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.dateOfNoticeLodgement.label'
      }
    },
    {
      id: 'noticeOfIntendedMarriageDetails.expiryDate',
      type: FieldType.DATE,
      analytics: true,
      uncorrectable: true,
      label: {
        defaultMessage: 'Expiry date',
        description: 'Label for the expiry date field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.expiryDate.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('noticeOfIntendedMarriageDetails.expiryDate').isFalsy())
        }
      ]
    },
    {
      id: 'noticeOfIntendedMarriageDetails.placeOfMarriage',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'Label for the place of marriage address field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.placeOfMarriage.label'
      },
      defaultValue: {
        country: 'TUV',
        addressType: AddressType.DOMESTIC,
        administrativeArea: user('administrativeAreaId')
      },
      validation: [
        {
          message: {
            defaultMessage: 'Invalid input',
            description: 'Error message for an invalid marriage location',
            id: 'error.invalidInput'
          },
          validator: field('noticeOfIntendedMarriageDetails.placeOfMarriage').isValidAdministrativeLeafLevel()
        },
        ...getNestedFieldValidators(
          'noticeOfIntendedMarriageDetails.placeOfMarriage',
          defaultStreetAddressConfiguration
        )
      ]
      ,configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      }
    },
    {
      id: 'noticeOfIntendedMarriageDetails.dateOfMarriage',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      validation: [
        {
          message: {
            defaultMessage: 'Date of marriage must be after the date of notice lodgement',
            description: 'Validation message for the marriage date order',
            id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.dateOfMarriage.error'
          },
          validator: field('noticeOfIntendedMarriageDetails.dateOfMarriage').isAfter().date(field('noticeOfIntendedMarriageDetails.dateOfNoticeLodgement'))
        },
        {
          message: {
            defaultMessage: 'Date of marriage must be no more than 90 days after the date of notice lodgement',
            description: 'Validation message for the 90-day marriage date limit',
            id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.dateOfMarriage.maxDaysError'
          },
          validator: field('noticeOfIntendedMarriageDetails.dateOfMarriage')
            .isBefore()
            .days(90)
            .fromDate(field('noticeOfIntendedMarriageDetails.dateOfNoticeLodgement'))
        }
      ],
      label: {
        defaultMessage: 'Date of marriage',
        description: 'Label for the marriage date field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.dateOfMarriage.label'
      }
    },
    {
      id: 'noticeOfIntendedMarriageDetails.denomination',
      type: FieldType.SELECT,
      options: denominationOptions,
      label: {
        defaultMessage: 'Denomination',
        description: 'Label for the officiating denomination field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.denomination.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('noticeOfIntendedMarriageDetails.officiantType').isEqualTo(OfficiantType.MINISTER)
        }
      ]
    },
    {
      id: 'noticeOfIntendedMarriageDetails.officiatingMinister',
      type: FieldType.SELECT,
      options: officiatingMinisterOptions,
      label: {
        defaultMessage: 'Officiating minister',
        description: 'Label for the officiating minister field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.officiatingMinister.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('noticeOfIntendedMarriageDetails.denomination').isFalsy())
        }
      ]
    },
    {
      id: 'noticeOfIntendedMarriageDetails.marriageCelebrant',
      type: FieldType.SELECT,
      required: true,
      options: marriageCelebrantOptions,
      label: {
        defaultMessage: 'Marriage celebrant',
        description: 'Label for the marriage celebrant field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.marriageCelebrant.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('noticeOfIntendedMarriageDetails.officiantType').isEqualTo(OfficiantType.MARRIAGE_CELEBRANT)
        }
      ]
    },
    {
      id: 'noticeOfIntendedMarriageDetails.registrar',
      type: FieldType.SELECT,
      options: registrarOptions,
      label: {
        defaultMessage: 'Registrar',
        description: 'Label for the registrar field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.registrar.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('noticeOfIntendedMarriageDetails.officiantType').isEqualTo(OfficiantType.REGISTRAR)
        }
      ]
    },
    {
      id: 'noticeOfIntendedMarriageDetails.venueName',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Venue name',
        description: 'Label for the venue name field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.venueName.label'
      }
    },
    {
      id: 'noticeOfIntendedMarriageDetails.officiantType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      options: officiantTypeOptions,
      label: {
        defaultMessage: 'Officiant type',
        description: 'Label for the officiant type field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.officiantType.label'
      }
    },
    {
      id: 'noticeOfIntendedMarriageDetails.location',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        defaultMessage: 'Location',
        description: 'Label for the location field',
        id: 'event.marriageNotice.action.declare.form.section.noticeOfIntendedMarriageDetails.field.location.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(field('noticeOfIntendedMarriageDetails.officiantType').isFalsy())
        }
      ]
    }
  ]
})
