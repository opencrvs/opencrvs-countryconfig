import {
  defineFormPage,
  FieldType,
  PageTypes,
  ConditionalType,
  field,
  user,
  defineConditional,
  not,
  never
} from '@opencrvs/toolkit/events'
import { defaultStreetAddressConfiguration } from '@countryconfig/events/utils'
import { emptyMessage, createSelectOptions } from '@countryconfig/events/utils'
import { invalidNameValidator } from '@countryconfig/events/birth/validators'
import { MAX_NAME_LENGTH } from '@countryconfig/events/birth/validators'

const conjugalStatusOptionsFemale = createSelectOptions(
  {
    SPINSTER: 'SPINSTER',
    DIVORCED: 'DIVORCED',
    WIDOW: 'WIDOW'
  },
  {
    SPINSTER: {
      defaultMessage: 'Spinster',
      description: 'Option for conjugal status spinster',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.conjugalStatus.option.spinster'
    },
    DIVORCED: {
      defaultMessage: 'Divorced',
      description: 'Option for conjugal status divorced',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.conjugalStatus.option.divorced'
    },
    WIDOW: {
      defaultMessage: 'Widow',
      description: 'Option for conjugal status widow',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.conjugalStatus.option.widow'
    }
  }
)
const conjugalStatusOptions = createSelectOptions(
  {
    BACHELOR: 'BACHELOR',
    DIVORCED: 'DIVORCED',
    WIDOWER: 'WIDOWER'
  },
  {
    BACHELOR: {
      defaultMessage: 'Bachelor',
      description: 'Option for conjugal status bachelor',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.conjugalStatus.option.bachelor'
    },
    DIVORCED: {
      defaultMessage: 'Divorced',
      description: 'Option for conjugal status divorced',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.conjugalStatus.option.divorced'
    },
    WIDOWER: {
      defaultMessage: 'Widower',
      description: 'Option for conjugal status widower',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.conjugalStatus.option.widower'
    }
  }
)
const officiantTypeOptions = createSelectOptions(
  {
    MINISTER: 'MINISTER',
    MARRIAGE_CELEBRANT: 'MARRIAGE_CELEBRANT',
    REGISTRAR: 'REGISTRAR'
  },
  {
    MINISTER: {
      defaultMessage: 'Minister',
      description: 'Option for officiant type minister',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantType.option.minister'
    },
    MARRIAGE_CELEBRANT: {
      defaultMessage: 'Marriage Celebrant',
      description: 'Option for officiant type marriage celebrant',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantType.option.marriageCelebrant'
    },
    REGISTRAR: {
      defaultMessage: 'Registrar',
      description: 'Option for officiant type registrar',
      id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantType.option.registrar'
    }
  }
)

export const marriageDetails = defineFormPage({
  id: 'marriageDetails',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Marriage details',
    description: 'Form section title for marriage details',
    id: 'event.marriageRegistration.action.declare.form.marriageDetails.title'
  },
  fields: [
    // Hint text for marriage licence search
    {
      id: 'marriageDetails.licenceHint',
      type: FieldType.HEADING,
      label: {
        defaultMessage:
          'Search for an existing marriage record. If a match is found, the details below will auto-fill. If no record is found, continue by entering the details manually.',
        description: 'Hint text for marriage licence search field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceHint.label'
      },
      configuration: { styles: { fontVariant: 'reg14' } }
    },
    // Marriage Licence Number (Search)
    {
      id: 'marriageDetails.licenceDetailsSearch',
      type: FieldType.SEARCH,
      required: true,
      label: emptyMessage,
      placeholder: {
        defaultMessage: 'Enter marriage licence number',
        description: 'Placeholder for licence number search field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceNumber.placeholder'
      },
      configuration: {
        validation: {
          validator: defineConditional({
            type: 'string',
            minLength: 1
          }),
          message: {
            defaultMessage: 'Please enter a Marriage registration number',
            description:
              'Validation error message for Marriage registration field',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceNumber.validation'
          }
        },
        indicators: {
          confirmButton: {
            defaultMessage: 'Search',
            description: 'Button text for search',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceNumber.search'
          },
          loading: {
            defaultMessage: 'Searching for marriage record...',
            description: 'Loading message while searching',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceNumber.loading'
          },
          noResultsError: {
            defaultMessage:
              'No marriage record found with this registration number',
            description: 'Error message when no results found',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceNumber.noResults'
          }
        },
        query: {
          type: 'and',
          clauses: [
            {
              eventType: 'marriage-licence',
              status: {
                type: 'anyOf',
                terms: ['REGISTERED']
              }
            },
            {
              'legalStatuses.REGISTERED.registrationNumber': {
                term: '{term}',
                type: 'exact'
              }
            }
          ]
        },
        limit: 1,
        offset: 0
      },
      conditionals: [
        {
          type: ConditionalType.DISPLAY_ON_REVIEW,
          conditional: never()
        }
      ]
    },
    {
      id: 'marriageDetails.licenceNumber',
      type: FieldType.TEXT,
      analytics: true,
      label: {
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.licenceNumber.label',
        description: 'Label for marriage licence number field',
        defaultMessage: 'Marriage licence number'
      },
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'legalStatuses',
        'REGISTERED',
        'registrationNumber'
      ]),
      required: true
    },
    {
      id: 'marriageDetails.expiryDate',
      type: FieldType.DATE,
      required: false,
      analytics: true,
      label: {
        defaultMessage: 'Marriage licence expiry',
        description: 'Label for marriage licence expiry field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.expiryDate.label'
      },
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.expiryDate'
      ]),
      validation: [
        {
          message: {
            defaultMessage: 'Date cannot be in the past',
            description: 'Error when expiry date is in the past',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.expiryDate.pastError'
          },
          validator: field('marriageDetails.expiryDate').isAfter().now()
        },
        {
          message: {
            defaultMessage:
              'Date cannot be more than 3 months from date of lodgement',
            description:
              'Error when expiry date is more than 3 months from date of lodgement',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.expiryDate.Error'
          },
          validator: not(
            field('marriageDetails.expiryDate')
              .isAfter()
              .days(90)
              .fromDate(
                field('marriageDetails.licenceDetailsSearch').getByPath([
                  'data',
                  'firstResult',
                  'declaration',
                  'noticeOfIntendedMarriageDetails.dateOfNoticeLodgement'
                ])
              )
          )
        }
      ]
    },
    // Date of Marriage
    {
      id: 'marriageDetails.dateOfMarriage',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.dateOfMarriage'
      ]),
      label: {
        defaultMessage: 'Date of marriage',
        description: 'Label for date of marriage field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.dateOfMarriage.label'
      }
    },

    // Divider
    {
      id: 'marriageDetails.divider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },

    // Place of Marriage Header
    {
      id: 'marriageDetails.placeHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Place of marriage',
        description: 'Header label for place of marriage section',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.placeHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    // Address block (includes Country, Island, District, Village, City/Town)
    {
      id: 'marriageDetails.address',
      type: FieldType.ADDRESS,
      hideLabel: true,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of marriage (Full address)',
        description: 'Address field for place of marriage',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.address.label'
      },
      defaultValue: {
        country: 'COK',
        addressType: 'DOMESTIC',
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      },
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.placeOfMarriage'
      ])
    },

    // Venue or Church Name
    {
      id: 'marriageDetails.venueName',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.venueName'
      ]),
      label: {
        defaultMessage: 'Venue / Church name',
        description: 'Label for venue or church name field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.venueName.label'
      }
    },

    // Divider
    {
      id: 'marriageDetails.divider.2',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },

    // Officiant Details Header
    {
      id: 'marriageDetails.officiantHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Officiant details',
        description: 'Header label for officiant details section',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    // Officiant Type
    {
      id: 'marriageDetails.officiantType',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.officiantType'
      ]),
      label: {
        defaultMessage: 'Officiant type',
        description: 'Label for officiant type select field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantType.label'
      },
      options: officiantTypeOptions
    },

    // Officiant Full Name
    {
      id: 'marriageDetails.officiantFullName',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.officiatingMinister',
        'label'
      ]),
      label: {
        defaultMessage: 'Officiant name',
        description: 'Label for officiant full name field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantFullName.label'
      }
    },

    // Officiant Affiliation / Organisation
    {
      id: 'marriageDetails.officiantAffiliation',
      type: FieldType.TEXT,
      required: false,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'noticeOfIntendedMarriageDetails.officiantOrganisation'
      ]),
      label: {
        defaultMessage: 'Affiliation / Organisation',
        description: 'Label for officiant affiliation or organisation field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.field.officiantAffiliation.label'
      }
    },

    // Divider
    {
      id: 'marriageDetails.divider.3',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },

    // Bridegroom Header
    {
      id: 'marriageDetails.bridegroomHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Bridegroom's details",
        description: 'Header label for bridegroom details',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.header.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    // Given name(s) and Surname — full name field
    {
      id: 'marriageDetails.bridegroomName',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.name'
      ]),
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for given name(s)',
              id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for surname field',
              id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.surname.label'
            }
          }
        }
      },
      label: {
        defaultMessage: 'Bridegroom name',
        description: 'Hidden main label for name field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.name.label'
      },
      validation: [invalidNameValidator('marriageDetails.bridegroomName')]
    },

    // Date of birth
    {
      id: 'marriageDetails.bridegroomDob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.dob'
      ]),
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for date of birth field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.dateOfBirth.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date before today',
            description: 'Error shown if DOB is in the future',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.dateOfBirth.error'
          },
          validator: field('marriageDetails.bridegroomDob').isBefore().now()
        },
        {
          message: {
            defaultMessage: 'Must be 16 years of age or over',
            description:
              'Error message when person is younger than 16 years old',
            id: 'form.section.minimumAge'
          },
          validator: field('marriageDetails.bridegroomDob')
            .isBefore()
            .days(16 * 365)
            .inPast()
        }
      ]
    },

    // Place of birth
    {
      id: 'marriageDetails.bridegroomPlaceOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.placeOfBirth'
      ]),
      label: {
        defaultMessage: 'Place of birth',
        description: 'Label for place of birth field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.placeOfBirth.label'
      }
    },

    // Occupation
    {
      id: 'marriageDetails.bridegroomOccupation',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.occupation'
      ]),
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for occupation field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.occupation.label'
      }
    },

    // Conjugal status
    {
      id: 'marriageDetails.bridegroomConjugalStatus',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.conjugalStatus'
      ]),
      label: {
        defaultMessage: 'Conjugal status',
        description: 'Label for conjugal status select field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.conjugalStatus.label'
      },
      options: conjugalStatusOptions
    },

    {
      id: 'marriageDetails.bridegroomDateOfDecreeAbsolute',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.dateDecreeAbsolute'
      ]),
      label: {
        defaultMessage: 'Date of decree absolute',
        description: 'Label for date of decree absolute field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.dateOfDecreeAbsolute.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(
            'marriageDetails.bridegroomConjugalStatus'
          ).isEqualTo('DIVORCED')
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Date cannot be in the future',
            description: 'Error when decree absolute date is in the future',
            id: 'validations.noFutureDate'
          },
          validator: field('marriageDetails.bridegroomDateOfDecreeAbsolute')
            .isBefore()
            .now()
        }
      ]
    },

    // Date of death of former wife (Show if Widower)
    {
      id: 'marriageDetails.bridegroomDateOfDeathFormerWife',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.dateDeathFormerWife'
      ]),
      label: {
        defaultMessage: 'Date of death of former wife',
        description: 'Label for date of death of former wife field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.dateOfDeathFormerWife.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field(
            'marriageDetails.bridegroomConjugalStatus'
          ).isEqualTo('WIDOWER')
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Date cannot be in the future',
            description: 'Error when decree absolute date is in the future',
            id: 'validations.noFutureDate'
          },
          validator: field('marriageDetails.bridegroomDateOfDeathFormerWife')
            .isBefore()
            .now()
        }
      ]
    },
    // Residence Header
    {
      id: 'marriageDetails.bridegroomResidenceHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Header for residence section',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.residenceHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    // Address (includes Country, Island, District, Village, City/Town)
    {
      id: 'marriageDetails.bridegroomAddress',
      type: FieldType.ADDRESS,
      hideLabel: true,
      required: true,
      analytics: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'Label for residence address field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bridegroom.field.address.label'
      },
      defaultValue: {
        country: 'COK',
        addressType: 'DOMESTIC',
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      },
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'brideGroom.address'
      ])
    },
    {
      id: 'marriageDetails.brideDivider.1',
      type: FieldType.DIVIDER,
      label: emptyMessage
    },

    // Bride Header
    {
      id: 'marriageDetails.brideHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: "Bride's details",
        description: 'Header label for bride details section',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.header.label'
      },
    },

    // Given name(s) & Surname
    {
      id: 'marriageDetails.brideName',
      type: FieldType.NAME,
      required: true,
      hideLabel: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.name'
      ]),
      configuration: {
        maxLength: MAX_NAME_LENGTH,
        name: {
          firstname: {
            required: true,
            label: {
              defaultMessage: 'Given name(s)',
              description: 'Label for given name(s)',
              id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.firstname.label'
            }
          },
          surname: {
            required: true,
            label: {
              defaultMessage: 'Surname',
              description: 'Label for surname field',
              id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.surname.label'
            }
          }
        }
      },
      label: {
        defaultMessage: 'Bride name',
        description: 'Hidden main label for name field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.name.label'
      },
      validation: [invalidNameValidator('marriageDetails.brideName')]
    },

    // Date of birth
    {
      id: 'marriageDetails.brideDob',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.dob'
      ]),
      label: {
        defaultMessage: 'Date of birth',
        description: 'Label for date of birth field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.dateOfBirth.label'
      },
      validation: [
        {
          message: {
            defaultMessage: 'Must be a valid date before today',
            description: 'Error shown if DOB is in the future',
            id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.dateOfBirth.error'
          },
          validator: field('marriageDetails.brideDob').isBefore().now()
        },
        {
          message: {
            defaultMessage: 'Must be 16 years of age or over',
            description:
              'Error message when person is younger than 16 years old',
            id: 'form.section.minimumAge'
          },
          validator: field('marriageDetails.brideDob')
            .isBefore()
            .days(16 * 365)
            .inPast()
        }
      ]
    },

    // Place of birth
    {
      id: 'marriageDetails.bridePlaceOfBirth',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.placeOfBirth'
      ]),
      label: {
        defaultMessage: 'Place of birth',
        description: 'Label for place of birth field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.placeOfBirth.label'
      }
    },

    // Occupation
    {
      id: 'marriageDetails.brideOccupation',
      type: FieldType.TEXT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.occupation'
      ]),
      label: {
        defaultMessage: 'Occupation',
        description: 'Label for occupation field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.occupation.label'
      }
    },

    // Conjugal status
    {
      id: 'marriageDetails.brideConjugalStatus',
      type: FieldType.SELECT,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.conjugalStatus'
      ]),
      label: {
        defaultMessage: 'Conjugal status',
        description: 'Label for conjugal status select field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.conjugalStatus.label'
      },
      options: conjugalStatusOptionsFemale
    },

    // Date of decree absolute
    {
      id: 'marriageDetails.brideDateOfDecreeAbsolute',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.dateOfDecreeAbsolute'
      ]),
      label: {
        defaultMessage: 'Date of decree absolute',
        description: 'Label for date of decree absolute field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.dateOfDecreeAbsolute.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('marriageDetails.brideConjugalStatus').isEqualTo(
            'DIVORCED'
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Date cannot be in the future',
            description: 'Error when decree absolute date is in the future',
            id: 'validations.noFutureDate'
          },
          validator: field('marriageDetails.brideDateOfDecreeAbsolute')
            .isBefore()
            .now()
        }
      ]
    },

    // Date of death of former husband
    {
      id: 'marriageDetails.brideDateOfDeathFormerHusband',
      type: FieldType.DATE,
      required: true,
      analytics: true,
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.dateOfDeathOfFormerHusband'
      ]),
      label: {
        defaultMessage: 'Date of death of former husband',
        description: 'Label for date of death of former husband field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.dateOfDeathFormerHusband.label'
      },
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: field('marriageDetails.brideConjugalStatus').isEqualTo(
            'WIDOW'
          )
        }
      ],
      validation: [
        {
          message: {
            defaultMessage: 'Date cannot be in the future',
            description: 'Error when decree absolute date is in the future',
            id: 'validations.noFutureDate'
          },
          validator: field('marriageDetails.brideDateOfDeathFormerHusband')
            .isBefore()
            .now()
        }
      ]
    },
    // Residence Header
    {
      id: 'marriageDetails.brideResidenceHeader',
      type: FieldType.HEADING,
      label: {
        defaultMessage: 'Usual residence',
        description: 'Header label for residence section',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.residenceHeader.label'
      },
      configuration: { styles: { fontVariant: 'h3' } }
    },

    // Address (includes Country, Island, District, Village, City / Town)
    {
      id: 'marriageDetails.brideAddress',
      type: FieldType.ADDRESS,
      required: true,
      analytics: true,
      hideLabel: true,
      label: {
        defaultMessage: 'Place of residence',
        description: 'Label for residence address field',
        id: 'event.marriageRegistration.action.declare.form.marriageDetails.bride.field.address.label'
      },
      defaultValue: {
        country: 'COK',
        addressType: 'DOMESTIC',
        administrativeArea: user('primaryOfficeId').locationLevel('district')
      },
      configuration: {
        streetAddressForm: defaultStreetAddressConfiguration
      },
      parent: field('marriageDetails.licenceDetailsSearch'),
      value: field('marriageDetails.licenceDetailsSearch').getByPath([
        'data',
        'firstResult',
        'declaration',
        'bride.address'
      ])
    }
  ]
})
